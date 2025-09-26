"""
User Management Schemas for Admin Panel
Pydantic models for user, role, and permission operations
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, validator

# ============================================================================
# USER SCHEMAS
# ============================================================================

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    email: EmailStr = Field(..., description="Email address")
    full_name: Optional[str] = Field(None, max_length=255, description="Full name")
    phone: Optional[str] = Field(None, max_length=20, description="Phone number")

class UserCreateRequest(UserBase):
    password: str = Field(..., min_length=6, description="Password")
    status: str = Field("active", description="User status")
    role_id: int = Field(..., description="Role ID")
    is_super_admin: bool = Field(False, description="Super admin flag")
    
    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ['active', 'pending', 'suspended', 'banned']
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v

class UserUpdateRequest(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    password: Optional[str] = Field(None, min_length=6)
    status: Optional[str] = None
    role_id: Optional[int] = None
    is_super_admin: Optional[bool] = None
    avatar_url: Optional[str] = None
    
    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ['active', 'pending', 'suspended', 'banned']
            if v not in allowed_statuses:
                raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v

class RoleInfo(BaseModel):
    id: int
    name: str
    display_name: str
    description: Optional[str] = None

class UserResponse(UserBase):
    id: int
    avatar_url: Optional[str] = None
    status: str
    is_super_admin: bool
    role: Optional[RoleInfo] = None
    permissions: List[str] = []
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class UserStatsResponse(BaseModel):
    total_users: int
    active_users: int
    pending_users: int
    suspended_users: int
    banned_users: int
    recent_registrations: int
    role_distribution: Dict[str, int]

# ============================================================================
# ROLE SCHEMAS
# ============================================================================

class PermissionInfo(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    resource: str
    action: str

class RoleBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50, description="Role name")
    display_name: str = Field(..., min_length=2, max_length=100, description="Display name")
    description: Optional[str] = Field(None, max_length=500, description="Role description")

class RoleCreateRequest(RoleBase):
    permission_ids: Optional[List[int]] = Field([], description="Permission IDs to assign")

class RoleUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    display_name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    permission_ids: Optional[List[int]] = None

class RoleResponse(RoleBase):
    id: int
    is_system_role: bool
    permissions: List[PermissionInfo] = []
    user_count: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class RoleListResponse(BaseModel):
    roles: List[RoleResponse]

# ============================================================================
# PERMISSION SCHEMAS
# ============================================================================

class PermissionResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    resource: str
    action: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class PermissionListResponse(BaseModel):
    permissions: List[PermissionResponse]
    grouped_permissions: Dict[str, List[PermissionResponse]]

# ============================================================================
# COMMON SCHEMAS
# ============================================================================

class ApiResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Dict[str, Any]] = None