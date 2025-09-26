"""
Product Management Models for Admin Panel
Handles categories, products, and product images
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

# Import Base from database module
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import Base

class ProductStatus(enum.Enum):
    """Product status"""
    DRAFT = "draft"          # Bản nháp
    ACTIVE = "active"        # Đang bán
    INACTIVE = "inactive"    # Tạm ngừng
    OUT_OF_STOCK = "out_of_stock"  # Hết hàng

class ImageType(enum.Enum):
    """Product image types"""
    MAIN = "main"           # Ảnh chính
    THUMBNAIL = "thumbnail" # Ảnh thumbnail
    GALLERY = "gallery"     # Ảnh gallery

class Category(Base):
    """
    Product Categories table
    """
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    
    # Hierarchy support
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    sort_order = Column(Integer, default=0)
    
    # SEO
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    meta_keywords = Column(String(500), nullable=True)
    
    # Display settings
    image_url = Column(String(500), nullable=True)
    icon_class = Column(String(100), nullable=True)  # CSS icon class
    color = Column(String(7), nullable=True)  # Hex color code
    
    # Status
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    parent = relationship("Category", remote_side=[id])
    children = relationship("Category")
    products = relationship("Product", back_populates="category")
    creator = relationship("User")

class Product(Base):
    """
    Products table
    """
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    sku = Column(String(100), unique=True, nullable=True, index=True)  # Mã sản phẩm
    
    # Category
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    # Pricing
    original_price = Column(Numeric(12, 2), nullable=False)  # Giá gốc
    sale_price = Column(Numeric(12, 2), nullable=True)       # Giá khuyến mãi
    cost_price = Column(Numeric(12, 2), nullable=True)       # Giá vốn
    
    # Content
    short_description = Column(Text, nullable=True)
    description = Column(Text, nullable=True)  # Rich text from CKEditor
    specifications = Column(JSON, nullable=True)  # Technical specs
    
    # Inventory
    stock_quantity = Column(Integer, default=0)
    min_stock_level = Column(Integer, default=0)
    max_stock_level = Column(Integer, nullable=True)
    
    # Product attributes
    weight = Column(Numeric(8, 2), nullable=True)  # kg
    dimensions = Column(JSON, nullable=True)  # {length, width, height}
    color = Column(String(50), nullable=True)
    material = Column(String(100), nullable=True)
    brand = Column(String(100), nullable=True)
    
    # Status and flags
    status = Column(String(20), default=ProductStatus.DRAFT.value, nullable=False)
    is_featured = Column(Boolean, default=False)
    is_hot = Column(Boolean, default=False)  # Nhãn "HOT"
    is_new = Column(Boolean, default=False)
    is_bestseller = Column(Boolean, default=False)
    
    # SEO
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    meta_keywords = Column(String(500), nullable=True)
    
    # Analytics
    view_count = Column(Integer, default=0)
    purchase_count = Column(Integer, default=0)
    rating_average = Column(Numeric(3, 2), default=0.0)
    rating_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    creator = relationship("User")
    
    @property
    def current_price(self):
        """Get current selling price (sale price if available, otherwise original price)"""
        return self.sale_price if self.sale_price else self.original_price
    
    @property
    def discount_percentage(self):
        """Calculate discount percentage"""
        if self.sale_price and self.original_price > self.sale_price:
            return round(((self.original_price - self.sale_price) / self.original_price) * 100, 2)
        return 0
    
    @property
    def is_on_sale(self):
        """Check if product is on sale"""
        return self.sale_price is not None and self.sale_price < self.original_price
    
    @property
    def is_in_stock(self):
        """Check if product is in stock"""
        return self.stock_quantity > 0
    
    @property
    def main_image(self):
        """Get main product image"""
        for image in self.images:
            if image.image_type == ImageType.MAIN.value:
                return image
        return self.images[0] if self.images else None

class ProductImage(Base):
    """
    Product Images table
    """
    __tablename__ = "product_images"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    # Image details
    image_type = Column(String(20), default=ImageType.GALLERY.value, nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_url = Column(String(500), nullable=False)
    
    # Image metadata
    file_size = Column(Integer, nullable=True)  # bytes
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    
    # Display settings
    alt_text = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    product = relationship("Product", back_populates="images")
    uploader = relationship("User")