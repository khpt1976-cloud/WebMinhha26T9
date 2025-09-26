"""
Product Management API endpoints for Admin Panel
Handles CRUD operations for products, categories, and product images
"""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from database import get_db
from models.product_models import Product, Category, ProductImage, ProductStatus
from models.user_models import User
from auth.dependencies import (
    AuthDependencies, 
    log_user_activity,
    require_permission
)
from schemas.product_schemas import (
    ProductResponse, ProductCreateRequest, ProductUpdateRequest, ProductListResponse,
    CategoryResponse, CategoryCreateRequest, CategoryUpdateRequest, CategoryListResponse,
    ProductImageResponse, ProductStatsResponse, ApiResponse
)

router = APIRouter(prefix="/products", tags=["Product Management"])

# ============================================================================
# PRODUCT ENDPOINTS
# ============================================================================

@router.get("/", response_model=ProductListResponse)
async def get_products(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by name or description"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    current_user: User = Depends(require_permission("products.read")),
    db: Session = Depends(get_db)
):
    """
    Get paginated list of products with filtering and search
    """
    # Build query
    query = db.query(Product)
    
    # Apply filters
    if search:
        search_filter = or_(
            Product.name.ilike(f"%{search}%"),
            Product.description.ilike(f"%{search}%"),
            Product.sku.ilike(f"%{search}%")
        )
        query = query.filter(search_filter)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    
    if status:
        query = query.filter(Product.status == status)
    
    # Apply sorting
    if hasattr(Product, sort_by):
        order_column = getattr(Product, sort_by)
        if sort_order == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    offset = (page - 1) * limit
    products = query.offset(offset).limit(limit).all()
    
    # Convert to response format
    product_responses = []
    for product in products:
        # Get main image
        main_image = None
        if product.images:
            main_image_obj = next((img for img in product.images if img.is_main), product.images[0])
            main_image = main_image_obj.image_url if main_image_obj else None
        
        product_responses.append(ProductResponse(
            id=product.id,
            name=product.name,
            slug=product.slug,
            description=product.description,
            short_description=product.short_description,
            sku=product.sku,
            price=float(product.price) if product.price else None,
            sale_price=float(product.sale_price) if product.sale_price else None,
            stock_quantity=product.stock_quantity,
            status=product.status,
            is_featured=product.is_featured,
            weight=float(product.weight) if product.weight else None,
            dimensions=product.dimensions,
            meta_title=product.meta_title,
            meta_description=product.meta_description,
            meta_keywords=product.meta_keywords,
            category={
                "id": product.category.id,
                "name": product.category.name,
                "slug": product.category.slug
            } if product.category else None,
            main_image=main_image,
            image_count=len(product.images),
            created_at=product.created_at,
            updated_at=product.updated_at
        ))
    
    return ProductListResponse(
        products=product_responses,
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit
    )

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    current_user: User = Depends(require_permission("products.read")),
    db: Session = Depends(get_db)
):
    """
    Get product by ID with full details
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Get all images
    images = []
    for img in product.images:
        images.append(ProductImageResponse(
            id=img.id,
            image_url=img.image_url,
            alt_text=img.alt_text,
            is_main=img.is_main,
            sort_order=img.sort_order
        ))
    
    # Get main image
    main_image = None
    if product.images:
        main_image_obj = next((img for img in product.images if img.is_main), product.images[0])
        main_image = main_image_obj.image_url if main_image_obj else None
    
    return ProductResponse(
        id=product.id,
        name=product.name,
        slug=product.slug,
        description=product.description,
        short_description=product.short_description,
        sku=product.sku,
        price=float(product.price) if product.price else None,
        sale_price=float(product.sale_price) if product.sale_price else None,
        stock_quantity=product.stock_quantity,
        status=product.status,
        is_featured=product.is_featured,
        weight=float(product.weight) if product.weight else None,
        dimensions=product.dimensions,
        meta_title=product.meta_title,
        meta_description=product.meta_description,
        meta_keywords=product.meta_keywords,
        category={
            "id": product.category.id,
            "name": product.category.name,
            "slug": product.category.slug
        } if product.category else None,
        main_image=main_image,
        images=images,
        image_count=len(product.images),
        created_at=product.created_at,
        updated_at=product.updated_at
    )

@router.post("/", response_model=ProductResponse)
async def create_product(
    request: Request,
    product_data: ProductCreateRequest,
    current_user: User = Depends(require_permission("products.create")),
    db: Session = Depends(get_db)
):
    """
    Create new product
    """
    # Check if SKU already exists
    if product_data.sku and db.query(Product).filter(Product.sku == product_data.sku).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="SKU already exists"
        )
    
    # Check if slug already exists
    if db.query(Product).filter(Product.slug == product_data.slug).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug already exists"
        )
    
    # Validate category
    if product_data.category_id:
        category = db.query(Category).filter(Category.id == product_data.category_id).first()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid category ID"
            )
    
    # Create new product
    new_product = Product(
        name=product_data.name,
        slug=product_data.slug,
        description=product_data.description,
        short_description=product_data.short_description,
        sku=product_data.sku,
        price=product_data.price,
        sale_price=product_data.sale_price,
        stock_quantity=product_data.stock_quantity,
        status=product_data.status,
        is_featured=product_data.is_featured,
        weight=product_data.weight,
        dimensions=product_data.dimensions,
        meta_title=product_data.meta_title,
        meta_description=product_data.meta_description,
        meta_keywords=product_data.meta_keywords,
        category_id=product_data.category_id
    )
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    log_user_activity(
        db, current_user, "create", "products", str(new_product.id),
        description=f"Created product {new_product.name}",
        user_ip=client_ip,
        new_values={
            "name": new_product.name,
            "sku": new_product.sku,
            "price": float(new_product.price) if new_product.price else None,
            "status": new_product.status,
            "category_id": new_product.category_id
        }
    )
    
    # Return created product
    return ProductResponse(
        id=new_product.id,
        name=new_product.name,
        slug=new_product.slug,
        description=new_product.description,
        short_description=new_product.short_description,
        sku=new_product.sku,
        price=float(new_product.price) if new_product.price else None,
        sale_price=float(new_product.sale_price) if new_product.sale_price else None,
        stock_quantity=new_product.stock_quantity,
        status=new_product.status,
        is_featured=new_product.is_featured,
        weight=float(new_product.weight) if new_product.weight else None,
        dimensions=new_product.dimensions,
        meta_title=new_product.meta_title,
        meta_description=new_product.meta_description,
        meta_keywords=new_product.meta_keywords,
        category={
            "id": new_product.category.id,
            "name": new_product.category.name,
            "slug": new_product.category.slug
        } if new_product.category else None,
        main_image=None,
        images=[],
        image_count=0,
        created_at=new_product.created_at,
        updated_at=new_product.updated_at
    )

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    request: Request,
    product_data: ProductUpdateRequest,
    current_user: User = Depends(require_permission("products.update")),
    db: Session = Depends(get_db)
):
    """
    Update product
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Store old values for logging
    old_values = {
        "name": product.name,
        "sku": product.sku,
        "price": float(product.price) if product.price else None,
        "sale_price": float(product.sale_price) if product.sale_price else None,
        "stock_quantity": product.stock_quantity,
        "status": product.status,
        "category_id": product.category_id
    }
    
    # Check SKU uniqueness if changed
    if product_data.sku and product_data.sku != product.sku:
        if db.query(Product).filter(Product.sku == product_data.sku).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SKU already exists"
            )
        product.sku = product_data.sku
    
    # Check slug uniqueness if changed
    if product_data.slug and product_data.slug != product.slug:
        if db.query(Product).filter(Product.slug == product_data.slug).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slug already exists"
            )
        product.slug = product_data.slug
    
    # Update other fields
    if product_data.name is not None:
        product.name = product_data.name
    if product_data.description is not None:
        product.description = product_data.description
    if product_data.short_description is not None:
        product.short_description = product_data.short_description
    if product_data.price is not None:
        product.price = product_data.price
    if product_data.sale_price is not None:
        product.sale_price = product_data.sale_price
    if product_data.stock_quantity is not None:
        product.stock_quantity = product_data.stock_quantity
    if product_data.status is not None:
        product.status = product_data.status
    if product_data.is_featured is not None:
        product.is_featured = product_data.is_featured
    if product_data.weight is not None:
        product.weight = product_data.weight
    if product_data.dimensions is not None:
        product.dimensions = product_data.dimensions
    if product_data.meta_title is not None:
        product.meta_title = product_data.meta_title
    if product_data.meta_description is not None:
        product.meta_description = product_data.meta_description
    if product_data.meta_keywords is not None:
        product.meta_keywords = product_data.meta_keywords
    
    # Update category if provided
    if product_data.category_id is not None:
        if product_data.category_id:
            category = db.query(Category).filter(Category.id == product_data.category_id).first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid category ID"
                )
        product.category_id = product_data.category_id
    
    product.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(product)
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    new_values = {
        "name": product.name,
        "sku": product.sku,
        "price": float(product.price) if product.price else None,
        "sale_price": float(product.sale_price) if product.sale_price else None,
        "stock_quantity": product.stock_quantity,
        "status": product.status,
        "category_id": product.category_id
    }
    
    log_user_activity(
        db, current_user, "update", "products", str(product.id),
        description=f"Updated product {product.name}",
        user_ip=client_ip,
        old_values=old_values,
        new_values=new_values
    )
    
    # Get images for response
    images = []
    for img in product.images:
        images.append(ProductImageResponse(
            id=img.id,
            image_url=img.image_url,
            alt_text=img.alt_text,
            is_main=img.is_main,
            sort_order=img.sort_order
        ))
    
    # Get main image
    main_image = None
    if product.images:
        main_image_obj = next((img for img in product.images if img.is_main), product.images[0])
        main_image = main_image_obj.image_url if main_image_obj else None
    
    return ProductResponse(
        id=product.id,
        name=product.name,
        slug=product.slug,
        description=product.description,
        short_description=product.short_description,
        sku=product.sku,
        price=float(product.price) if product.price else None,
        sale_price=float(product.sale_price) if product.sale_price else None,
        stock_quantity=product.stock_quantity,
        status=product.status,
        is_featured=product.is_featured,
        weight=float(product.weight) if product.weight else None,
        dimensions=product.dimensions,
        meta_title=product.meta_title,
        meta_description=product.meta_description,
        meta_keywords=product.meta_keywords,
        category={
            "id": product.category.id,
            "name": product.category.name,
            "slug": product.category.slug
        } if product.category else None,
        main_image=main_image,
        images=images,
        image_count=len(product.images),
        created_at=product.created_at,
        updated_at=product.updated_at
    )

@router.delete("/{product_id}", response_model=ApiResponse)
async def delete_product(
    product_id: int,
    request: Request,
    current_user: User = Depends(require_permission("products.delete")),
    db: Session = Depends(get_db)
):
    """
    Delete product (soft delete by setting status to inactive)
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Soft delete by setting status to inactive
    old_status = product.status
    product.status = ProductStatus.INACTIVE.value
    product.updated_at = datetime.now(timezone.utc)
    db.commit()
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    log_user_activity(
        db, current_user, "delete", "products", str(product.id),
        description=f"Deleted product {product.name}",
        user_ip=client_ip,
        old_values={"status": old_status},
        new_values={"status": product.status}
    )
    
    return ApiResponse(
        success=True,
        message=f"Product {product.name} has been deleted successfully"
    )

@router.get("/stats/overview", response_model=ProductStatsResponse)
async def get_product_stats(
    current_user: User = Depends(require_permission("products.read")),
    db: Session = Depends(get_db)
):
    """
    Get product statistics for dashboard
    """
    # Get product counts by status
    total_products = db.query(Product).count()
    active_products = db.query(Product).filter(Product.status == ProductStatus.ACTIVE.value).count()
    draft_products = db.query(Product).filter(Product.status == ProductStatus.DRAFT.value).count()
    out_of_stock = db.query(Product).filter(Product.status == ProductStatus.OUT_OF_STOCK.value).count()
    featured_products = db.query(Product).filter(Product.is_featured == True).count()
    
    # Get low stock products (stock <= 5)
    low_stock_products = db.query(Product).filter(Product.stock_quantity <= 5).count()
    
    # Get products by category
    category_stats = db.query(
        Category.name,
        func.count(Product.id).label('count')
    ).join(Product).group_by(Category.id, Category.name).all()
    
    return ProductStatsResponse(
        total_products=total_products,
        active_products=active_products,
        draft_products=draft_products,
        out_of_stock_products=out_of_stock,
        featured_products=featured_products,
        low_stock_products=low_stock_products,
        category_distribution={category: count for category, count in category_stats}
    )

# ============================================================================
# CATEGORY ENDPOINTS
# ============================================================================

@router.get("/categories/", response_model=CategoryListResponse)
async def get_categories(
    current_user: User = Depends(require_permission("categories.read")),
    db: Session = Depends(get_db)
):
    """
    Get all categories with product counts
    """
    categories = db.query(Category).order_by(Category.sort_order, Category.name).all()
    
    category_responses = []
    for category in categories:
        product_count = db.query(Product).filter(Product.category_id == category.id).count()
        
        category_responses.append(CategoryResponse(
            id=category.id,
            name=category.name,
            slug=category.slug,
            description=category.description,
            parent_id=category.parent_id,
            sort_order=category.sort_order,
            meta_title=category.meta_title,
            meta_description=category.meta_description,
            meta_keywords=category.meta_keywords,
            image_url=category.image_url,
            is_active=category.is_active,
            product_count=product_count,
            created_at=category.created_at,
            updated_at=category.updated_at
        ))
    
    return CategoryListResponse(categories=category_responses)

@router.get("/categories/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    current_user: User = Depends(require_permission("categories.read")),
    db: Session = Depends(get_db)
):
    """
    Get category by ID
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    product_count = db.query(Product).filter(Product.category_id == category.id).count()
    
    return CategoryResponse(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        parent_id=category.parent_id,
        sort_order=category.sort_order,
        meta_title=category.meta_title,
        meta_description=category.meta_description,
        meta_keywords=category.meta_keywords,
        image_url=category.image_url,
        is_active=category.is_active,
        product_count=product_count,
        created_at=category.created_at,
        updated_at=category.updated_at
    )

@router.post("/categories/", response_model=CategoryResponse)
async def create_category(
    request: Request,
    category_data: CategoryCreateRequest,
    current_user: User = Depends(require_permission("categories.create")),
    db: Session = Depends(get_db)
):
    """
    Create new category
    """
    # Check if slug already exists
    if db.query(Category).filter(Category.slug == category_data.slug).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slug already exists"
        )
    
    # Validate parent category if provided
    if category_data.parent_id:
        parent = db.query(Category).filter(Category.id == category_data.parent_id).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid parent category ID"
            )
    
    # Create new category
    new_category = Category(
        name=category_data.name,
        slug=category_data.slug,
        description=category_data.description,
        parent_id=category_data.parent_id,
        sort_order=category_data.sort_order,
        meta_title=category_data.meta_title,
        meta_description=category_data.meta_description,
        meta_keywords=category_data.meta_keywords,
        image_url=category_data.image_url,
        is_active=category_data.is_active
    )
    
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    log_user_activity(
        db, current_user, "create", "categories", str(new_category.id),
        description=f"Created category {new_category.name}",
        user_ip=client_ip,
        new_values={
            "name": new_category.name,
            "slug": new_category.slug,
            "parent_id": new_category.parent_id,
            "is_active": new_category.is_active
        }
    )
    
    return CategoryResponse(
        id=new_category.id,
        name=new_category.name,
        slug=new_category.slug,
        description=new_category.description,
        parent_id=new_category.parent_id,
        sort_order=new_category.sort_order,
        meta_title=new_category.meta_title,
        meta_description=new_category.meta_description,
        meta_keywords=new_category.meta_keywords,
        image_url=new_category.image_url,
        is_active=new_category.is_active,
        product_count=0,
        created_at=new_category.created_at,
        updated_at=new_category.updated_at
    )

@router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    request: Request,
    category_data: CategoryUpdateRequest,
    current_user: User = Depends(require_permission("categories.update")),
    db: Session = Depends(get_db)
):
    """
    Update category
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Store old values for logging
    old_values = {
        "name": category.name,
        "slug": category.slug,
        "parent_id": category.parent_id,
        "is_active": category.is_active
    }
    
    # Check slug uniqueness if changed
    if category_data.slug and category_data.slug != category.slug:
        if db.query(Category).filter(Category.slug == category_data.slug).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slug already exists"
            )
        category.slug = category_data.slug
    
    # Validate parent category if changed
    if category_data.parent_id is not None and category_data.parent_id != category.parent_id:
        if category_data.parent_id:
            parent = db.query(Category).filter(Category.id == category_data.parent_id).first()
            if not parent:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid parent category ID"
                )
            # Prevent circular reference
            if category_data.parent_id == category.id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Category cannot be its own parent"
                )
        category.parent_id = category_data.parent_id
    
    # Update other fields
    if category_data.name is not None:
        category.name = category_data.name
    if category_data.description is not None:
        category.description = category_data.description
    if category_data.sort_order is not None:
        category.sort_order = category_data.sort_order
    if category_data.meta_title is not None:
        category.meta_title = category_data.meta_title
    if category_data.meta_description is not None:
        category.meta_description = category_data.meta_description
    if category_data.meta_keywords is not None:
        category.meta_keywords = category_data.meta_keywords
    if category_data.image_url is not None:
        category.image_url = category_data.image_url
    if category_data.is_active is not None:
        category.is_active = category_data.is_active
    
    category.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(category)
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    new_values = {
        "name": category.name,
        "slug": category.slug,
        "parent_id": category.parent_id,
        "is_active": category.is_active
    }
    
    log_user_activity(
        db, current_user, "update", "categories", str(category.id),
        description=f"Updated category {category.name}",
        user_ip=client_ip,
        old_values=old_values,
        new_values=new_values
    )
    
    product_count = db.query(Product).filter(Product.category_id == category.id).count()
    
    return CategoryResponse(
        id=category.id,
        name=category.name,
        slug=category.slug,
        description=category.description,
        parent_id=category.parent_id,
        sort_order=category.sort_order,
        meta_title=category.meta_title,
        meta_description=category.meta_description,
        meta_keywords=category.meta_keywords,
        image_url=category.image_url,
        is_active=category.is_active,
        product_count=product_count,
        created_at=category.created_at,
        updated_at=category.updated_at
    )

@router.delete("/categories/{category_id}", response_model=ApiResponse)
async def delete_category(
    category_id: int,
    request: Request,
    current_user: User = Depends(require_permission("categories.delete")),
    db: Session = Depends(get_db)
):
    """
    Delete category (only if no products are assigned)
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if category has products
    product_count = db.query(Product).filter(Product.category_id == category.id).count()
    if product_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category. {product_count} products are assigned to this category."
        )
    
    # Check if category has child categories
    child_count = db.query(Category).filter(Category.parent_id == category.id).count()
    if child_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category. {child_count} child categories exist."
        )
    
    # Delete category
    category_name = category.name
    db.delete(category)
    db.commit()
    
    # Log activity
    client_ip = request.client.host if request.client else "unknown"
    log_user_activity(
        db, current_user, "delete", "categories", str(category_id),
        description=f"Deleted category {category_name}",
        user_ip=client_ip,
        old_values={
            "name": category_name,
            "slug": category.slug
        }
    )
    
    return ApiResponse(
        success=True,
        message=f"Category {category_name} has been deleted successfully"
    )