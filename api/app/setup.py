"""
First-time setup functionality for FakeCarrier
"""
import os
from pathlib import Path
from typing import Optional


class SetupManager:
    """Manages first-time setup and configuration"""
    
    SETUP_COMPLETE_FILE = Path("/app/.setup_complete")
    ENV_FILE = Path("/app/.env")
    
    @classmethod
    def is_setup_complete(cls) -> bool:
        """Check if initial setup has been completed"""
        # If ADMIN_TOKEN is set and not default, setup is complete
        admin_token = os.getenv("ADMIN_TOKEN", "")
        if admin_token and admin_token not in ["1234", "change_this_secure_token_in_production"]:
            return True
        
        # Check for setup complete marker file
        return cls.SETUP_COMPLETE_FILE.exists()
    
    @classmethod
    def complete_setup(cls, admin_token: str, gemini_api_key: Optional[str] = None) -> bool:
        """
        Complete the initial setup by saving configuration
        
        Note: In production, this should update environment variables
        through your deployment platform's API or secrets manager.
        For Docker, this creates a marker file and requires restart.
        """
        try:
            # Create marker file
            cls.SETUP_COMPLETE_FILE.parent.mkdir(parents=True, exist_ok=True)
            cls.SETUP_COMPLETE_FILE.write_text(f"ADMIN_TOKEN={admin_token}\n")
            
            # In a real deployment, you would:
            # 1. Update secrets manager (AWS Secrets Manager, etc.)
            # 2. Update Kubernetes secrets
            # 3. Update cloud platform environment variables
            # 4. Trigger container restart
            
            return True
        except Exception as e:
            print(f"Setup error: {e}")
            return False
    
    @classmethod
    def get_setup_instructions(cls) -> dict:
        """Get platform-specific setup instructions"""
        return {
            "docker": "Set ADMIN_TOKEN environment variable and restart: docker compose restart api",
            "kubernetes": "Update secret: kubectl create secret generic fakecarrier --from-literal=admin-token=YOUR_TOKEN",
            "heroku": "Set config: heroku config:set ADMIN_TOKEN=YOUR_TOKEN",
            "aws": "Update ECS task definition environment variables",
            "gcp": "Update Cloud Run environment: gcloud run services update --set-env-vars ADMIN_TOKEN=YOUR_TOKEN",
        }
