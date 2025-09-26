"""
Dashboard API endpoints for Admin Panel
Provides statistics, analytics, and overview data for the admin dashboard
"""

from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from database import get_db
from models.user_models import User, Role, UserStatus
from models.product_models import Product, Category, ProductStatus
from models.settings_models import WebsiteSetting
from models.audit_models import AuditLog, SystemLog, LoginAttempt
from auth.dependencies import require_permission
from schemas.dashboard_schemas import (
    DashboardOverviewResponse, UserStatsResponse, ProductStatsResponse,
    RecentActivityResponse, SystemStatsResponse, ChartDataResponse,
    TopCategoriesResponse, RecentUsersResponse, SystemHealthResponse
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

# ============================================================================
# DASHBOARD OVERVIEW
# ============================================================================

@router.get("/overview", response_model=DashboardOverviewResponse)
async def get_dashboard_overview(
    current_user: User = Depends(require_permission("dashboard.read")),
    db: Session = Depends(get_db)
):
    """
    Get dashboard overview with key statistics
    """
    # User statistics
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == UserStatus.ACTIVE.value).count()
    pending_users = db.query(User).filter(User.status == UserStatus.PENDING.value).count()
    
    # Product statistics
    total_products = db.query(Product).count()
    active_products = db.query(Product).filter(Product.status == ProductStatus.ACTIVE.value).count()
    out_of_stock = db.query(Product).filter(Product.status == ProductStatus.OUT_OF_STOCK.value).count()
    
    # Category statistics
    total_categories = db.query(Category).count()
    active_categories = db.query(Category).filter(Category.is_active == True).count()
    
    # Recent activity count (last 24 hours)
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    recent_activities = db.query(AuditLog).filter(AuditLog.created_at >= yesterday).count()
    
    # Recent logins (last 24 hours)
    recent_logins = db.query(LoginAttempt).filter(
        and_(
            LoginAttempt.attempted_at >= yesterday,
            LoginAttempt.success == "success"
        )
    ).count()
    
    # System health indicators
    failed_logins_today = db.query(LoginAttempt).filter(
        and_(
            LoginAttempt.attempted_at >= datetime.now(timezone.utc).replace(hour=0, minute=0, second=0),
            LoginAttempt.success == "failure"
        )
    ).count()
    
    system_errors_today = db.query(SystemLog).filter(
        and_(
            SystemLog.created_at >= datetime.now(timezone.utc).replace(hour=0, minute=0, second=0),
            SystemLog.level == "ERROR"
        )
    ).count()
    
    return DashboardOverviewResponse(
        user_stats={
            "total": total_users,
            "active": active_users,
            "pending": pending_users,
            "growth_rate": 0  # Calculate growth rate if needed
        },
        product_stats={
            "total": total_products,
            "active": active_products,
            "out_of_stock": out_of_stock,
            "categories": total_categories
        },
        activity_stats={
            "recent_activities": recent_activities,
            "recent_logins": recent_logins,
            "failed_logins": failed_logins_today,
            "system_errors": system_errors_today
        },
        system_health={
            "status": "healthy" if system_errors_today == 0 else "warning",
            "uptime": "99.9%",  # Mock data - implement real uptime tracking
            "last_backup": datetime.now(timezone.utc) - timedelta(hours=6)  # Mock data
        }
    )

# ============================================================================
# USER ANALYTICS
# ============================================================================

@router.get("/users/stats", response_model=UserStatsResponse)
async def get_user_statistics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    current_user: User = Depends(require_permission("dashboard.read")),
    db: Session = Depends(get_db)
):
    """
    Get detailed user statistics and trends
    """
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # User counts by status
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == UserStatus.ACTIVE.value).count()
    pending_users = db.query(User).filter(User.status == UserStatus.PENDING.value).count()
    suspended_users = db.query(User).filter(User.status == UserStatus.SUSPENDED.value).count()
    banned_users = db.query(User).filter(User.status == UserStatus.BANNED.value).count()
    
    # New registrations in period
    new_registrations = db.query(User).filter(User.created_at >= start_date).count()
    
    # Users by role
    role_distribution = db.query(
        Role.display_name,
        func.count(User.id).label('count')
    ).join(User).group_by(Role.id, Role.display_name).all()
    
    # Daily registration trend
    daily_registrations = db.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(User.created_at >= start_date).group_by(func.date(User.created_at)).all()
    
    # Login activity
    login_activity = db.query(
        func.date(LoginAttempt.attempted_at).label('date'),
        func.count(LoginAttempt.id).label('total_attempts'),
        func.sum(func.case([(LoginAttempt.success == "success", 1)], else_=0)).label('successful_logins')
    ).filter(LoginAttempt.attempted_at >= start_date).group_by(func.date(LoginAttempt.attempted_at)).all()
    
    return UserStatsResponse(
        total_users=total_users,
        active_users=active_users,
        pending_users=pending_users,
        suspended_users=suspended_users,
        banned_users=banned_users,
        new_registrations=new_registrations,
        role_distribution={role: count for role, count in role_distribution},
        daily_registrations=[
            {"date": str(date), "count": count} for date, count in daily_registrations
        ],
        login_activity=[
            {
                "date": str(date),
                "total_attempts": int(total or 0),
                "successful_logins": int(successful or 0)
            }
            for date, total, successful in login_activity
        ]
    )

# ============================================================================
# PRODUCT ANALYTICS
# ============================================================================

@router.get("/products/stats", response_model=ProductStatsResponse)
async def get_product_statistics(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    current_user: User = Depends(require_permission("dashboard.read")),
    db: Session = Depends(get_db)
):
    """
    Get detailed product statistics and trends
    """
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Product counts by status
    total_products = db.query(Product).count()
    active_products = db.query(Product).filter(Product.status == ProductStatus.ACTIVE.value).count()
    draft_products = db.query(Product).filter(Product.status == ProductStatus.DRAFT.value).count()
    inactive_products = db.query(Product).filter(Product.status == ProductStatus.INACTIVE.value).count()
    out_of_stock = db.query(Product).filter(Product.status == ProductStatus.OUT_OF_STOCK.value).count()
    
    # Featured products
    featured_products = db.query(Product).filter(Product.is_featured == True).count()
    
    # Low stock products (stock <= 5)
    low_stock_products = db.query(Product).filter(Product.stock_quantity <= 5).count()
    
    # New products in period
    new_products = db.query(Product).filter(Product.created_at >= start_date).count()
    
    # Products by category
    category_distribution = db.query(
        Category.name,
        func.count(Product.id).label('count')
    ).join(Product).group_by(Category.id, Category.name).all()
    
    # Daily product creation trend
    daily_products = db.query(
        func.date(Product.created_at).label('date'),
        func.count(Product.id).label('count')
    ).filter(Product.created_at >= start_date).group_by(func.date(Product.created_at)).all()
    
    # Price range analysis
    price_ranges = db.query(
        func.case([
            (Product.price < 500000, "Under 500K"),
            (Product.price < 1000000, "500K - 1M"),
            (Product.price < 2000000, "1M - 2M"),
            (Product.price >= 2000000, "Over 2M")
        ]).label('price_range'),
        func.count(Product.id).label('count')
    ).filter(Product.price.isnot(None)).group_by('price_range').all()
    
    return ProductStatsResponse(
        total_products=total_products,
        active_products=active_products,
        draft_products=draft_products,
        inactive_products=inactive_products,
        out_of_stock_products=out_of_stock,
        featured_products=featured_products,
        low_stock_products=low_stock_products,
        new_products=new_products,
        category_distribution={category: count for category, count in category_distribution},
        daily_products=[
            {"date": str(date), "count": count} for date, count in daily_products
        ],
        price_distribution={price_range: count for price_range, count in price_ranges}
    )

# ============================================================================
# RECENT ACTIVITY
# ============================================================================

@router.get("/activity/recent", response_model=List[RecentActivityResponse])
async def get_recent_activity(
    limit: int = Query(20, ge=1, le=100, description="Number of activities to return"),
    current_user: User = Depends(require_permission("dashboard.read")),
    db: Session = Depends(get_db)
):
    """
    Get recent system activities
    """
    try:
        activities = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
        
        activity_responses = []
        for activity in activities:
            # Use cached username if available, otherwise try to get from user relationship
            username = "System"
            if activity.username:
                username = activity.username
            elif activity.user_id and activity.user:
                username = activity.user.username
            
            activity_responses.append(RecentActivityResponse(
                id=activity.id,
                user_id=activity.user_id,
                username=username,
                action=activity.action,
                resource_type=activity.resource if hasattr(activity, 'resource') else "unknown",
                resource_id=activity.resource_id,
                description=activity.description,
                ip_address=activity.user_ip if hasattr(activity, 'user_ip') else activity.ip_address if hasattr(activity, 'ip_address') else None,
                user_agent=activity.user_agent,
                created_at=activity.created_at
            ))
        
        return activity_responses
    except Exception as e:
        print(f"Error in get_recent_activity: {e}")
        # Return empty list if there's an error
        return []

# ============================================================================
# SYSTEM HEALTH
# ============================================================================

@router.get("/system/health", response_model=SystemHealthResponse)
async def get_system_health(
    current_user: User = Depends(require_permission("dashboard.read")),
    db: Session = Depends(get_db)
):
    """
    Get system health indicators
    """
    # Database connection test
    try:
        db.execute("SELECT 1")
        database_status = "healthy"
    except Exception:
        database_status = "error"
    
    # Recent errors (last 24 hours)
    yesterday = datetime.now(timezone.utc) - timedelta(days=1)
    recent_errors = db.query(SystemLog).filter(
        and_(
            SystemLog.created_at >= yesterday,
            SystemLog.level == "ERROR"
        )
    ).count()
    
    # Failed login attempts (last hour)
    last_hour = datetime.now(timezone.utc) - timedelta(hours=1)
    failed_logins = db.query(LoginAttempt).filter(
        and_(
            LoginAttempt.attempted_at >= last_hour,
            LoginAttempt.success == "failure"
        )
    ).count()
    
    # Determine overall status
    if database_status == "error" or recent_errors > 10:
        overall_status = "critical"
    elif recent_errors > 5 or failed_logins > 20:
        overall_status = "warning"
    else:
        overall_status = "healthy"
    
    return SystemHealthResponse(
        overall_status=overall_status,
        database_status=database_status,
        api_status="healthy",  # Mock - implement real API health check
        storage_status="healthy",  # Mock - implement real storage check
        recent_errors=recent_errors,
        failed_logins=failed_logins,
        uptime_percentage=99.9,  # Mock - implement real uptime tracking
        last_backup=datetime.now(timezone.utc) - timedelta(hours=6),  # Mock
        memory_usage=65.5,  # Mock - implement real memory monitoring
        cpu_usage=23.8,  # Mock - implement real CPU monitoring
        disk_usage=45.2  # Mock - implement real disk monitoring
    )

# ============================================================================
# CHARTS AND ANALYTICS
# ============================================================================

@router.get("/charts/user-growth", response_model=ChartDataResponse)
async def get_user_growth_chart(
    days: int = Query(30, ge=7, le=365, description="Number of days to analyze"),
    current_user: User = Depends(require_permission("dashboard.read")),
    db: Session = Depends(get_db)
):
    """
    Get user growth chart data
    """
    start_date = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Daily user registrations
    daily_data = db.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(User.created_at >= start_date).group_by(func.date(User.created_at)).all()
    
    # Fill missing dates with 0
    date_range = []
    current_date = start_date.date()
    end_date = datetime.now(timezone.utc).date()
    
    while current_date <= end_date:
        date_range.append(current_date)
        current_date += timedelta(days=1)
    
    # Create data map
    data_map = {date: count for date, count in daily_data}
    
    # Build chart data
    labels = [str(date) for date in date_range]
    values = [data_map.get(date, 0) for date in date_range]
    
    return ChartDataResponse(
        labels=labels,
        datasets=[
            {
                "label": "New Users",
                "data": values,
                "backgroundColor": "rgba(54, 162, 235, 0.2)",
                "borderColor": "rgba(54, 162, 235, 1)",
                "borderWidth": 2
            }
        ]
    )

@router.get("/charts/product-status", response_model=ChartDataResponse)
async def get_product_status_chart(
    current_user: User = Depends(require_permission("dashboard.read")),
    db: Session = Depends(get_db)
):
    """
    Get product status distribution chart data
    """
    status_data = db.query(
        Product.status,
        func.count(Product.id).label('count')
    ).group_by(Product.status).all()
    
    labels = []
    values = []
    colors = {
        'active': 'rgba(75, 192, 192, 0.8)',
        'draft': 'rgba(255, 206, 86, 0.8)',
        'inactive': 'rgba(255, 99, 132, 0.8)',
        'out_of_stock': 'rgba(153, 102, 255, 0.8)'
    }
    
    background_colors = []
    
    for status, count in status_data:
        labels.append(status.replace('_', ' ').title())
        values.append(count)
        background_colors.append(colors.get(status, 'rgba(201, 203, 207, 0.8)'))
    
    return ChartDataResponse(
        labels=labels,
        datasets=[
            {
                "label": "Products by Status",
                "data": values,
                "backgroundColor": background_colors,
                "borderWidth": 1
            }
        ]
    )

@router.get("/top-categories", response_model=List[TopCategoriesResponse])
async def get_top_categories(
    limit: int = Query(5, ge=1, le=20, description="Number of top categories to return"),
    current_user: User = Depends(require_permission("dashboard.read")),
    db: Session = Depends(get_db)
):
    """
    Get top categories by product count
    """
    top_categories = db.query(
        Category.id,
        Category.name,
        Category.slug,
        func.count(Product.id).label('product_count')
    ).join(Product).group_by(Category.id, Category.name, Category.slug).order_by(
        func.count(Product.id).desc()
    ).limit(limit).all()
    
    category_responses = []
    for category_id, name, slug, product_count in top_categories:
        category_responses.append(TopCategoriesResponse(
            id=category_id,
            name=name,
            slug=slug,
            product_count=product_count
        ))
    
    return category_responses

@router.get("/recent-users", response_model=List[RecentUsersResponse])
async def get_recent_users(
    limit: int = Query(10, ge=1, le=50, description="Number of recent users to return"),
    current_user: User = Depends(require_permission("dashboard.read")),
    db: Session = Depends(get_db)
):
    """
    Get recently registered users
    """
    recent_users = db.query(User).order_by(User.created_at.desc()).limit(limit).all()
    
    user_responses = []
    for user in recent_users:
        user_responses.append(RecentUsersResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            status=user.status,
            role_name=user.role.display_name if user.role else "No Role",
            created_at=user.created_at,
            last_login=user.last_login
        ))
    
    return user_responses