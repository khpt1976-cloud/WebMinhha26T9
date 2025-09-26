"""
User Management Models for Admin Panel
Handles users, roles, permissions and authentication
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from passlib.context import CryptContext
import enum

# Import Base from database module
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import Base

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserStatus(enum.Enum):
    """User account status"""
    PENDING = "pending"      # Chờ duyệt
    ACTIVE = "active"        # Đã kích hoạt
    SUSPENDED = "suspended"  # Bị tạm khóa
    BANNED = "banned"        # Bị cấm

# Association table for many-to-many relationship between roles and permissions
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True),
    Column('permission_id', Integer, ForeignKey('permissions.id'), primary_key=True)
)

class Permission(Base):
    """
    Permissions table - Defines what actions can be performed
    """
    __tablename__ = "permissions"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    resource = Column(String(50), nullable=False)  # users, products, categories, settings
    action = Column(String(50), nullable=False)    # create, read, update, delete, approve
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")

class Role(Base):
    """
    Roles table - Groups of permissions
    """
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_system_role = Column(Boolean, default=False)  # System roles cannot be deleted
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="role")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")

class User(Base):
    """
    Users table - Main user accounts
    """
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    
    # Status and permissions
    status = Column(String(20), default=UserStatus.PENDING.value, nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    is_super_admin = Column(Boolean, default=False)  # Super admin flag
    
    # Profile information
    phone = Column(String(20), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    
    # Authentication
    last_login = Column(DateTime(timezone=True), nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True), nullable=True)
    
    # Password reset
    reset_token = Column(String(255), nullable=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    role = relationship("Role", back_populates="users")
    approver = relationship("User", remote_side=[id])
    
    def verify_password(self, password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(password, self.hashed_password)
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password"""
        return pwd_context.hash(password)
    
    def has_permission(self, resource: str, action: str) -> bool:
        """Check if user has specific permission"""
        if self.is_super_admin:
            return True
            
        for permission in self.role.permissions:
            if permission.resource == resource and permission.action == action:
                return True
        return False
    
    def is_active(self) -> bool:
        """Check if user account is active"""
        return self.status == UserStatus.ACTIVE.value
    
    def is_pending_approval(self) -> bool:
        """Check if user is pending approval"""
        return self.status == UserStatus.PENDING.value

class RolePermission(Base):
    """
    Explicit role-permission mapping table for additional metadata
    """
    __tablename__ = "role_permission_mappings"
    
    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    permission_id = Column(Integer, ForeignKey("permissions.id"), nullable=False)
    granted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    granted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    role = relationship("Role")
    permission = relationship("Permission")
    granter = relationship("User")