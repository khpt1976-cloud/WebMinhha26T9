"""
Authentication API endpoints
Handles login, logout, registration, password reset, and user management
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
from models.user_models import User, Role, UserStatus
from models.audit_models import AuditLog
from auth.jwt_handler import JWTHandler, TokenData, ACCESS_TOKEN_EXPIRE_MINUTES
from auth.dependencies import (
    AuthDependencies, 
    log_user_activity, 
    log_login_attempt,
    require_user_approve,
    require_super_admin
)
from schemas.auth_schemas import (
    LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse,
    PasswordResetRequest, PasswordResetConfirm, ChangePasswordRequest,
    UserRegistrationRequest, UserApprovalRequest, UserInfo, AuthStatus,
    LogoutResponse, ApiResponse, ErrorResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(
    request: Request,
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    User login endpoint
    
    Authenticates user with username/email and password
    Returns JWT access and refresh tokens
    """
    # Get client info
    client_ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    
    # Find user by username or email
    user = db.query(User).filter(
        (User.username == login_data.username) | 
        (User.email == login_data.username)
    ).first()
    
    # Check if user exists and password is correct
    if not user or not user.verify_password(login_data.password):
        # Log failed login attempt
        log_login_attempt(
            db, 
            username=login_data.username,
            ip_address=client_ip,
            user_agent=user_agent,
            success=False,
            failure_reason="invalid_credentials"
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Check if user account is active
    if user.status == UserStatus.PENDING.value:
        log_login_attempt(
            db,
            username=login_data.username,
            ip_address=client_ip,
            user_agent=user_agent,
            success=False,
            failure_reason="account_pending_approval",
            user_id=user.id
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tài khoản đang chờ được phê duyệt"
        )
    
    if user.status in [UserStatus.SUSPENDED.value, UserStatus.BANNED.value]:
        log_login_attempt(
            db,
            username=login_data.username,
            ip_address=client_ip,
            user_agent=user_agent,
            success=False,
            failure_reason=f"account_{user.status}",
            user_id=user.id
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Account is {user.status}"
        )
    
    # Check if account is locked
    if user.locked_until and user.locked_until > datetime.now(timezone.utc):
        log_login_attempt(
            db,
            username=login_data.username,
            ip_address=client_ip,
            user_agent=user_agent,
            success=False,
            failure_reason="account_locked",
            user_id=user.id
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is temporarily locked"
        )
    
    # Get user permissions
    permissions = []
    if user.role:
        permissions = [f"{p.resource}.{p.action}" for p in user.role.permissions]
    
    # Create token data
    token_data = TokenData(
        user_id=user.id,
        username=user.username,
        email=user.email,
        role=user.role.name if user.role else "user",
        is_super_admin=user.is_super_admin,
        permissions=permissions
    )
    
    # Create tokens
    access_token_expires = timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES * (7 if login_data.remember_me else 1)
    )
    access_token = JWTHandler.create_access_token(
        data=token_data.to_dict(),
        expires_delta=access_token_expires
    )
    refresh_token = JWTHandler.create_refresh_token(data=token_data.to_dict())
    
    # Update user login info
    user.last_login = datetime.now(timezone.utc)
    user.failed_login_attempts = 0
    user.locked_until = None
    db.commit()
    
    # Log successful login
    log_login_attempt(
        db,
        username=login_data.username,
        ip_address=client_ip,
        user_agent=user_agent,
        success=True,
        user_id=user.id
    )
    
    # Log user activity
    log_user_activity(
        db, user, "login", "auth",
        description=f"User logged in from {client_ip}",
        user_ip=client_ip,
        user_agent=user_agent
    )
    
    # Prepare user info
    user_info = UserInfo(
        id=user.id,
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        phone=user.phone,
        avatar_url=user.avatar_url,
        status=user.status,
        is_super_admin=user.is_super_admin,
        role={
            "id": user.role.id,
            "name": user.role.name,
            "display_name": user.role.display_name,
            "description": user.role.description,
            "is_system_role": user.role.is_system_role
        } if user.role else None,
        permissions=permissions,
        last_login=user.last_login,
        created_at=user.created_at
    )
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=int(access_token_expires.total_seconds()),
        user=user_info
    )

@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(
    refresh_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    # Verify refresh token
    payload = JWTHandler.verify_token(refresh_data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Get user
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Get user permissions
    permissions = []
    if user.role:
        permissions = [f"{p.resource}.{p.action}" for p in user.role.permissions]
    
    # Create new access token
    token_data = TokenData(
        user_id=user.id,
        username=user.username,
        email=user.email,
        role=user.role.name if user.role else "user",
        is_super_admin=user.is_super_admin,
        permissions=permissions
    )
    
    access_token = JWTHandler.create_access_token(data=token_data.to_dict())
    
    return RefreshTokenResponse(
        access_token=access_token,
        token_type="bearer",
        expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.post("/logout", response_model=LogoutResponse)
async def logout(
    request: Request,
    current_user: User = Depends(AuthDependencies.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    User logout endpoint
    """
    client_ip = request.client.host if request.client else "unknown"
    
    # Log user activity
    log_user_activity(
        db, current_user, "logout", "auth",
        description=f"User logged out from {client_ip}",
        user_ip=client_ip
    )
    
    return LogoutResponse(message="Successfully logged out")

@router.get("/me", response_model=UserInfo)
async def get_current_user_info(
    current_user: User = Depends(AuthDependencies.get_current_active_user)
):
    """
    Get current user information
    """
    permissions = []
    if current_user.role:
        permissions = [f"{p.resource}.{p.action}" for p in current_user.role.permissions]
    
    return UserInfo(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        avatar_url=current_user.avatar_url,
        status=current_user.status,
        is_super_admin=current_user.is_super_admin,
        role={
            "id": current_user.role.id,
            "name": current_user.role.name,
            "display_name": current_user.role.display_name,
            "description": current_user.role.description,
            "is_system_role": current_user.role.is_system_role
        } if current_user.role else None,
        permissions=permissions,
        last_login=current_user.last_login,
        created_at=current_user.created_at
    )

@router.get("/status", response_model=AuthStatus)
async def get_auth_status(
    current_user: Optional[User] = Depends(AuthDependencies.get_optional_user)
):
    """
    Get authentication status (for checking if user is logged in)
    """
    if not current_user:
        return AuthStatus(authenticated=False)
    
    permissions = []
    if current_user.role:
        permissions = [f"{p.resource}.{p.action}" for p in current_user.role.permissions]
    
    user_info = UserInfo(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        phone=current_user.phone,
        avatar_url=current_user.avatar_url,
        status=current_user.status,
        is_super_admin=current_user.is_super_admin,
        role={
            "id": current_user.role.id,
            "name": current_user.role.name,
            "display_name": current_user.role.display_name,
            "description": current_user.role.description,
            "is_system_role": current_user.role.is_system_role
        } if current_user.role else None,
        permissions=permissions,
        last_login=current_user.last_login,
        created_at=current_user.created_at
    )
    
    return AuthStatus(
        authenticated=True,
        user=user_info,
        permissions=permissions
    )

@router.post("/register", response_model=ApiResponse)
async def register_user(
    request: Request,
    registration_data: UserRegistrationRequest,
    db: Session = Depends(get_db)
):
    """
    User registration endpoint
    Creates new user account with pending status (requires approval)
    """
    client_ip = request.client.host if request.client else "unknown"
    
    # Check if username already exists
    if db.query(User).filter(User.username == registration_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    if db.query(User).filter(User.email == registration_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Get default role (viewer)
    default_role = db.query(Role).filter(Role.name == "viewer").first()
    if not default_role:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Default role not found"
        )
    
    # Create new user
    new_user = User(
        username=registration_data.username,
        email=registration_data.email,
        full_name=registration_data.full_name,
        hashed_password=User.hash_password(registration_data.password),
        phone=registration_data.phone,
        status=UserStatus.PENDING.value,
        role_id=default_role.id
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log user registration
    log_user_activity(
        db, new_user, "create", "users", str(new_user.id),
        description=f"User registered from {client_ip}",
        user_ip=client_ip,
        new_values={
            "username": new_user.username,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "status": new_user.status
        }
    )
    
    return ApiResponse(
        success=True,
        message="Registration successful. Your account is pending approval.",
        data={"user_id": new_user.id}
    )

@router.post("/change-password", response_model=ApiResponse)
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(AuthDependencies.get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Change user password
    """
    # Verify current password
    if not current_user.verify_password(password_data.current_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.hashed_password = User.hash_password(password_data.new_password)
    db.commit()
    
    # Log password change
    log_user_activity(
        db, current_user, "update", "users", str(current_user.id),
        description="User changed password"
    )
    
    return ApiResponse(
        success=True,
        message="Password changed successfully"
    )

@router.post("/approve-user", response_model=ApiResponse)
async def approve_user(
    approval_data: UserApprovalRequest,
    current_user: User = Depends(require_user_approve),
    db: Session = Depends(get_db)
):
    """
    Approve or reject user registration
    Requires user approval permission
    """
    # Get user to approve
    user_to_approve = db.query(User).filter(User.id == approval_data.user_id).first()
    if not user_to_approve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user_to_approve.status != UserStatus.PENDING.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not pending approval"
        )
    
    # Update user status
    old_status = user_to_approve.status
    if approval_data.approved:
        user_to_approve.status = UserStatus.ACTIVE.value
        user_to_approve.approved_at = datetime.now(timezone.utc)
        user_to_approve.approved_by = current_user.id
        
        # Update role if specified
        if approval_data.role_id:
            role = db.query(Role).filter(Role.id == approval_data.role_id).first()
            if role:
                user_to_approve.role_id = approval_data.role_id
        
        message = "User approved successfully"
    else:
        user_to_approve.status = UserStatus.BANNED.value
        message = "User registration rejected"
    
    db.commit()
    
    # Log approval action
    log_user_activity(
        db, current_user, "approve" if approval_data.approved else "reject", 
        "users", str(user_to_approve.id),
        description=f"User {'approved' if approval_data.approved else 'rejected'} by {current_user.username}",
        old_values={"status": old_status},
        new_values={"status": user_to_approve.status},
        notes=approval_data.notes
    )
    
    return ApiResponse(
        success=True,
        message=message,
        data={"user_id": user_to_approve.id, "new_status": user_to_approve.status}
    )