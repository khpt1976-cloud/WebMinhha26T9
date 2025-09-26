"""
Website Settings Models for Admin Panel
Handles website configuration, contact info, and general settings
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

# Import Base from database module
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import Base

class SettingType(enum.Enum):
    """Setting types"""
    TEXT = "text"
    TEXTAREA = "textarea"
    HTML = "html"
    IMAGE = "image"
    URL = "url"
    EMAIL = "email"
    PHONE = "phone"
    BOOLEAN = "boolean"
    JSON = "json"
    COLOR = "color"

class SettingGroup(enum.Enum):
    """Setting groups for organization"""
    GENERAL = "general"
    HEADER = "header"
    FOOTER = "footer"
    CONTACT = "contact"
    SOCIAL = "social"
    SEO = "seo"
    APPEARANCE = "appearance"
    SYSTEM = "system"

class WebsiteSetting(Base):
    """
    Website Settings table - Flexible key-value configuration
    """
    __tablename__ = "website_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)
    default_value = Column(Text, nullable=True)
    
    # Metadata
    group = Column(String(50), default=SettingGroup.GENERAL.value, nullable=False)
    type = Column(String(20), default=SettingType.TEXT.value, nullable=False)
    label = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    placeholder = Column(String(255), nullable=True)
    
    # Validation
    is_required = Column(Boolean, default=False)
    validation_rules = Column(JSON, nullable=True)  # JSON validation rules
    options = Column(JSON, nullable=True)  # For select/radio options
    
    # Display
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_system = Column(Boolean, default=False)  # System settings cannot be deleted
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    updater = relationship("User")
    
    @property
    def current_value(self):
        """Get current value or default if empty"""
        return self.value if self.value is not None else self.default_value

class ContactSetting(Base):
    """
    Contact Settings table - Specific for contact information
    """
    __tablename__ = "contact_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Company information
    company_name = Column(String(255), nullable=True)
    company_slogan = Column(String(500), nullable=True)
    company_description = Column(Text, nullable=True)
    
    # Contact details
    primary_phone = Column(String(20), nullable=True)
    secondary_phone = Column(String(20), nullable=True)
    whatsapp_phone = Column(String(20), nullable=True)
    zalo_phone = Column(String(20), nullable=True)  # Có thể khác primary_phone
    
    # Email
    primary_email = Column(String(255), nullable=True)
    support_email = Column(String(255), nullable=True)
    sales_email = Column(String(255), nullable=True)
    
    # Address
    street_address = Column(String(500), nullable=True)
    ward = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    country = Column(String(100), default="Vietnam")
    
    # Business hours
    business_hours = Column(JSON, nullable=True)  # {monday: "8:00-17:00", ...}
    timezone = Column(String(50), default="Asia/Ho_Chi_Minh")
    
    # Social media
    facebook_url = Column(String(500), nullable=True)
    zalo_url = Column(String(500), nullable=True)
    instagram_url = Column(String(500), nullable=True)
    youtube_url = Column(String(500), nullable=True)
    tiktok_url = Column(String(500), nullable=True)
    
    # Maps and location
    google_maps_url = Column(String(1000), nullable=True)
    latitude = Column(String(50), nullable=True)
    longitude = Column(String(50), nullable=True)
    
    # Quick contact buttons
    show_call_button = Column(Boolean, default=True)
    show_zalo_button = Column(Boolean, default=True)
    show_facebook_button = Column(Boolean, default=True)
    call_button_phone = Column(String(20), nullable=True)  # Số cho nút "Gọi ngay"
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    updater = relationship("User")

class SeoSetting(Base):
    """
    SEO Settings table - Search engine optimization settings
    """
    __tablename__ = "seo_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic SEO
    site_title = Column(String(255), nullable=True)
    site_description = Column(Text, nullable=True)
    site_keywords = Column(String(1000), nullable=True)
    
    # Open Graph
    og_title = Column(String(255), nullable=True)
    og_description = Column(Text, nullable=True)
    og_image = Column(String(500), nullable=True)
    og_type = Column(String(50), default="website")
    
    # Twitter Card
    twitter_card = Column(String(50), default="summary_large_image")
    twitter_site = Column(String(100), nullable=True)
    twitter_creator = Column(String(100), nullable=True)
    
    # Technical SEO
    robots_txt = Column(Text, nullable=True)
    sitemap_url = Column(String(500), nullable=True)
    google_analytics_id = Column(String(50), nullable=True)
    google_tag_manager_id = Column(String(50), nullable=True)
    facebook_pixel_id = Column(String(50), nullable=True)
    
    # Schema markup
    schema_organization = Column(JSON, nullable=True)
    schema_website = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    updater = relationship("User")

class AppearanceSetting(Base):
    """
    Appearance Settings table - Theme and visual customization
    """
    __tablename__ = "appearance_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Logo and branding
    logo_url = Column(String(500), nullable=True)
    logo_alt = Column(String(255), nullable=True)
    favicon_url = Column(String(500), nullable=True)
    
    # Colors
    primary_color = Column(String(7), nullable=True)  # Hex color
    secondary_color = Column(String(7), nullable=True)
    accent_color = Column(String(7), nullable=True)
    background_color = Column(String(7), nullable=True)
    text_color = Column(String(7), nullable=True)
    
    # Typography
    primary_font = Column(String(100), nullable=True)
    secondary_font = Column(String(100), nullable=True)
    font_size_base = Column(Integer, default=16)
    
    # Layout
    layout_style = Column(String(50), default="default")  # default, boxed, wide
    header_style = Column(String(50), default="default")
    footer_style = Column(String(50), default="default")
    
    # Custom CSS/JS
    custom_css = Column(Text, nullable=True)
    custom_js = Column(Text, nullable=True)
    custom_head_html = Column(Text, nullable=True)
    custom_footer_html = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    updater = relationship("User")