"""
Dashboard Schemas for Admin Panel
Pydantic models for dashboard statistics, analytics, and overview data
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# ============================================================================
# DASHBOARD OVERVIEW SCHEMAS
# ============================================================================

class UserStatsOverview(BaseModel):
    total: int
    active: int
    pending: int
    growth_rate: float

class ProductStatsOverview(BaseModel):
    total: int
    active: int
    out_of_stock: int
    categories: int

class ActivityStatsOverview(BaseModel):
    recent_activities: int
    recent_logins: int
    failed_logins: int
    system_errors: int

class SystemHealthOverview(BaseModel):
    status: str
    uptime: str
    last_backup: datetime

class DashboardOverviewResponse(BaseModel):
    user_stats: UserStatsOverview
    product_stats: ProductStatsOverview
    activity_stats: ActivityStatsOverview
    system_health: SystemHealthOverview

# ============================================================================
# USER ANALYTICS SCHEMAS
# ============================================================================

class DailyRegistration(BaseModel):
    date: str
    count: int

class LoginActivity(BaseModel):
    date: str
    total_attempts: int
    successful_logins: int

class UserStatsResponse(BaseModel):
    total_users: int
    active_users: int
    pending_users: int
    suspended_users: int
    banned_users: int
    new_registrations: int
    role_distribution: Dict[str, int]
    daily_registrations: List[DailyRegistration]
    login_activity: List[LoginActivity]

# ============================================================================
# PRODUCT ANALYTICS SCHEMAS
# ============================================================================

class DailyProduct(BaseModel):
    date: str
    count: int

class ProductStatsResponse(BaseModel):
    total_products: int
    active_products: int
    draft_products: int
    inactive_products: int
    out_of_stock_products: int
    featured_products: int
    low_stock_products: int
    new_products: int
    category_distribution: Dict[str, int]
    daily_products: List[DailyProduct]
    price_distribution: Dict[str, int]

# ============================================================================
# ACTIVITY SCHEMAS
# ============================================================================

class RecentActivityResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    username: str
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    description: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============================================================================
# SYSTEM HEALTH SCHEMAS
# ============================================================================

class SystemHealthResponse(BaseModel):
    overall_status: str
    database_status: str
    api_status: str
    storage_status: str
    recent_errors: int
    failed_logins: int
    uptime_percentage: float
    last_backup: datetime
    memory_usage: float
    cpu_usage: float
    disk_usage: float

# ============================================================================
# CHART DATA SCHEMAS
# ============================================================================

class ChartDataset(BaseModel):
    label: str
    data: List[int]
    backgroundColor: Any
    borderColor: Optional[str] = None
    borderWidth: Optional[int] = None

class ChartDataResponse(BaseModel):
    labels: List[str]
    datasets: List[ChartDataset]

# ============================================================================
# TOP ITEMS SCHEMAS
# ============================================================================

class TopCategoriesResponse(BaseModel):
    id: int
    name: str
    slug: str
    product_count: int

class RecentUsersResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    status: str
    role_name: str
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ============================================================================
# SYSTEM STATS SCHEMAS
# ============================================================================

class SystemStatsResponse(BaseModel):
    database_size: str
    total_files: int
    storage_used: str
    api_calls_today: int
    average_response_time: float
    active_sessions: int
    cache_hit_rate: float