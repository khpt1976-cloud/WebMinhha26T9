"""
Settings Management API endpoints for Admin Panel
Handles website settings, contact info, SEO settings, and appearance settings
"""

from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from models.settings_models import WebsiteSetting, ContactSetting, SeoSetting, AppearanceSetting
from models.user_models import User
from auth.dependencies import (
    AuthDependencies, 
    log_user_activity,
    require_permission
)
from schemas.settings_schemas import (
    WebsiteSettingResponse, WebsiteSettingUpdateRequest, WebsiteSettingListResponse,
    ContactSettingResponse, ContactSettingUpdateRequest,
    SeoSettingResponse, SeoSettingUpdateRequest,
    AppearanceSettingResponse, AppearanceSettingUpdateRequest,
    SettingsGroupResponse, ApiResponse
)

router = APIRouter(prefix="/settings", tags=["Settings Management"])

# ============================================================================
# WEBSITE SETTINGS ENDPOINTS
# ============================================================================

@router.get("/website", response_model=WebsiteSettingListResponse)
async def get_website_settings(
    group: Optional[str] = None,
    current_user: User = Depends(require_permission("settings.read")),
    db: Session = Depends(get_db)
):
    """
    Get website settings, optionally filtered by group
    """
    query = db.query(WebsiteSetting).filter(WebsiteSetting.is_active == True)
    
    if group:
        query = query.filter(WebsiteSetting.group == group)
    
    settings = query.order_by(WebsiteSetting.group, WebsiteSetting.sort_order, WebsiteSetting.key).all()
    
    setting_responses = []
    for setting in settings:
        setting_responses.append(WebsiteSettingResponse(
            id=setting.id,
            key=setting.key,
            value=setting.value,
            default_value=setting.default_value,
            group=setting.group,
            type=setting.type,
            label=setting.label,
            description=setting.description,
            placeholder=setting.placeholder,
            is_required=setting.is_required,
            validation_rules=setting.validation_rules,
            options=setting.options,
            sort_order=setting.sort_order,
            is_active=setting.is_active,
            is_system=setting.is_system,
            created_at=setting.created_at,
            updated_at=setting.updated_at
        ))
    
    # Group settings by group
    grouped_settings = {}
    for setting in setting_responses:
        if setting.group not in grouped_settings:
            grouped_settings[setting.group] = []
        grouped_settings[setting.group].append(setting)
    
    return WebsiteSettingListResponse(
        settings=setting_responses,
        grouped_settings=grouped_settings
    )

@router.get("/website/{setting_key}", response_model=WebsiteSettingResponse)
async def get_website_setting(
    setting_key: str,
    current_user: User = Depends(require_permission("settings.read")),
    db: Session = Depends(get_db)
):
    """
    Get specific website setting by key
    """
    setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == setting_key).first()
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found"
        )
    
    return WebsiteSettingResponse(
        id=setting.id,
        key=setting.key,
        value=setting.value,
        default_value=setting.default_value,
        group=setting.group,
        type=setting.type,
        label=setting.label,
        description=setting.description,
        placeholder=setting.placeholder,
        is_required=setting.is_required,
        validation_rules=setting.validation_rules,
        options=setting.options,
        sort_order=setting.sort_order,
        is_active=setting.is_active,
        is_system=setting.is_system,
        created_at=setting.created_at,
        updated_at=setting.updated_at
    )

@router.put("/website/{setting_key}", response_model=WebsiteSettingResponse)
async def update_website_setting(
    setting_key: str,
    request: Request,
    setting_data: WebsiteSettingUpdateRequest,
    current_user: User = Depends(require_permission("settings.update")),
    db: Session = Depends(get_db)
):
    """
    Update website setting value
    """
    setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == setting_key).first()
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found"
        )
    
    # Store old value for logging
    old_value = setting.value
    
    # Update value
    setting.value = setting_data.value
    setting.updated_at = datetime.now(timezone.utc)
    setting.updated_by = current_user.id
    
    db.commit()
    db.refresh(setting)
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    log_user_activity(
        db, current_user, "update", "settings", setting.key,
        description=f"Updated setting {setting.key}",
        user_ip=client_ip,
        old_values={"value": old_value},
        new_values={"value": setting.value}
    )
    
    return WebsiteSettingResponse(
        id=setting.id,
        key=setting.key,
        value=setting.value,
        default_value=setting.default_value,
        group=setting.group,
        type=setting.type,
        label=setting.label,
        description=setting.description,
        placeholder=setting.placeholder,
        is_required=setting.is_required,
        validation_rules=setting.validation_rules,
        options=setting.options,
        sort_order=setting.sort_order,
        is_active=setting.is_active,
        is_system=setting.is_system,
        created_at=setting.created_at,
        updated_at=setting.updated_at
    )

@router.put("/website/bulk", response_model=ApiResponse)
async def update_multiple_settings(
    request: Request,
    settings_data: Dict[str, str],
    current_user: User = Depends(require_permission("settings.update")),
    db: Session = Depends(get_db)
):
    """
    Update multiple website settings at once
    """
    updated_settings = []
    old_values = {}
    new_values = {}
    
    for key, value in settings_data.items():
        setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == key).first()
        if setting:
            old_values[key] = setting.value
            setting.value = value
            setting.updated_at = datetime.now(timezone.utc)
            setting.updated_by = current_user.id
            updated_settings.append(key)
            new_values[key] = value
    
    if not updated_settings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid settings found to update"
        )
    
    db.commit()
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    log_user_activity(
        db, current_user, "update", "settings", "bulk_update",
        description=f"Updated {len(updated_settings)} settings",
        user_ip=client_ip,
        old_values=old_values,
        new_values=new_values
    )
    
    return ApiResponse(
        success=True,
        message=f"Successfully updated {len(updated_settings)} settings",
        data={"updated_settings": updated_settings}
    )

# ============================================================================
# CONTACT SETTINGS ENDPOINTS
# ============================================================================

@router.get("/contact", response_model=List[ContactSettingResponse])
async def get_contact_settings(
    current_user: User = Depends(require_permission("settings.read")),
    db: Session = Depends(get_db)
):
    """
    Get all contact settings
    """
    settings = db.query(ContactSetting).filter(ContactSetting.is_active == True).order_by(ContactSetting.sort_order).all()
    
    setting_responses = []
    for setting in settings:
        setting_responses.append(ContactSettingResponse(
            id=setting.id,
            type=setting.type,
            label=setting.label,
            value=setting.value,
            icon=setting.icon,
            is_public=setting.is_public,
            sort_order=setting.sort_order,
            is_active=setting.is_active,
            created_at=setting.created_at,
            updated_at=setting.updated_at
        ))
    
    return setting_responses

@router.put("/contact/{setting_id}", response_model=ContactSettingResponse)
async def update_contact_setting(
    setting_id: int,
    request: Request,
    setting_data: ContactSettingUpdateRequest,
    current_user: User = Depends(require_permission("settings.update")),
    db: Session = Depends(get_db)
):
    """
    Update contact setting
    """
    setting = db.query(ContactSetting).filter(ContactSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact setting not found"
        )
    
    # Store old values for logging
    old_values = {
        "value": setting.value,
        "label": setting.label,
        "is_public": setting.is_public,
        "is_active": setting.is_active
    }
    
    # Update fields
    if setting_data.value is not None:
        setting.value = setting_data.value
    if setting_data.label is not None:
        setting.label = setting_data.label
    if setting_data.icon is not None:
        setting.icon = setting_data.icon
    if setting_data.is_public is not None:
        setting.is_public = setting_data.is_public
    if setting_data.sort_order is not None:
        setting.sort_order = setting_data.sort_order
    if setting_data.is_active is not None:
        setting.is_active = setting_data.is_active
    
    setting.updated_at = datetime.now(timezone.utc)
    setting.updated_by = current_user.id
    
    db.commit()
    db.refresh(setting)
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    new_values = {
        "value": setting.value,
        "label": setting.label,
        "is_public": setting.is_public,
        "is_active": setting.is_active
    }
    
    log_user_activity(
        db, current_user, "update", "contact_settings", str(setting.id),
        description=f"Updated contact setting {setting.type}",
        user_ip=client_ip,
        old_values=old_values,
        new_values=new_values
    )
    
    return ContactSettingResponse(
        id=setting.id,
        type=setting.type,
        label=setting.label,
        value=setting.value,
        icon=setting.icon,
        is_public=setting.is_public,
        sort_order=setting.sort_order,
        is_active=setting.is_active,
        created_at=setting.created_at,
        updated_at=setting.updated_at
    )

# ============================================================================
# SEO SETTINGS ENDPOINTS
# ============================================================================

@router.get("/seo", response_model=List[SeoSettingResponse])
async def get_seo_settings(
    current_user: User = Depends(require_permission("settings.read")),
    db: Session = Depends(get_db)
):
    """
    Get all SEO settings
    """
    settings = db.query(SeoSetting).filter(SeoSetting.is_active == True).order_by(SeoSetting.sort_order).all()
    
    setting_responses = []
    for setting in settings:
        setting_responses.append(SeoSettingResponse(
            id=setting.id,
            page_type=setting.page_type,
            meta_title=setting.meta_title,
            meta_description=setting.meta_description,
            meta_keywords=setting.meta_keywords,
            og_title=setting.og_title,
            og_description=setting.og_description,
            og_image=setting.og_image,
            canonical_url=setting.canonical_url,
            robots_meta=setting.robots_meta,
            schema_markup=setting.schema_markup,
            sort_order=setting.sort_order,
            is_active=setting.is_active,
            created_at=setting.created_at,
            updated_at=setting.updated_at
        ))
    
    return setting_responses

@router.put("/seo/{setting_id}", response_model=SeoSettingResponse)
async def update_seo_setting(
    setting_id: int,
    request: Request,
    setting_data: SeoSettingUpdateRequest,
    current_user: User = Depends(require_permission("settings.update")),
    db: Session = Depends(get_db)
):
    """
    Update SEO setting
    """
    setting = db.query(SeoSetting).filter(SeoSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="SEO setting not found"
        )
    
    # Store old values for logging
    old_values = {
        "meta_title": setting.meta_title,
        "meta_description": setting.meta_description,
        "meta_keywords": setting.meta_keywords
    }
    
    # Update fields
    if setting_data.meta_title is not None:
        setting.meta_title = setting_data.meta_title
    if setting_data.meta_description is not None:
        setting.meta_description = setting_data.meta_description
    if setting_data.meta_keywords is not None:
        setting.meta_keywords = setting_data.meta_keywords
    if setting_data.og_title is not None:
        setting.og_title = setting_data.og_title
    if setting_data.og_description is not None:
        setting.og_description = setting_data.og_description
    if setting_data.og_image is not None:
        setting.og_image = setting_data.og_image
    if setting_data.canonical_url is not None:
        setting.canonical_url = setting_data.canonical_url
    if setting_data.robots_meta is not None:
        setting.robots_meta = setting_data.robots_meta
    if setting_data.schema_markup is not None:
        setting.schema_markup = setting_data.schema_markup
    if setting_data.is_active is not None:
        setting.is_active = setting_data.is_active
    
    setting.updated_at = datetime.now(timezone.utc)
    setting.updated_by = current_user.id
    
    db.commit()
    db.refresh(setting)
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    new_values = {
        "meta_title": setting.meta_title,
        "meta_description": setting.meta_description,
        "meta_keywords": setting.meta_keywords
    }
    
    log_user_activity(
        db, current_user, "update", "seo_settings", str(setting.id),
        description=f"Updated SEO setting for {setting.page_type}",
        user_ip=client_ip,
        old_values=old_values,
        new_values=new_values
    )
    
    return SeoSettingResponse(
        id=setting.id,
        page_type=setting.page_type,
        meta_title=setting.meta_title,
        meta_description=setting.meta_description,
        meta_keywords=setting.meta_keywords,
        og_title=setting.og_title,
        og_description=setting.og_description,
        og_image=setting.og_image,
        canonical_url=setting.canonical_url,
        robots_meta=setting.robots_meta,
        schema_markup=setting.schema_markup,
        sort_order=setting.sort_order,
        is_active=setting.is_active,
        created_at=setting.created_at,
        updated_at=setting.updated_at
    )

# ============================================================================
# APPEARANCE SETTINGS ENDPOINTS
# ============================================================================

@router.get("/appearance", response_model=List[AppearanceSettingResponse])
async def get_appearance_settings(
    current_user: User = Depends(require_permission("settings.read")),
    db: Session = Depends(get_db)
):
    """
    Get all appearance settings
    """
    settings = db.query(AppearanceSetting).filter(AppearanceSetting.is_active == True).order_by(AppearanceSetting.sort_order).all()
    
    setting_responses = []
    for setting in settings:
        setting_responses.append(AppearanceSettingResponse(
            id=setting.id,
            section=setting.section,
            key=setting.key,
            value=setting.value,
            type=setting.type,
            label=setting.label,
            description=setting.description,
            options=setting.options,
            sort_order=setting.sort_order,
            is_active=setting.is_active,
            created_at=setting.created_at,
            updated_at=setting.updated_at
        ))
    
    return setting_responses

@router.put("/appearance/{setting_id}", response_model=AppearanceSettingResponse)
async def update_appearance_setting(
    setting_id: int,
    request: Request,
    setting_data: AppearanceSettingUpdateRequest,
    current_user: User = Depends(require_permission("settings.update")),
    db: Session = Depends(get_db)
):
    """
    Update appearance setting
    """
    setting = db.query(AppearanceSetting).filter(AppearanceSetting.id == setting_id).first()
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appearance setting not found"
        )
    
    # Store old value for logging
    old_value = setting.value
    
    # Update value
    setting.value = setting_data.value
    setting.updated_at = datetime.now(timezone.utc)
    setting.updated_by = current_user.id
    
    db.commit()
    db.refresh(setting)
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    log_user_activity(
        db, current_user, "update", "appearance_settings", str(setting.id),
        description=f"Updated appearance setting {setting.key}",
        user_ip=client_ip,
        old_values={"value": old_value},
        new_values={"value": setting.value}
    )
    
    return AppearanceSettingResponse(
        id=setting.id,
        section=setting.section,
        key=setting.key,
        value=setting.value,
        type=setting.type,
        label=setting.label,
        description=setting.description,
        options=setting.options,
        sort_order=setting.sort_order,
        is_active=setting.is_active,
        created_at=setting.created_at,
        updated_at=setting.updated_at
    )

# ============================================================================
# GENERAL SETTINGS ENDPOINTS
# ============================================================================

@router.get("/groups", response_model=List[SettingsGroupResponse])
async def get_settings_groups(
    current_user: User = Depends(require_permission("settings.read")),
    db: Session = Depends(get_db)
):
    """
    Get all settings groups with counts
    """
    # Get website settings grouped
    website_groups = db.query(
        WebsiteSetting.group,
        func.count(WebsiteSetting.id).label('count')
    ).filter(WebsiteSetting.is_active == True).group_by(WebsiteSetting.group).all()
    
    groups = []
    for group, count in website_groups:
        groups.append(SettingsGroupResponse(
            name=group,
            display_name=group.replace('_', ' ').title(),
            description=f"{group.replace('_', ' ').title()} settings",
            setting_count=count,
            type="website"
        ))
    
    # Add other setting types
    contact_count = db.query(ContactSetting).filter(ContactSetting.is_active == True).count()
    if contact_count > 0:
        groups.append(SettingsGroupResponse(
            name="contact",
            display_name="Contact Information",
            description="Contact details and social links",
            setting_count=contact_count,
            type="contact"
        ))
    
    seo_count = db.query(SeoSetting).filter(SeoSetting.is_active == True).count()
    if seo_count > 0:
        groups.append(SettingsGroupResponse(
            name="seo",
            display_name="SEO Settings",
            description="Search engine optimization settings",
            setting_count=seo_count,
            type="seo"
        ))
    
    appearance_count = db.query(AppearanceSetting).filter(AppearanceSetting.is_active == True).count()
    if appearance_count > 0:
        groups.append(SettingsGroupResponse(
            name="appearance",
            display_name="Appearance",
            description="Theme and layout settings",
            setting_count=appearance_count,
            type="appearance"
        ))
    
    return groups

@router.post("/reset/{setting_key}", response_model=ApiResponse)
async def reset_setting_to_default(
    setting_key: str,
    request: Request,
    current_user: User = Depends(require_permission("settings.update")),
    db: Session = Depends(get_db)
):
    """
    Reset a website setting to its default value
    """
    setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == setting_key).first()
    if not setting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Setting not found"
        )
    
    if not setting.default_value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Setting has no default value"
        )
    
    # Store old value for logging
    old_value = setting.value
    
    # Reset to default
    setting.value = setting.default_value
    setting.updated_at = datetime.now(timezone.utc)
    setting.updated_by = current_user.id
    
    db.commit()
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    log_user_activity(
        db, current_user, "reset", "settings", setting.key,
        description=f"Reset setting {setting.key} to default value",
        user_ip=client_ip,
        old_values={"value": old_value},
        new_values={"value": setting.value}
    )
    
    return ApiResponse(
        success=True,
        message=f"Setting {setting.key} has been reset to default value"
    )

@router.post("/save-as-default", response_model=ApiResponse)
async def save_current_settings_as_default(
    request: Request,
    settings_data: Dict[str, str],
    current_user: User = Depends(require_permission("settings.update")),
    db: Session = Depends(get_db)
):
    """
    Save current website settings as default values
    """
    updated_settings = []
    old_defaults = {}
    new_defaults = {}
    
    for key, value in settings_data.items():
        setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == key).first()
        if setting:
            old_defaults[key] = setting.default_value
            setting.default_value = value
            setting.updated_at = datetime.now(timezone.utc)
            setting.updated_by = current_user.id
            updated_settings.append(key)
            new_defaults[key] = value
    
    if not updated_settings:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid settings found to save as default"
        )
    
    db.commit()
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    log_user_activity(
        db, current_user, "update", "settings", "save_as_default",
        description=f"Saved {len(updated_settings)} settings as default values",
        user_ip=client_ip,
        old_values=old_defaults,
        new_values=new_defaults
    )
    
    return ApiResponse(
        success=True,
        message=f"Successfully saved {len(updated_settings)} settings as default values",
        data={"updated_settings": updated_settings}
    )