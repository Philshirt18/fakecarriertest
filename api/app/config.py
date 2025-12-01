from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    database_url: str = "postgresql://fakecarrier:fakecarrier_pass@localhost:5432/fakecarrier"
    admin_token: str = "change_this_secure_token_in_production"
    privacy_mode: bool = False
    domain_age_provider: Optional[str] = None
    
    # AI Enhancement
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-2.0-flash-exp"
    
    # Content limits
    max_header_size: int = 50000  # 50KB
    max_body_size: int = 500000   # 500KB
    
    class Config:
        env_file = ".env"


settings = Settings()
