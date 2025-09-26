"""
Pydantic schemas for authentication and authorization
Request/Response models for login, registration, password reset, etc.
"""

from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime

class LoginRequest(BaseModel):
    """Login request schema"""
    username: str = Field(..., min_length=3, max_length=50, description="Username or email")
    password: str = Field(..., min_length=6, description="Password")
    remember_me: bool = Field(default=False, description="Remember login for longer period")

class LoginResponse(BaseModel):
    """Login response schema"""
    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user: "UserInfo" = Field(..., description="User information")

class RefreshTokenRequest(BaseModel):
    """Refresh token request schema"""
    refresh_token: str = Field(..., description="JWT refresh token")

class RefreshTokenResponse(BaseModel):
    """Refresh token response schema"""
    access_token: str = Field(..., description="New JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    expires_in: int = Field(..., description="Token expiration time in seconds")

class PasswordResetRequest(BaseModel):
    """Password reset request schema"""
    email: EmailStr = Field(..., description="User email address")

class PasswordResetConfirm(BaseModel):
    """Password reset confirmation schema"""
    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=6, description="New password")
    confirm_password: str = Field(..., min_length=6, description="Confirm new password")
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

class ChangePasswordRequest(BaseModel):
    """Change password request schema"""
    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=6, description="New password")
    confirm_password: str = Field(..., min_length=6, description="Confirm new password")
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

class UserRegistrationRequest(BaseModel):
    """User registration request schema"""
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(..., description="Email address")
    full_name: str = Field(..., min_length=2, max_length=255, description="Full name")
    password: str = Field(..., min_length=6, description="Password")
    confirm_password: str = Field(..., min_length=6, description="Confirm password")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('username')
    def username_alphanumeric(cls, v):
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username must contain only letters, numbers, hyphens, and underscores')
        return v

class UserApprovalRequest(BaseModel):
    """User approval request schema"""
    user_id: int = Field(..., description="User ID to approve")
    approved: bool = Field(..., description="Whether to approve or reject")
    role_id: Optional[int] = Field(None, description="Role to assign to user")
    notes: Optional[str] = Field(None, max_length=500, description="Approval notes")

class RoleInfo(BaseModel):
    """Role information schema"""
    id: int
    name: str
    display_name: str
    description: Optional[str] = None
    is_system_role: bool = False

class PermissionInfo(BaseModel):
    """Permission information schema"""
    id: int
    name: str
    description: Optional[str] = None
    resource: str
    action: str

class UserInfo(BaseModel):
    """User information schema"""
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    status: str
    is_super_admin: bool = False
    role: RoleInfo
    permissions: List[str] = []
    last_login: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserProfile(BaseModel):
    """User profile schema for updates"""
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    avatar_url: Optional[str] = Field(None, max_length=500)

class AuthStatus(BaseModel):
    """Authentication status schema"""
    authenticated: bool = Field(..., description="Whether user is authenticated")
    user: Optional[UserInfo] = Field(None, description="User information if authenticated")
    permissions: List[str] = Field(default=[], description="User permissions")

class LogoutResponse(BaseModel):
    """Logout response schema"""
    message: str = Field(default="Successfully logged out", description="Logout message")

class ApiResponse(BaseModel):
    """Generic API response schema"""
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Response message")
    data: Optional[dict] = Field(None, description="Response data")

class ErrorResponse(BaseModel):
    """Error response schema"""
    success: bool = Field(default=False, description="Always false for errors")
    message: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Error code")
    details: Optional[dict] = Field(None, description="Error details")

# Update forward references
LoginResponse.model_rebuild()
AuthStatus.model_rebuild()