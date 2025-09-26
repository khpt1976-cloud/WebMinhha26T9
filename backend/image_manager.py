"""
Hệ thống quản lý ảnh sản phẩm
"""
import os
import shutil
from typing import List, Optional
from fastapi import UploadFile, HTTPException
from PIL import Image
import uuid
from pathlib import Path

class ImageManager:
    def __init__(self, base_path: str = "static"):
        self.base_path = Path(base_path)
        self.images_path = self.base_path / "images"
        self.products_path = self.images_path / "products"
        self.uploads_path = self.base_path / "uploads" / "temp"
        
        # Tạo thư mục nếu chưa có
        self._create_directories()
    
    def _create_directories(self):
        """Tạo cấu trúc thư mục"""
        directories = [
            self.images_path,
            self.products_path,
            self.uploads_path,
            self.images_path / "categories",
            self.images_path / "banners", 
            self.images_path / "system"
        ]
        
        # Tạo thư mục cho từng danh mục sản phẩm
        categories = ["vong-xep", "rem-man", "gia-phoi", "ban-ghe", "gia-treo", "san-pham-khac", "giam-gia"]
        for category in categories:
            directories.append(self.products_path / category)
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    def validate_image(self, file: UploadFile) -> bool:
        """Validate file ảnh"""
        # Kiểm tra extension
        allowed_extensions = {'.jpg', '.jpeg', '.png', '.webp'}
        file_ext = Path(file.filename).suffix.lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Chỉ chấp nhận file: jpg, jpeg, png, webp")
        
        # Kiểm tra kích thước file (max 5MB)
        if file.size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File không được vượt quá 5MB")
        
        return True
    
    def resize_image(self, image_path: Path, sizes: dict) -> dict:
        """Resize ảnh theo các kích thước khác nhau"""
        results = {}
        
        try:
            with Image.open(image_path) as img:
                # Convert sang RGB nếu cần
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                for size_name, (width, height) in sizes.items():
                    # Resize giữ tỷ lệ
                    img_resized = img.copy()
                    img_resized.thumbnail((width, height), Image.Resampling.LANCZOS)
                    
                    # Tạo tên file mới
                    base_name = image_path.stem
                    extension = image_path.suffix
                    new_filename = f"{base_name}_{size_name}{extension}"
                    new_path = image_path.parent / new_filename
                    
                    # Lưu ảnh đã resize
                    img_resized.save(new_path, quality=85, optimize=True)
                    results[size_name] = new_path
                    
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Lỗi xử lý ảnh: {str(e)}")
        
        return results
    
    async def upload_product_image(
        self, 
        product_id: int, 
        category: str,
        image_type: str,
        file: UploadFile
    ) -> dict:
        """Upload ảnh sản phẩm"""
        
        # Validate
        self.validate_image(file)
        
        if image_type not in ['main', 'thumb', 'gallery']:
            raise HTTPException(status_code=400, detail="image_type phải là: main, thumb, gallery")
        
        # Tạo tên file
        file_extension = Path(file.filename).suffix.lower()
        if image_type == 'gallery':
            # Đếm số ảnh gallery hiện có
            gallery_count = len(list((self.products_path / category).glob(f"{product_id}_gallery_*{file_extension}")))
            filename = f"{product_id}_gallery_{gallery_count + 1}{file_extension}"
        else:
            filename = f"{product_id}_{image_type}{file_extension}"
        
        # Đường dẫn lưu file
        category_path = self.products_path / category
        file_path = category_path / filename
        
        try:
            # Lưu file tạm
            temp_path = self.uploads_path / f"{uuid.uuid4()}{file_extension}"
            with open(temp_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Di chuyển file đến vị trí cuối cùng
            shutil.move(str(temp_path), str(file_path))
            
            # Tạo các kích thước khác nhau nếu là ảnh main
            sizes_created = {}
            if image_type == 'main':
                sizes = {
                    'thumb': (300, 225),
                    'medium': (600, 450)
                }
                sizes_created = self.resize_image(file_path, sizes)
            
            return {
                "success": True,
                "filename": filename,
                "path": str(file_path.relative_to(self.base_path)),
                "url": f"/static/images/products/{category}/{filename}",
                "sizes_created": {k: str(v.relative_to(self.base_path)) for k, v in sizes_created.items()}
            }
            
        except Exception as e:
            # Cleanup nếu có lỗi
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(status_code=500, detail=f"Lỗi upload file: {str(e)}")
    
    def delete_product_image(self, product_id: int, category: str, image_type: str) -> bool:
        """Xóa ảnh sản phẩm"""
        category_path = self.products_path / category
        
        if image_type == 'all':
            # Xóa tất cả ảnh của sản phẩm
            pattern = f"{product_id}_*"
        else:
            pattern = f"{product_id}_{image_type}*"
        
        deleted_files = []
        for file_path in category_path.glob(pattern):
            file_path.unlink()
            deleted_files.append(str(file_path))
        
        return len(deleted_files) > 0
    
    def get_product_images(self, product_id: int, category: str) -> dict:
        """Lấy danh sách ảnh của sản phẩm"""
        category_path = self.products_path / category
        
        images = {
            'main': None,
            'thumb': None,
            'gallery': []
        }
        
        # Tìm ảnh main
        for ext in ['.jpg', '.jpeg', '.png', '.webp']:
            main_path = category_path / f"{product_id}_main{ext}"
            if main_path.exists():
                images['main'] = f"/static/images/products/{category}/{main_path.name}"
                break
        
        # Tìm ảnh thumb
        for ext in ['.jpg', '.jpeg', '.png', '.webp']:
            thumb_path = category_path / f"{product_id}_thumb{ext}"
            if thumb_path.exists():
                images['thumb'] = f"/static/images/products/{category}/{thumb_path.name}"
                break
        
        # Tìm ảnh gallery
        gallery_files = list(category_path.glob(f"{product_id}_gallery_*"))
        gallery_files.sort()  # Sắp xếp theo tên
        
        for gallery_file in gallery_files:
            images['gallery'].append(f"/static/images/products/{category}/{gallery_file.name}")
        
        return images
    
    def migrate_existing_images(self):
        """Di chuyển ảnh hiện tại sang cấu trúc mới"""
        old_images_path = self.images_path
        
        # Danh sách ảnh cũ
        old_images = ['product1.jpg', 'product2.jpg', 'product3.jpg']
        
        # Copy ảnh cũ sang thư mục system làm backup
        system_path = self.images_path / "system"
        for old_image in old_images:
            old_path = old_images_path / old_image
            if old_path.exists():
                backup_path = system_path / f"backup_{old_image}"
                shutil.copy2(old_path, backup_path)
        
        print("✅ Đã backup ảnh cũ vào thư mục system/")
        print("💡 Bây giờ bạn có thể upload ảnh mới cho từng sản phẩm")


# Sử dụng
image_manager = ImageManager()