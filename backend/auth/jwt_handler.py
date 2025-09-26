"""
JWT Token Handler for Admin Panel Authentication
Handles JWT token creation, validation, and refresh
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key-change-in-production-hpt-pttn-7686")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class JWTHandler:
    """JWT Token Handler Class"""
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """
        Create JWT access token
        
        Args:
            data: Payload data to encode
            expires_delta: Custom expiration time
            
        Returns:
            JWT token string
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "access"
        })
        
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        """
        Create JWT refresh token
        
        Args:
            data: Payload data to encode
            
        Returns:
            JWT refresh token string
        """
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "refresh"
        })
        
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[Dict[str, Any]]:
        """
        Verify and decode JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded payload or None if invalid
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify password against hash
        
        Args:
            plain_password: Plain text password
            hashed_password: Hashed password
            
        Returns:
            True if password matches
        """
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """
        Hash password
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password
        """
        return pwd_context.hash(password)
    
    @staticmethod
    def create_password_reset_token(email: str) -> str:
        """
        Create password reset token
        
        Args:
            email: User email
            
        Returns:
            Password reset token
        """
        expire = datetime.now(timezone.utc) + timedelta(hours=1)  # 1 hour expiry
        to_encode = {
            "email": email,
            "exp": expire,
            "iat": datetime.now(timezone.utc),
            "type": "password_reset"
        }
        
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_password_reset_token(token: str) -> Optional[str]:
        """
        Verify password reset token and return email
        
        Args:
            token: Password reset token
            
        Returns:
            Email if token is valid, None otherwise
        """
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("type") != "password_reset":
                return None
            return payload.get("email")
        except JWTError:
            return None

class TokenData:
    """Token data structure"""
    
    def __init__(self, user_id: int, username: str, email: str, role: str, 
                 is_super_admin: bool = False, permissions: list = None):
        self.user_id = user_id
        self.username = username
        self.email = email
        self.role = role
        self.is_super_admin = is_super_admin
        self.permissions = permissions or []
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JWT payload"""
        return {
            "user_id": self.user_id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "is_super_admin": self.is_super_admin,
            "permissions": self.permissions
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TokenData":
        """Create TokenData from dictionary"""
        return cls(
            user_id=data.get("user_id"),
            username=data.get("username"),
            email=data.get("email"),
            role=data.get("role"),
            is_super_admin=data.get("is_super_admin", False),
            permissions=data.get("permissions", [])
        )