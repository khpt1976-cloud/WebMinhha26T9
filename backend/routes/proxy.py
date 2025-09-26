"""
🔄 Proxy Routes - Bypass CORS issues
"""
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
import os

router = APIRouter(prefix="/proxy", tags=["proxy"])

@router.get("/health")
async def proxy_health():
    """
    Proxy health check - Always returns local backend health
    """
    return {
        "status": "healthy",
        "service": "Admin Panel API - Proxy",
        "version": "1.0.0",
        "cors_bypass": True
    }

@router.get("/products")
async def proxy_products():
    """
    Proxy products API - Returns products from local backend
    """
    try:
        # Import here to avoid circular imports
        from database import get_db
        from models.product_models import Product, Category
        from sqlalchemy.orm import Session
        
        # Get database session
        db = next(get_db())
        
        # Query products
        products = db.query(Product).all()
        
        # Convert to dict
        products_data = []
        for product in products:
            products_data.append({
                "id": product.id,
                "title": product.name,  # Use 'name' field as 'title'
                "name": product.name,
                "price": float(product.original_price) if product.original_price else 0,
                "sale_price": float(product.sale_price) if product.sale_price else None,
                "category": product.category.name if product.category else "Uncategorized",
                "image": product.main_image_url if hasattr(product, 'main_image_url') else None,
                "description": product.short_description or product.description,
                "stock": product.stock_quantity,
                "sku": product.sku,
                "status": product.status.value if hasattr(product, 'status') and hasattr(product.status, 'value') else (product.status if hasattr(product, 'status') else "active"),
                "created_at": product.created_at.isoformat() if product.created_at else None
            })
        
        return products_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching products: {str(e)}")

@router.get("/categories")
async def proxy_categories():
    """
    Proxy categories API
    """
    try:
        from database import get_db
        from models.product_models import Product, Category
        from sqlalchemy.orm import Session
        from sqlalchemy import distinct
        
        db = next(get_db())
        
        # Get unique categories
        categories = db.query(distinct(Product.category)).filter(Product.category.isnot(None)).all()
        categories_list = [cat[0] for cat in categories if cat[0]]
        
        return {
            "categories": categories_list,
            "total": len(categories_list)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching categories: {str(e)}")

@router.get("/stats")
async def proxy_stats():
    """
    Proxy stats API
    """
    try:
        from database import get_db
        from models.product_models import Product, Category
        from sqlalchemy.orm import Session
        from sqlalchemy import func
        
        db = next(get_db())
        
        # Get stats
        total_products = db.query(Product).count()
        total_categories = db.query(func.count(func.distinct(Product.category))).scalar()
        total_stock = db.query(func.sum(Product.stock)).scalar() or 0
        avg_price = db.query(func.avg(Product.price)).scalar() or 0
        
        return {
            "total_products": total_products,
            "total_categories": total_categories,
            "total_stock": int(total_stock),
            "average_price": round(float(avg_price), 2),
            "cors_bypass": True
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")