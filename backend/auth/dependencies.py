"""
FastAPI Dependencies for Authentication and Authorization
Handles JWT token validation, user authentication, and permission checking
"""

from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
from models.user_models import User, UserStatus
from models.audit_models import AuditLog, LoginAttempt
from auth.jwt_handler import JWTHandler, TokenData

# Security scheme
security = HTTPBearer()

class AuthDependencies:
    """Authentication and Authorization Dependencies"""
    
    @staticmethod
    def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security),
        db: Session = Depends(get_db)
    ) -> User:
        """
        Get current authenticated user from JWT token
        
        Args:
            credentials: JWT token from Authorization header
            db: Database session
            
        Returns:
            Current user object
            
        Raises:
            HTTPException: If token is invalid or user not found
        """
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
        # Verify token
        payload = JWTHandler.verify_token(credentials.credentials)
        if payload is None:
            raise credentials_exception
        
        # Check token type
        if payload.get("type") != "access":
            raise credentials_exception
        
        # Get user ID from payload
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
        
        # Get user from database
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise credentials_exception
        
        # Check if user is active
        if not user.is_active():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is not active"
            )
        
        return user
    
    @staticmethod
    def get_current_active_user(
        current_user: User = Depends(get_current_user)
    ) -> User:
        """
        Get current active user (additional check)
        
        Args:
            current_user: Current user from get_current_user
            
        Returns:
            Current active user
            
        Raises:
            HTTPException: If user is not active
        """
        if current_user.status != UserStatus.ACTIVE.value:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is not active"
            )
        return current_user
    
    @staticmethod
    def require_super_admin(
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        """
        Require super admin privileges
        
        Args:
            current_user: Current active user
            
        Returns:
            Current user if super admin
            
        Raises:
            HTTPException: If user is not super admin
        """
        if not current_user.is_super_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super admin privileges required"
            )
        return current_user
    
    @staticmethod
    def require_permission(resource: str, action: str):
        """
        Create dependency that requires specific permission
        
        Args:
            resource: Resource name (users, products, etc.)
            action: Action name (create, read, update, delete)
            
        Returns:
            Dependency function
        """
        def permission_dependency(
            current_user: User = Depends(AuthDependencies.get_current_active_user)
        ) -> User:
            # Super admin has all permissions
            if current_user.is_super_admin:
                return current_user
            
            # Check if user has the required permission
            if not current_user.has_permission(resource, action):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission denied: {resource}.{action}"
                )
            
            return current_user
        
        return permission_dependency
    
    @staticmethod
    def require_any_permission(permissions: List[tuple]):
        """
        Create dependency that requires any of the specified permissions
        
        Args:
            permissions: List of (resource, action) tuples
            
        Returns:
            Dependency function
        """
        def permission_dependency(
            current_user: User = Depends(AuthDependencies.get_current_active_user)
        ) -> User:
            # Super admin has all permissions
            if current_user.is_super_admin:
                return current_user
            
            # Check if user has any of the required permissions
            for resource, action in permissions:
                if current_user.has_permission(resource, action):
                    return current_user
            
            permission_names = [f"{r}.{a}" for r, a in permissions]
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: requires one of {permission_names}"
            )
        
        return permission_dependency
    
    @staticmethod
    def get_optional_user(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
        db: Session = Depends(get_db)
    ) -> Optional[User]:
        """
        Get current user if token is provided (optional authentication)
        
        Args:
            credentials: Optional JWT token
            db: Database session
            
        Returns:
            Current user or None if not authenticated
        """
        if not credentials:
            return None
        
        try:
            payload = JWTHandler.verify_token(credentials.credentials)
            if payload is None or payload.get("type") != "access":
                return None
            
            user_id = payload.get("user_id")
            if user_id is None:
                return None
            
            user = db.query(User).filter(User.id == user_id).first()
            if user and user.is_active():
                return user
            
        except Exception:
            pass
        
        return None

# Convenience dependencies for common permissions
def get_require_user_read():
    return AuthDependencies.require_permission("users", "read")

def get_require_user_create():
    return AuthDependencies.require_permission("users", "create")

def get_require_user_update():
    return AuthDependencies.require_permission("users", "update")

def get_require_user_delete():
    return AuthDependencies.require_permission("users", "delete")

def get_require_user_approve():
    return AuthDependencies.require_permission("users", "approve")

def get_require_product_read():
    return AuthDependencies.require_permission("products", "read")

def get_require_product_create():
    return AuthDependencies.require_permission("products", "create")

def get_require_product_update():
    return AuthDependencies.require_permission("products", "update")

def get_require_product_delete():
    return AuthDependencies.require_permission("products", "delete")

def get_require_category_read():
    return AuthDependencies.require_permission("categories", "read")

def get_require_category_create():
    return AuthDependencies.require_permission("categories", "create")

def get_require_category_update():
    return AuthDependencies.require_permission("categories", "update")

def get_require_category_delete():
    return AuthDependencies.require_permission("categories", "delete")

def get_require_settings_read():
    return AuthDependencies.require_permission("settings", "read")

def get_require_settings_update():
    return AuthDependencies.require_permission("settings", "update")

def get_require_dashboard_read():
    return AuthDependencies.require_permission("dashboard", "read")

def get_require_audit_read():
    return AuthDependencies.require_permission("audit", "read")

# Create convenience dependencies
require_user_read = get_require_user_read()
require_user_create = get_require_user_create()
require_user_update = get_require_user_update()
require_user_delete = get_require_user_delete()
require_user_approve = get_require_user_approve()

require_product_read = get_require_product_read()
require_product_create = get_require_product_create()
require_product_update = get_require_product_update()
require_product_delete = get_require_product_delete()

require_category_read = get_require_category_read()
require_category_create = get_require_category_create()
require_category_update = get_require_category_update()
require_category_delete = get_require_category_delete()

require_settings_read = get_require_settings_read()
require_settings_update = get_require_settings_update()

require_dashboard_read = get_require_dashboard_read()
require_audit_read = get_require_audit_read()

# Additional convenience dependencies
require_super_admin = AuthDependencies.require_super_admin

# Simple permission function
def require_permission(permission_string: str):
    """
    Simple permission dependency that takes a permission string like 'users.read'
    """
    resource, action = permission_string.split('.')
    return AuthDependencies.require_permission(resource, action)

# Utility functions
def log_user_activity(
    db: Session,
    user: User,
    action: str,
    resource: str,
    resource_id: Optional[str] = None,
    description: Optional[str] = None,
    old_values: Optional[dict] = None,
    new_values: Optional[dict] = None,
    **kwargs
):
    """
    Log user activity to audit log
    
    Args:
        db: Database session
        user: User performing the action
        action: Action performed
        resource: Resource affected
        resource_id: ID of affected resource
        description: Description of the action
        old_values: Previous values (for updates)
        new_values: New values (for creates/updates)
        **kwargs: Additional log data
    """
    AuditLog.log_action(
        db,
        user_id=user.id,
        action=action,
        resource=resource,
        resource_id=resource_id,
        description=description,
        old_values=old_values,
        new_values=new_values,
        **kwargs
    )
    db.commit()

def log_login_attempt(
    db: Session,
    username: Optional[str] = None,
    email: Optional[str] = None,
    ip_address: str = "unknown",
    user_agent: Optional[str] = None,
    success: bool = False,
    failure_reason: Optional[str] = None,
    user_id: Optional[int] = None
):
    """
    Log login attempt
    
    Args:
        db: Database session
        username: Username attempted
        email: Email attempted
        ip_address: Client IP address
        user_agent: Client user agent
        success: Whether login was successful
        failure_reason: Reason for failure if unsuccessful
        user_id: User ID if successful
    """
    login_attempt = LoginAttempt(
        username=username,
        email=email,
        ip_address=ip_address,
        user_agent=user_agent,
        success="success" if success else "failure",
        failure_reason=failure_reason,
        user_id=user_id
    )
    db.add(login_attempt)
    db.commit()