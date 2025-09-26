"""
Configuration module for Backend API
Quản lý cấu hình cho Backend API
"""

import os
import json
from typing import List, Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ENVIRONMENT: str = "development"
    
    # Database settings
    DATABASE_URL: str = "sqlite:///./database.db"
    DATABASE_ECHO: bool = False
    
    # CORS settings
    CORS_ORIGINS: str = '["*"]'  # JSON string format
    
    # JWT settings
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # File upload settings
    UPLOAD_DIR: str = "static/uploads"
    MAX_FILE_SIZE: int = 10485760  # 10MB
    ALLOWED_EXTENSIONS: str = '["jpg","jpeg","png","gif","webp"]'  # JSON string format
    
    # Admin settings
    ADMIN_EMAIL: str = "admin@minhha.com"
    ADMIN_PASSWORD: str = "admin123"
    
    # Store info
    STORE_NAME: str = "Cửa Hàng Minh Hà"
    STORE_HOTLINE: str = "0974.876.168"
    STORE_ADDRESS: str = "417 Ngô Gia Tự, Hải An, Hải Phòng"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from JSON string"""
        try:
            origins = json.loads(self.CORS_ORIGINS)
            return origins if isinstance(origins, list) else ["*"]
        except:
            return ["*"]
    
    @property
    def allowed_extensions_list(self) -> List[str]:
        """Parse allowed extensions from JSON string"""
        try:
            extensions = json.loads(self.ALLOWED_EXTENSIONS)
            return extensions if isinstance(extensions, list) else ["jpg","jpeg","png","gif","webp"]
        except:
            return ["jpg","jpeg","png","gif","webp"]

def get_settings() -> Settings:
    """Get application settings"""
    return Settings()

def get_cors_origins() -> List[str]:
    """
    Get CORS origins based on environment
    Tự động phát hiện và cấu hình CORS origins
    """
    settings = get_settings()
    
    # Base origins
    origins = []
    
    # Development origins
    if settings.ENVIRONMENT == "development":
        origins.extend([
            "http://localhost:3000",
            "http://localhost:12000", 
            "http://localhost:12001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:12000",
            "http://127.0.0.1:12001",
        ])
        
        # Add OpenHands runtime URLs
        origins.extend([
            "https://work-1-huysglptbcssgdhx.prod-runtime.all-hands.dev",
            "https://work-2-huysglptbcssgdhx.prod-runtime.all-hands.dev"
        ])
        
        # Auto-detect local IP
        try:
            import socket
            hostname = socket.gethostname()
            local_ip = socket.gethostbyname(hostname)
            origins.extend([
                f"http://{local_ip}:3000",
                f"http://{local_ip}:12000",
                f"http://{local_ip}:12001"
            ])
        except:
            pass
    
    # Add configured origins
    origins.extend(settings.cors_origins_list)
    
    # Remove duplicates and return
    return list(set(origins))

# Global settings instance
settings = get_settings()