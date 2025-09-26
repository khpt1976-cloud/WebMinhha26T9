"""
API endpoints cho quản lý ảnh sản phẩm
Thêm vào main.py
"""

from fastapi import UploadFile, File, Form, HTTPException
from image_manager import image_manager

# Thêm các endpoints này vào main.py

@app.post("/api/admin/products/{product_id}/images/upload")
async def upload_product_image(
    product_id: int,
    category: str = Form(...),
    image_type: str = Form(...),  # main, thumb, gallery
    file: UploadFile = File(...)
):
    """Upload ảnh sản phẩm"""
    try:
        result = await image_manager.upload_product_image(
            product_id=product_id,
            category=category,
            image_type=image_type,
            file=file
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/admin/products/{product_id}/images/{image_type}")
async def delete_product_image(
    product_id: int,
    category: str,
    image_type: str  # main, thumb, gallery, all
):
    """Xóa ảnh sản phẩm"""
    try:
        success = image_manager.delete_product_image(
            product_id=product_id,
            category=category,
            image_type=image_type
        )
        if success:
            return {"success": True, "message": "Đã xóa ảnh thành công"}
        else:
            return {"success": False, "message": "Không tìm thấy ảnh để xóa"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/admin/products/{product_id}/images")
async def get_product_images(product_id: int, category: str):
    """Lấy danh sách ảnh của sản phẩm"""
    try:
        images = image_manager.get_product_images(
            product_id=product_id,
            category=category
        )
        return images
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/admin/migrate-images")
async def migrate_existing_images():
    """Di chuyển ảnh cũ sang cấu trúc mới"""
    try:
        image_manager.migrate_existing_images()
        return {"success": True, "message": "Đã di chuyển ảnh thành công"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API để lấy ảnh sản phẩm (cho frontend)
@app.get("/api/products/{product_id}/images")
async def get_product_images_public(product_id: int, category: str):
    """API public để lấy ảnh sản phẩm"""
    try:
        images = image_manager.get_product_images(
            product_id=product_id,
            category=category
        )
        
        # Nếu không có ảnh, trả về ảnh mặc định
        if not images['main']:
            images['main'] = "/static/images/system/no-image.jpg"
        
        if not images['thumb']:
            images['thumb'] = "/static/images/system/no-image.jpg"
            
        return images
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))