"""
User Management API endpoints for Admin Panel
Handles CRUD operations for users, roles, and permissions
"""

from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from database import get_db
from models.user_models import User, Role, Permission, UserStatus
from auth.dependencies import (
    AuthDependencies, 
    log_user_activity,
    require_permission,
    require_super_admin
)
from schemas.user_schemas import (
    UserResponse, UserCreateRequest, UserUpdateRequest, UserListResponse,
    RoleResponse, RoleCreateRequest, RoleUpdateRequest, RoleListResponse,
    PermissionResponse, PermissionListResponse,
    UserStatsResponse, ApiResponse
)

router = APIRouter(prefix="/users", tags=["User Management"])

# ============================================================================
# USER ENDPOINTS
# ============================================================================

@router.get("/", response_model=UserListResponse)
async def get_users(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by username, email, or full name"),
    status: Optional[str] = Query(None, description="Filter by status"),
    role_id: Optional[int] = Query(None, description="Filter by role"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    current_user: User = Depends(require_permission("users.read")),
    db: Session = Depends(get_db)
):
    """
    Get paginated list of users with filtering and search
    """
    # Build query
    query = db.query(User)
    
    # Apply filters
    if search:
        search_filter = or_(
            User.username.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%"),
            User.full_name.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if status:
        query = query.filter(User.status == status)
    
    if role_id:
        query = query.filter(User.role_id == role_id)
    
    # Apply sorting
    if hasattr(User, sort_by):
        order_column = getattr(User, sort_by)
        if sort_order == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    users = query.offset(offset).limit(limit).all()
    
    # Convert to response format
    user_responses = []
    for user in users:
        permissions = []
        if user.role:
            permissions = [f"{p.resource}.{p.action}" for p in user.role.permissions]
        
        user_responses.append(UserResponse(
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
                "description": user.role.description
            } if user.role else None,
            permissions=permissions,
            last_login=user.last_login,
            created_at=user.created_at,
            updated_at=user.updated_at,
            approved_at=user.approved_at
        ))
    
    return UserListResponse(
        users=user_responses,
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit
    )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(require_permission("users.read")),
    db: Session = Depends(get_db)
):
    """
    Get user by ID
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    permissions = []
    if user.role:
        permissions = [f"{p.resource}.{p.action}" for p in user.role.permissions]
    
    return UserResponse(
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
            "description": user.role.description
        } if user.role else None,
        permissions=permissions,
        last_login=user.last_login,
        created_at=user.created_at,
        updated_at=user.updated_at,
        approved_at=user.approved_at
    )

@router.post("/", response_model=UserResponse)
async def create_user(
    request: Request,
    user_data: UserCreateRequest,
    current_user: User = Depends(require_permission("users.create")),
    db: Session = Depends(get_db)
):
    """
    Create new user
    """
    # Check if username already exists
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists"
        )
    
    # Check if email already exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    
    # Validate role
    role = db.query(Role).filter(Role.id == user_data.role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role ID"
        )
    
    # Create new user
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=User.hash_password(user_data.password),
        phone=user_data.phone,
        status=user_data.status,
        role_id=user_data.role_id,
        is_super_admin=user_data.is_super_admin if current_user.is_super_admin else False
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    log_user_activity(
        db, current_user, "create", "users", str(new_user.id),
        description=f"Created user {new_user.username}",
        user_ip=client_ip,
        new_values={
            "username": new_user.username,
            "email": new_user.email,
            "full_name": new_user.full_name,
            "status": new_user.status,
            "role_id": new_user.role_id
        }
    )
    
    # Return created user
    permissions = []
    if new_user.role:
        permissions = [f"{p.resource}.{p.action}" for p in new_user.role.permissions]
    
    return UserResponse(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        full_name=new_user.full_name,
        phone=new_user.phone,
        avatar_url=new_user.avatar_url,
        status=new_user.status,
        is_super_admin=new_user.is_super_admin,
        role={
            "id": new_user.role.id,
            "name": new_user.role.name,
            "display_name": new_user.role.display_name,
            "description": new_user.role.description
        } if new_user.role else None,
        permissions=permissions,
        last_login=new_user.last_login,
        created_at=new_user.created_at,
        updated_at=new_user.updated_at,
        approved_at=new_user.approved_at
    )

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    request: Request,
    user_data: UserUpdateRequest,
    current_user: User = Depends(require_permission("users.update")),
    db: Session = Depends(get_db)
):
    """
    Update user
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Store old values for logging
    old_values = {
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "status": user.status,
        "role_id": user.role_id,
        "is_super_admin": user.is_super_admin
    }
    
    # Check username uniqueness if changed
    if user_data.username and user_data.username != user.username:
        if db.query(User).filter(User.username == user_data.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists"
            )
        user.username = user_data.username
    
    # Check email uniqueness if changed
    if user_data.email and user_data.email != user.email:
        if db.query(User).filter(User.email == user_data.email).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists"
            )
        user.email = user_data.email
    
    # Update other fields
    if user_data.full_name is not None:
        user.full_name = user_data.full_name
    if user_data.phone is not None:
        user.phone = user_data.phone
    if user_data.status is not None:
        user.status = user_data.status
    if user_data.avatar_url is not None:
        user.avatar_url = user_data.avatar_url
    
    # Update role if provided and valid
    if user_data.role_id is not None:
        role = db.query(Role).filter(Role.id == user_data.role_id).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role ID"
            )
        user.role_id = user_data.role_id
    
    # Update super admin status (only super admin can do this)
    if user_data.is_super_admin is not None and current_user.is_super_admin:
        user.is_super_admin = user_data.is_super_admin
    
    # Update password if provided
    if user_data.password:
        user.hashed_password = User.hash_password(user_data.password)
    
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user)
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    new_values = {
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "phone": user.phone,
        "status": user.status,
        "role_id": user.role_id,
        "is_super_admin": user.is_super_admin
    }
    
    log_user_activity(
        db, current_user, "update", "users", str(user.id),
        description=f"Updated user {user.username}",
        user_ip=client_ip,
        old_values=old_values,
        new_values=new_values
    )
    
    # Return updated user
    permissions = []
    if user.role:
        permissions = [f"{p.resource}.{p.action}" for p in user.role.permissions]
    
    return UserResponse(
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
            "description": user.role.description
        } if user.role else None,
        permissions=permissions,
        last_login=user.last_login,
        created_at=user.created_at,
        updated_at=user.updated_at,
        approved_at=user.approved_at
    )

@router.delete("/{user_id}", response_model=ApiResponse)
async def delete_user(
    user_id: int,
    request: Request,
    current_user: User = Depends(require_permission("users.delete")),
    db: Session = Depends(get_db)
):
    """
    Delete user (soft delete by setting status to banned)
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent deleting super admin
    if user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete super admin user"
        )
    
    # Prevent self-deletion
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    # Soft delete by setting status to banned
    old_status = user.status
    user.status = UserStatus.BANNED.value
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    log_user_activity(
        db, current_user, "delete", "users", str(user.id),
        description=f"Deleted user {user.username}",
        user_ip=client_ip,
        old_values={"status": old_status},
        new_values={"status": user.status}
    )
    
    return ApiResponse(
        success=True,
        message=f"User {user.username} has been deleted successfully"
    )

@router.get("/stats/overview", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: User = Depends(require_permission("users.read")),
    db: Session = Depends(get_db)
):
    """
    Get user statistics for dashboard
    """
    # Get user counts by status
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == UserStatus.ACTIVE.value).count()
    pending_users = db.query(User).filter(User.status == UserStatus.PENDING.value).count()
    suspended_users = db.query(User).filter(User.status == UserStatus.SUSPENDED.value).count()
    banned_users = db.query(User).filter(User.status == UserStatus.BANNED.value).count()
    
    # Get recent registrations (last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    recent_registrations = db.query(User).filter(
        User.created_at >= thirty_days_ago
    ).count()
    
    # Get users by role
    role_stats = db.query(
        Role.display_name,
        func.count(User.id).label('count')
    ).join(User).group_by(Role.id, Role.display_name).all()
    
    return UserStatsResponse(
        total_users=total_users,
        active_users=active_users,
        pending_users=pending_users,
        suspended_users=suspended_users,
        banned_users=banned_users,
        recent_registrations=recent_registrations,
        role_distribution={role: count for role, count in role_stats}
    )

# ============================================================================
# ROLE ENDPOINTS
# ============================================================================

@router.get("/roles/", response_model=RoleListResponse)
async def get_roles(
    current_user: User = Depends(require_permission("users.read")),
    db: Session = Depends(get_db)
):
    """
    Get all roles with their permissions
    """
    roles = db.query(Role).all()
    
    role_responses = []
    for role in roles:
        permissions = [
            {
                "id": p.id,
                "name": p.name,
                "description": p.description,
                "resource": p.resource,
                "action": p.action
            }
            for p in role.permissions
        ]
        
        role_responses.append(RoleResponse(
            id=role.id,
            name=role.name,
            display_name=role.display_name,
            description=role.description,
            is_system_role=role.is_system_role,
            permissions=permissions,
            user_count=len(role.users),
            created_at=role.created_at,
            updated_at=role.updated_at
        ))
    
    return RoleListResponse(roles=role_responses)

@router.get("/roles/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: int,
    current_user: User = Depends(require_permission("users.read")),
    db: Session = Depends(get_db)
):
    """
    Get role by ID
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    permissions = [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "resource": p.resource,
            "action": p.action
        }
        for p in role.permissions
    ]
    
    return RoleResponse(
        id=role.id,
        name=role.name,
        display_name=role.display_name,
        description=role.description,
        is_system_role=role.is_system_role,
        permissions=permissions,
        user_count=len(role.users),
        created_at=role.created_at,
        updated_at=role.updated_at
    )

@router.post("/roles/", response_model=RoleResponse)
async def create_role(
    request: Request,
    role_data: RoleCreateRequest,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """
    Create new role (Super Admin only)
    """
    # Check if role name already exists
    if db.query(Role).filter(Role.name == role_data.name).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role name already exists"
        )
    
    # Create new role
    new_role = Role(
        name=role_data.name,
        display_name=role_data.display_name,
        description=role_data.description,
        is_system_role=False
    )
    
    # Add permissions if provided
    if role_data.permission_ids:
        permissions = db.query(Permission).filter(
            Permission.id.in_(role_data.permission_ids)
        ).all()
        new_role.permissions = permissions
    
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    log_user_activity(
        db, current_user, "create", "roles", str(new_role.id),
        description=f"Created role {new_role.name}",
        user_ip=client_ip,
        new_values={
            "name": new_role.name,
            "display_name": new_role.display_name,
            "description": new_role.description,
            "permission_count": len(new_role.permissions)
        }
    )
    
    # Return created role
    permissions = [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "resource": p.resource,
            "action": p.action
        }
        for p in new_role.permissions
    ]
    
    return RoleResponse(
        id=new_role.id,
        name=new_role.name,
        display_name=new_role.display_name,
        description=new_role.description,
        is_system_role=new_role.is_system_role,
        permissions=permissions,
        user_count=0,
        created_at=new_role.created_at,
        updated_at=new_role.updated_at
    )

@router.put("/roles/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: int,
    request: Request,
    role_data: RoleUpdateRequest,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """
    Update role (Super Admin only)
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Prevent updating system roles
    if role.is_system_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot update system role"
        )
    
    # Store old values
    old_values = {
        "name": role.name,
        "display_name": role.display_name,
        "description": role.description,
        "permission_count": len(role.permissions)
    }
    
    # Update fields
    if role_data.name and role_data.name != role.name:
        # Check uniqueness
        if db.query(Role).filter(Role.name == role_data.name).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role name already exists"
            )
        role.name = role_data.name
    
    if role_data.display_name is not None:
        role.display_name = role_data.display_name
    if role_data.description is not None:
        role.description = role_data.description
    
    # Update permissions if provided
    if role_data.permission_ids is not None:
        permissions = db.query(Permission).filter(
            Permission.id.in_(role_data.permission_ids)
        ).all()
        role.permissions = permissions
    
    role.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(role)
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    new_values = {
        "name": role.name,
        "display_name": role.display_name,
        "description": role.description,
        "permission_count": len(role.permissions)
    }
    
    log_user_activity(
        db, current_user, "update", "roles", str(role.id),
        description=f"Updated role {role.name}",
        user_ip=client_ip,
        old_values=old_values,
        new_values=new_values
    )
    
    # Return updated role
    permissions = [
        {
            "id": p.id,
            "name": p.name,
            "description": p.description,
            "resource": p.resource,
            "action": p.action
        }
        for p in role.permissions
    ]
    
    return RoleResponse(
        id=role.id,
        name=role.name,
        display_name=role.display_name,
        description=role.description,
        is_system_role=role.is_system_role,
        permissions=permissions,
        user_count=len(role.users),
        created_at=role.created_at,
        updated_at=role.updated_at
    )

@router.delete("/roles/{role_id}", response_model=ApiResponse)
async def delete_role(
    role_id: int,
    request: Request,
    current_user: User = Depends(require_super_admin),
    db: Session = Depends(get_db)
):
    """
    Delete role (Super Admin only)
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found"
        )
    
    # Prevent deleting system roles
    if role.is_system_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete system role"
        )
    
    # Check if role is in use
    if role.users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete role. {len(role.users)} users are assigned to this role."
        )
    
    # Delete role
    role_name = role.name
    db.delete(role)
    db.commit()
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    log_user_activity(
        db, current_user, "delete", "roles", str(role_id),
        description=f"Deleted role {role_name}",
        user_ip=client_ip,
        old_values={
            "name": role_name,
            "display_name": role.display_name,
            "description": role.description
        }
    )
    
    return ApiResponse(
        success=True,
        message=f"Role {role_name} has been deleted successfully"
    )

# ============================================================================
# PERMISSION ENDPOINTS
# ============================================================================

@router.get("/permissions/", response_model=PermissionListResponse)
async def get_permissions(
    current_user: User = Depends(require_permission("users.read")),
    db: Session = Depends(get_db)
):
    """
    Get all permissions grouped by resource
    """
    permissions = db.query(Permission).order_by(Permission.resource, Permission.action).all()
    
    permission_responses = []
    for permission in permissions:
        permission_responses.append(PermissionResponse(
            id=permission.id,
            name=permission.name,
            description=permission.description,
            resource=permission.resource,
            action=permission.action,
            created_at=permission.created_at
        ))
    
    # Group by resource
    grouped_permissions = {}
    for perm in permission_responses:
        if perm.resource not in grouped_permissions:
            grouped_permissions[perm.resource] = []
        grouped_permissions[perm.resource].append(perm)
    
    return PermissionListResponse(
        permissions=permission_responses,
        grouped_permissions=grouped_permissions
    )