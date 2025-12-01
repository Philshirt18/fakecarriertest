from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID


class ScanRequest(BaseModel):
    sender: EmailStr
    headers: str = Field(..., max_length=50000)
    body: str = Field(..., max_length=500000)


class ScanResponse(BaseModel):
    risk_level: str  # "low" | "medium" | "high"
    score: int = Field(..., ge=0, le=100)
    summary: List[str]
    signals: Dict[str, Any]
    recommendations: List[str]


class ReportRequest(BaseModel):
    sender: EmailStr
    headers: str = Field(..., max_length=50000)
    body: str = Field(..., max_length=500000)
    user_comment: Optional[str] = Field(None, max_length=5000)


class ReportResponse(BaseModel):
    ok: bool
    report_id: UUID


class ScanListItem(BaseModel):
    id: UUID
    sender: str
    from_domain: str
    score: int
    risk_level: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ReportListItem(BaseModel):
    id: UUID
    sender: str
    from_domain: str
    user_comment: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    total_scans: int
    total_reports: int
    risk_distribution: Dict[str, int]
    top_domains: List[Dict[str, Any]]
