"""
Product Management Schemas for Admin Panel
Pydantic models for product, category, and image operations
"""

from datetime import datetime
from typing import List, Optional, Dict, Any, Generic, TypeVar
from pydantic import BaseModel, Field, validator
from decimal import Decimal

T = TypeVar('T')

# ============================================================================
# PRODUCT SCHEMAS
# ============================================================================

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Product name")
    slug: str = Field(..., min_length=1, max_length=255, description="URL slug")
    description: Optional[str] = Field(None, description="Full description")
    short_description: Optional[str] = Field(None, max_length=500, description="Short description")
    sku: Optional[str] = Field(None, max_length=100, description="Stock Keeping Unit")

class ProductCreateRequest(ProductBase):
    price: Optional[Decimal] = Field(None, ge=0, description="Regular price")
    sale_price: Optional[Decimal] = Field(None, ge=0, description="Sale price")
    stock_quantity: int = Field(0, ge=0, description="Stock quantity")
    status: str = Field("draft", description="Product status")
    is_featured: bool = Field(False, description="Featured product flag")
    weight: Optional[Decimal] = Field(None, ge=0, description="Product weight")
    dimensions: Optional[str] = Field(None, max_length=100, description="Product dimensions")
    meta_title: Optional[str] = Field(None, max_length=255, description="SEO title")
    meta_description: Optional[str] = Field(None, max_length=500, description="SEO description")
    meta_keywords: Optional[str] = Field(None, max_length=500, description="SEO keywords")
    category_id: Optional[int] = Field(None, description="Category ID")
    
    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ['draft', 'active', 'inactive', 'out_of_stock']
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v
    
    @validator('sale_price')
    def validate_sale_price(cls, v, values):
        if v is not None and 'price' in values and values['price'] is not None:
            if v >= values['price']:
                raise ValueError('Sale price must be less than regular price')
        return v

class ProductUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = Field(None, max_length=500)
    sku: Optional[str] = Field(None, max_length=100)
    price: Optional[Decimal] = Field(None, ge=0)
    sale_price: Optional[Decimal] = Field(None, ge=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    status: Optional[str] = None
    is_featured: Optional[bool] = None
    weight: Optional[Decimal] = Field(None, ge=0)
    dimensions: Optional[str] = Field(None, max_length=100)
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = Field(None, max_length=500)
    meta_keywords: Optional[str] = Field(None, max_length=500)
    category_id: Optional[int] = None
    
    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ['draft', 'active', 'inactive', 'out_of_stock']
            if v not in allowed_statuses:
                raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v

class CategoryInfo(BaseModel):
    id: int
    name: str
    slug: str

class ProductImageResponse(BaseModel):
    id: int
    image_url: str
    alt_text: Optional[str] = None
    is_main: bool
    sort_order: int

class ProductResponse(ProductBase):
    id: int
    original_price: Optional[float] = None
    sale_price: Optional[float] = None
    current_price: float
    stock_quantity: int
    status: str
    is_featured: bool
    is_hot: bool = False
    is_new: bool = False
    weight: Optional[float] = None
    dimensions: Optional[str] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    rating_average: float = 0.0
    rating_count: int = 0
    main_image_url: Optional[str] = None
    category: Optional[CategoryInfo] = None
    main_image: Optional[str] = None
    images: Optional[List[ProductImageResponse]] = []
    image_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    limit: int
    total_pages: int

class ProductStatsResponse(BaseModel):
    total_products: int
    active_products: int
    draft_products: int
    out_of_stock_products: int
    featured_products: int
    low_stock_products: int
    category_distribution: Dict[str, int]

# ============================================================================
# CATEGORY SCHEMAS
# ============================================================================

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Category name")
    slug: str = Field(..., min_length=1, max_length=255, description="URL slug")
    description: Optional[str] = Field(None, description="Category description")

class CategoryCreateRequest(CategoryBase):
    parent_id: Optional[int] = Field(None, description="Parent category ID")
    sort_order: int = Field(0, description="Sort order")
    meta_title: Optional[str] = Field(None, max_length=255, description="SEO title")
    meta_description: Optional[str] = Field(None, max_length=500, description="SEO description")
    meta_keywords: Optional[str] = Field(None, max_length=500, description="SEO keywords")
    image_url: Optional[str] = Field(None, max_length=500, description="Category image URL")
    is_active: bool = Field(True, description="Active status")

class CategoryUpdateRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    slug: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    parent_id: Optional[int] = None
    sort_order: Optional[int] = None
    meta_title: Optional[str] = Field(None, max_length=255)
    meta_description: Optional[str] = Field(None, max_length=500)
    meta_keywords: Optional[str] = Field(None, max_length=500)
    image_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    id: int
    parent_id: Optional[int] = None
    sort_order: int
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    product_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class CategoryListResponse(BaseModel):
    categories: List[CategoryResponse]

# ============================================================================
# PRODUCT IMAGE SCHEMAS
# ============================================================================

class ProductImageCreateRequest(BaseModel):
    image_url: str = Field(..., max_length=500, description="Image URL")
    alt_text: Optional[str] = Field(None, max_length=255, description="Alt text")
    is_main: bool = Field(False, description="Main image flag")
    sort_order: int = Field(0, description="Sort order")

class ProductImageUpdateRequest(BaseModel):
    image_url: Optional[str] = Field(None, max_length=500)
    alt_text: Optional[str] = Field(None, max_length=255)
    is_main: Optional[bool] = None
    sort_order: Optional[int] = None

# ============================================================================
# COMMON SCHEMAS
# ============================================================================

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str
    data: Optional[T] = None