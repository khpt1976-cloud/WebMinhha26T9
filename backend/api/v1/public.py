"""
Public API endpoints for frontend website
No authentication required
"""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from database import get_db
from models.product_models import Product, Category, ProductImage, ProductStatus
from schemas.product_schemas import (
    ProductResponse, ProductListResponse,
    CategoryResponse, CategoryListResponse,
    ApiResponse
)

router = APIRouter(prefix="/public", tags=["Public API"])

# ============================================================================
# PUBLIC PRODUCT ENDPOINTS
# ============================================================================

@router.get("/products/", response_model=ProductListResponse)
async def get_public_products(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or description"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    db: Session = Depends(get_db)
):
    """
    Get paginated list of active products for public website
    """
    # Build query - only active products
    query = db.query(Product).filter(Product.status == ProductStatus.ACTIVE.value)
    
    # Apply filters
    if search:
        search_filter = or_(
            Product.name.ilike(f"%{search}%"),
            Product.description.ilike(f"%{search}%"),
            Product.short_description.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply sorting
    if hasattr(Product, sort_by):
        sort_column = getattr(Product, sort_by)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())
    
    # Apply pagination
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()
    
    # Convert to response format
    product_responses = []
    for product in products:
        # Get main image
        main_image_url = None
        if product.main_image:
            main_image_url = product.main_image.file_url
        
        product_response = ProductResponse(
            id=product.id,
            name=product.name,
            slug=product.slug,
            description=product.description,
            short_description=product.short_description,
            original_price=float(product.original_price) if product.original_price else 0.0,
            sale_price=float(product.sale_price) if product.sale_price else None,
            current_price=float(product.current_price),
            category_id=product.category_id,
            category_name=product.category.name if product.category else "",
            status=product.status,
            is_featured=product.is_featured,
            is_hot=product.is_hot,
            is_new=product.is_new,
            stock_quantity=product.stock_quantity,
            rating_average=float(product.rating_average) if product.rating_average else 0.0,
            rating_count=product.rating_count,
            main_image_url=main_image_url,
            created_at=product.created_at,
            updated_at=product.updated_at
        )
        product_responses.append(product_response)
    
    return ProductListResponse(
        products=product_responses,
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit
    )

@router.get("/products/{product_id}/", response_model=ApiResponse[ProductResponse])
async def get_public_product(
    product_id: int,
    db: Session = Depends(get_db)
):
    """
    Get single product details for public website
    """
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.status == ProductStatus.ACTIVE.value
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Get main image
    main_image_url = None
    if product.main_image:
        main_image_url = product.main_image.file_url
    
    product_response = ProductResponse(
        id=product.id,
        name=product.name,
        slug=product.slug,
        description=product.description,
        short_description=product.short_description,
        original_price=float(product.original_price) if product.original_price else 0.0,
        sale_price=float(product.sale_price) if product.sale_price else None,
        current_price=float(product.current_price),
        category_id=product.category_id,
        category_name=product.category.name if product.category else "",
        status=product.status,
        is_featured=product.is_featured,
        is_hot=product.is_hot,
        is_new=product.is_new,
        stock_quantity=product.stock_quantity,
        rating_average=float(product.rating_average) if product.rating_average else 0.0,
        rating_count=product.rating_count,
        main_image_url=main_image_url,
        created_at=product.created_at,
        updated_at=product.updated_at
    )
    
    return ApiResponse(
        success=True,
        message="Product retrieved successfully",
        data=product_response
    )

# ============================================================================
# PUBLIC CATEGORY ENDPOINTS
# ============================================================================

@router.get("/categories/", response_model=CategoryListResponse)
async def get_public_categories(
    db: Session = Depends(get_db)
):
    """
    Get all categories for public website
    """
    categories = db.query(Category).filter(Category.is_active == True).order_by(Category.sort_order).all()
    
    category_responses = []
    for category in categories:
        # Count active products in category
        product_count = db.query(Product).filter(
            Product.category_id == category.id,
            Product.status == ProductStatus.ACTIVE.value
        ).count()
        
        category_response = CategoryResponse(
            id=category.id,
            name=category.name,
            slug=category.slug,
            description=category.description,
            parent_id=category.parent_id,
            sort_order=category.sort_order,
            is_active=category.is_active,
            product_count=product_count,
            created_at=category.created_at,
            updated_at=category.updated_at
        )
        category_responses.append(category_response)
    
    return CategoryListResponse(
        categories=category_responses
    )

@router.get("/categories/{category_slug}/", response_model=ApiResponse[CategoryResponse])
async def get_public_category(
    category_slug: str,
    db: Session = Depends(get_db)
):
    """
    Get single category by slug for public website
    """
    category = db.query(Category).filter(
        Category.slug == category_slug,
        Category.is_active == True
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Count active products in category
    product_count = db.query(Product).filter(
        Product.category_id == category.id,
        Product.status == ProductStatus.ACTIVE.value
    ).count()
    
    category_response = CategoryResponse(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        parent_id=category.parent_id,
        sort_order=category.sort_order,
        is_active=category.is_active,
        product_count=product_count,
        created_at=category.created_at,
        updated_at=category.updated_at
    )
    
    return ApiResponse(
        success=True,
        message="Category retrieved successfully",
        data=category_response
    )