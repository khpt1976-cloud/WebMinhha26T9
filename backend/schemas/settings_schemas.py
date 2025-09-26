"""
Settings Management Schemas for Admin Panel
Pydantic models for website settings, contact info, SEO, and appearance settings
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# ============================================================================
# WEBSITE SETTINGS SCHEMAS
# ============================================================================

class WebsiteSettingUpdateRequest(BaseModel):
    value: str = Field(..., description="Setting value")

class WebsiteSettingResponse(BaseModel):
    id: int
    key: str
    value: Optional[str] = None
    default_value: Optional[str] = None
    group: str
    type: str
    label: str
    description: Optional[str] = None
    placeholder: Optional[str] = None
    is_required: bool
    validation_rules: Optional[Dict[str, Any]] = None
    options: Optional[Dict[str, Any]] = None
    sort_order: int
    is_active: bool
    is_system: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class WebsiteSettingListResponse(BaseModel):
    settings: List[WebsiteSettingResponse]
    grouped_settings: Dict[str, List[WebsiteSettingResponse]]

# ============================================================================
# CONTACT SETTINGS SCHEMAS
# ============================================================================

class ContactSettingUpdateRequest(BaseModel):
    value: Optional[str] = None
    label: Optional[str] = None
    icon: Optional[str] = None
    is_public: Optional[bool] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None

class ContactSettingResponse(BaseModel):
    id: int
    type: str
    label: str
    value: str
    icon: Optional[str] = None
    is_public: bool
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ============================================================================
# SEO SETTINGS SCHEMAS
# ============================================================================

class SeoSettingUpdateRequest(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image: Optional[str] = None
    canonical_url: Optional[str] = None
    robots_meta: Optional[str] = None
    schema_markup: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class SeoSettingResponse(BaseModel):
    id: int
    page_type: str
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    og_title: Optional[str] = None
    og_description: Optional[str] = None
    og_image: Optional[str] = None
    canonical_url: Optional[str] = None
    robots_meta: Optional[str] = None
    schema_markup: Optional[Dict[str, Any]] = None
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ============================================================================
# APPEARANCE SETTINGS SCHEMAS
# ============================================================================

class AppearanceSettingUpdateRequest(BaseModel):
    value: str = Field(..., description="Setting value")

class AppearanceSettingResponse(BaseModel):
    id: int
    section: str
    key: str
    value: str
    type: str
    label: str
    description: Optional[str] = None
    options: Optional[Dict[str, Any]] = None
    sort_order: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# ============================================================================
# SETTINGS GROUPS SCHEMAS
# ============================================================================

class SettingsGroupResponse(BaseModel):
    name: str
    display_name: str
    description: str
    setting_count: int
    type: str

# ============================================================================
# COMMON SCHEMAS
# ============================================================================

class ApiResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Dict[str, Any]] = None