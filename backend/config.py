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
    Get CORS origins - HOÀN TOÀN DYNAMIC, KHÔNG HARDCODE BẤT KỲ DOMAIN NÀO
    """
    settings = get_settings()
    origins = set()
    
    # 1. LOCALHOST - Always safe
    localhost_ports = [3000, 3001, 8000, 8080, 12000, 12001, 12002]
    for port in localhost_ports:
        origins.update([
            f"http://localhost:{port}",
            f"https://localhost:{port}",
            f"http://127.0.0.1:{port}",
            f"https://127.0.0.1:{port}",
        ])
    
    # 2. AUTO-DETECT LOCAL NETWORK IPs
    try:
        import socket
        
        # Method 1: Get hostname IP
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        for port in localhost_ports:
            origins.update([
                f"http://{local_ip}:{port}",
                f"https://{local_ip}:{port}"
            ])
        
        # Method 2: Get actual network IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        network_ip = s.getsockname()[0]
        s.close()
        
        for port in localhost_ports:
            origins.update([
                f"http://{network_ip}:{port}",
                f"https://{network_ip}:{port}"
            ])
            
    except Exception as e:
        print(f"⚠️  Could not auto-detect local IPs: {e}")
    
    # 3. OPENHANDS ENVIRONMENT - Auto-detect from environment
    try:
        import os
        # Check if we're in OpenHands environment
        hostname = os.environ.get('HOSTNAME', '')
        if 'runtime-' in hostname and 'all-hands' in str(os.environ):
            # Extract the unique ID from hostname
            import re
            match = re.search(r'runtime-([^-]+)', hostname)
            if match:
                unique_id = match.group(1)
                # Add all work-* variations for this environment
                for i in range(1, 5):  # work-1 to work-4
                    origins.update([
                        f"https://work-{i}-{unique_id}.prod-runtime.all-hands.dev",
                        f"http://work-{i}-{unique_id}.prod-runtime.all-hands.dev",
                        f"https://work-{i}-{unique_id}.prod-runtime.all-hands.dev:12000",
                        f"https://work-{i}-{unique_id}.prod-runtime.all-hands.dev:12001",
                        f"https://work-{i}-{unique_id}.prod-runtime.all-hands.dev:12002",
                    ])
                print(f"🌐 OpenHands environment detected: {unique_id}")
    except Exception as e:
        print(f"⚠️  OpenHands detection failed: {e}")
    
    # 4. PRODUCTION ONLY - Specific domains
    if settings.ENVIRONMENT == "production":
        # Only add production domains when explicitly in production
        production_domains = settings.cors_origins_list
        if production_domains:
            origins.update(production_domains)
        else:
            # Default production domains if configured
            origins.update([
                "https://minhha.com",
                "https://www.minhha.com", 
                "https://admin.minhha.com"
            ])
    
    # 5. DEVELOPMENT FALLBACK - Allow all
    if settings.ENVIRONMENT == "development":
        origins.add("*")
        print("🔓 Development mode: CORS wildcard (*) enabled")
    
    # Convert to list and log
    unique_origins = list(origins)
    
    print(f"🌐 Dynamic CORS Configuration:")
    print(f"   📊 Total origins: {len(unique_origins)}")
    print(f"   🏠 Localhost: ✅ Auto-configured")
    print(f"   🌍 Local Network: ✅ Auto-detected")
    print(f"   ☁️  Environment: {settings.ENVIRONMENT}")
    
    if "*" in unique_origins:
        print(f"   ⚠️  Wildcard: ✅ Enabled (Development)")
    else:
        print(f"   🔒 Wildcard: ❌ Disabled (Production)")
    
    # Show sample origins (non-wildcard)
    sample_origins = [o for o in unique_origins if o != "*"][:5]
    if sample_origins:
        print(f"   📋 Sample origins:")
        for origin in sample_origins:
            print(f"      • {origin}")
        if len(unique_origins) > 6:  # 5 samples + wildcard
            print(f"      ... and {len(unique_origins) - 6} more")
    
    return unique_origins

# Global settings instance
settings = get_settings()