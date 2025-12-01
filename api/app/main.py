from fastapi import FastAPI, Depends, HTTPException, Header, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel
import csv
import io
import logging
import secrets
import hashlib
from pathlib import Path

from app.database import get_db
from app.models import Scan, Report, AdminPassword
from app.schemas import (
    ScanRequest, ScanResponse, ReportRequest, ReportResponse,
    ScanListItem, ReportListItem, StatsResponse
)
from app.scoring.engine import ScoringEngine
from app.config import settings
from app.setup import SetupManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FakeCarrier API",
    description="Email impersonation and phishing risk detection",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize scoring engine
scoring_engine = ScoringEngine()

# Mount static files for logo
static_path = Path(__file__).parent / "static"
if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")


def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == password_hash


def get_admin_password(db: Session) -> Optional[AdminPassword]:
    """Get admin password from database"""
    return db.query(AdminPassword).filter(AdminPassword.id == 1).first()


def verify_admin_token(x_admin_token: Optional[str] = Header(None)):
    """Verify admin token from header"""
    if not x_admin_token or x_admin_token != settings.admin_token:
        raise HTTPException(status_code=403, detail="Invalid or missing admin token")
    return True


def truncate_content(content: str, max_length: int = 1000) -> str:
    """Truncate content for privacy mode"""
    if len(content) <= max_length:
        return content
    return content[:max_length] + "... [truncated]"


class SetupRequest(BaseModel):
    admin_token: str
    gemini_api_key: Optional[str] = None


class PasswordSetRequest(BaseModel):
    password: str


class PasswordLoginRequest(BaseModel):
    password: str


@app.get("/")
async def root(db: Session = Depends(get_db)):
    admin_pwd = get_admin_password(db)
    return {
        "message": "FakeCarrier API",
        "version": "1.0.0",
        "setup_required": not SetupManager.is_setup_complete(),
        "password_set": admin_pwd is not None
    }


@app.post("/admin/password/set")
async def set_admin_password(request: PasswordSetRequest, db: Session = Depends(get_db)):
    """Set or update admin password"""
    if not request.password or len(request.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")
    
    admin_pwd = get_admin_password(db)
    password_hash = hash_password(request.password)
    
    if admin_pwd:
        # Update existing password
        admin_pwd.password_hash = password_hash
        admin_pwd.updated_at = datetime.utcnow()
    else:
        # Create new password
        admin_pwd = AdminPassword(id=1, password_hash=password_hash)
        db.add(admin_pwd)
    
    db.commit()
    return {"message": "Password set successfully"}


@app.post("/admin/password/login")
async def login_admin(request: PasswordLoginRequest, db: Session = Depends(get_db)):
    """Verify admin password"""
    admin_pwd = get_admin_password(db)
    
    if not admin_pwd:
        raise HTTPException(status_code=404, detail="No password set. Please set a password first.")
    
    if not verify_password(request.password, admin_pwd.password_hash):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    return {"message": "Login successful", "authenticated": True}


@app.get("/setup/status")
async def setup_status():
    """Check if initial setup is required"""
    return {
        "setup_complete": SetupManager.is_setup_complete(),
        "instructions": SetupManager.get_setup_instructions() if not SetupManager.is_setup_complete() else None
    }


@app.post("/setup/complete")
async def complete_setup(setup: SetupRequest):
    """
    Complete initial setup (for first-time deployment)
    
    Note: This endpoint is only for guidance. In production, set environment
    variables through your deployment platform (Docker, Kubernetes, cloud provider).
    """
    if SetupManager.is_setup_complete():
        raise HTTPException(status_code=400, detail="Setup already completed")
    
    # Validate token
    if len(setup.admin_token) < 8:
        raise HTTPException(status_code=400, detail="Admin token must be at least 8 characters")
    
    # Save setup marker
    success = SetupManager.complete_setup(setup.admin_token, setup.gemini_api_key)
    
    if success:
        return {
            "success": True,
            "message": "Setup marker created. Please set environment variables and restart the service.",
            "instructions": SetupManager.get_setup_instructions(),
            "next_steps": [
                "1. Set ADMIN_TOKEN environment variable to your chosen token",
                "2. Optionally set GEMINI_API_KEY for AI features",
                "3. Restart the API service: docker compose restart api",
                "4. Access admin dashboard with your new token"
            ]
        }
    else:
        raise HTTPException(status_code=500, detail="Failed to complete setup")


@app.post("/setup/generate-token")
async def generate_token():
    """Generate a secure random admin token"""
    return {
        "token": secrets.token_hex(32),
        "note": "Save this token securely. You'll need it to access the admin dashboard."
    }


@app.post("/scan", response_model=ScanResponse)
async def scan_email(request: ScanRequest, db: Session = Depends(get_db)):
    """Scan an email for phishing risk"""
    try:
        # Validate input sizes
        if len(request.headers) > settings.max_header_size:
            raise HTTPException(status_code=400, detail="Headers too large")
        if len(request.body) > settings.max_body_size:
            raise HTTPException(status_code=400, detail="Body too large")
        
        # Score the email
        result = await scoring_engine.score_email(
            sender=request.sender,
            headers=request.headers,
            body=request.body
        )
        
        # Store scan result
        from_domain = scoring_engine.header_parser.extract_domain(request.sender)
        
        # Handle privacy mode
        headers_to_store = request.headers
        body_to_store = request.body
        if settings.privacy_mode:
            headers_to_store = truncate_content(request.headers)
            body_to_store = truncate_content(request.body)
        
        scan = Scan(
            sender=request.sender,
            from_domain=from_domain,
            score=result['score'],
            risk_level=result['risk_level'],
            summary=result['summary'],
            signals=result['signals'],
            recommendations=result['recommendations'],
            headers=headers_to_store,
            body=body_to_store
        )
        db.add(scan)
        db.commit()
        
        logger.info(f"Scanned email from {request.sender}: score={result['score']}, risk={result['risk_level']}")
        
        return ScanResponse(**result)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scanning email: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error processing email")


@app.post("/report", response_model=ReportResponse)
async def report_email(request: ReportRequest, db: Session = Depends(get_db)):
    """Report a suspicious email"""
    try:
        # Validate input sizes
        if len(request.headers) > settings.max_header_size:
            raise HTTPException(status_code=400, detail="Headers too large")
        if len(request.body) > settings.max_body_size:
            raise HTTPException(status_code=400, detail="Body too large")
        
        from_domain = scoring_engine.header_parser.extract_domain(request.sender)
        
        # Handle privacy mode
        headers_to_store = request.headers
        body_to_store = request.body
        if settings.privacy_mode:
            headers_to_store = truncate_content(request.headers)
            body_to_store = truncate_content(request.body)
        
        report = Report(
            sender=request.sender,
            from_domain=from_domain,
            user_comment=request.user_comment,
            headers=headers_to_store,
            body=body_to_store
        )
        db.add(report)
        db.commit()
        
        logger.info(f"Report submitted for {request.sender}")
        
        return ReportResponse(ok=True, report_id=report.id)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error reporting email: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error submitting report")


@app.get("/admin/scans", response_model=List[ScanListItem])
async def get_scans(
    risk_level: Optional[str] = Query(None),
    domain: Optional[str] = Query(None),
    days: Optional[int] = Query(None),
    limit: int = Query(100, le=1000),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """Get scans with filters (admin only)"""
    query = db.query(Scan)
    
    if risk_level:
        query = query.filter(Scan.risk_level == risk_level)
    
    if domain:
        query = query.filter(Scan.from_domain.ilike(f"%{domain}%"))
    
    if days:
        cutoff = datetime.utcnow() - timedelta(days=days)
        query = query.filter(Scan.created_at >= cutoff)
    
    scans = query.order_by(desc(Scan.created_at)).limit(limit).offset(offset).all()
    return scans


@app.get("/admin/reports", response_model=List[ReportListItem])
async def get_reports(
    limit: int = Query(100, le=1000),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
    """Get reports (admin only)"""
    reports = db.query(Report).order_by(desc(Report.created_at)).limit(limit).offset(offset).all()
    return reports


@app.get("/admin/stats", response_model=StatsResponse)
async def get_stats(
    db: Session = Depends(get_db)
):
    """Get statistics (admin only)"""
    total_scans = db.query(func.count(Scan.id)).scalar()
    total_reports = db.query(func.count(Report.id)).scalar()
    
    # Risk distribution
    risk_dist = db.query(
        Scan.risk_level,
        func.count(Scan.id)
    ).group_by(Scan.risk_level).all()
    
    risk_distribution = {level: count for level, count in risk_dist}
    
    # Top domains
    top_domains_query = db.query(
        Scan.from_domain,
        func.count(Scan.id).label('count'),
        func.avg(Scan.score).label('avg_score')
    ).group_by(Scan.from_domain).order_by(desc('count')).limit(10).all()
    
    top_domains = [
        {'domain': domain, 'count': count, 'avg_score': round(float(avg_score), 1)}
        for domain, count, avg_score in top_domains_query
    ]
    
    return StatsResponse(
        total_scans=total_scans,
        total_reports=total_reports,
        risk_distribution=risk_distribution,
        top_domains=top_domains
    )


@app.get("/admin/export.csv")
async def export_csv(
    type: str = Query("scans", regex="^(scans|reports)$"),
    db: Session = Depends(get_db)
):
    """Export data as CSV (admin only)"""
    output = io.StringIO()
    
    if type == "scans":
        writer = csv.writer(output)
        writer.writerow(['ID', 'Sender', 'Domain', 'Score', 'Risk Level', 'Created At'])
        
        scans = db.query(Scan).order_by(desc(Scan.created_at)).all()
        for scan in scans:
            writer.writerow([
                str(scan.id),
                scan.sender,
                scan.from_domain,
                scan.score,
                scan.risk_level,
                scan.created_at.isoformat()
            ])
    else:  # reports
        writer = csv.writer(output)
        writer.writerow(['ID', 'Sender', 'Domain', 'Comment', 'Created At'])
        
        reports = db.query(Report).order_by(desc(Report.created_at)).all()
        for report in reports:
            writer.writerow([
                str(report.id),
                report.sender,
                report.from_domain,
                report.user_comment or '',
                report.created_at.isoformat()
            ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={type}.csv"}
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
