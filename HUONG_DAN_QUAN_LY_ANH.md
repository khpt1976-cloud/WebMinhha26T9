# 📸 Hướng Dẫn Quản Lý Ảnh Sản Phẩm

## 🎯 Vấn đề hiện tại:
- Chỉ có 3 ảnh mẫu cho hàng trăm sản phẩm
- Tất cả sản phẩm dùng chung ảnh
- Khó quản lý khi làm phần admin

## 🏗️ Cấu trúc thư mục đề xuất:

```
/backend/static/
├── images/
│   ├── products/
│   │   ├── vong-xep/           # Danh mục võng xếp
│   │   │   ├── 1_main.jpg      # Ảnh chính sản phẩm ID 1
│   │   │   ├── 1_thumb.jpg     # Ảnh thumbnail sản phẩm ID 1
│   │   │   ├── 1_gallery_1.jpg # Ảnh gallery 1 của sản phẩm ID 1
│   │   │   ├── 1_gallery_2.jpg # Ảnh gallery 2 của sản phẩm ID 1
│   │   │   ├── 2_main.jpg      # Ảnh chính sản phẩm ID 2
│   │   │   └── 2_thumb.jpg     # Ảnh thumbnail sản phẩm ID 2
│   │   ├── rem-man/            # Danh mục rèm màn
│   │   │   ├── 5_main.jpg
│   │   │   ├── 5_thumb.jpg
│   │   │   └── 6_main.jpg
│   │   ├── gia-phoi/           # Danh mục giá phơi
│   │   ├── ban-ghe/            # Danh mục bàn ghế
│   │   ├── gia-treo/           # Danh mục giá treo
│   │   └── san-pham-khac/      # Sản phẩm khác
│   ├── categories/             # Ảnh danh mục
│   │   ├── vong-xep.jpg
│   │   ├── rem-man.jpg
│   │   └── gia-phoi.jpg
│   ├── banners/                # Ảnh banner
│   │   ├── hero-banner.jpg
│   │   └── promotion-banner.jpg
│   └── system/                 # Ảnh hệ thống
│       ├── logo.png
│       ├── favicon.ico
│       └── no-image.jpg        # Ảnh mặc định khi không có ảnh
└── uploads/                    # Thư mục upload tạm
    └── temp/
```

## 🔧 Quy tắc đặt tên ảnh:

### Ảnh sản phẩm:
- **Ảnh chính**: `{product_id}_main.jpg`
- **Ảnh thumbnail**: `{product_id}_thumb.jpg` 
- **Ảnh gallery**: `{product_id}_gallery_{số}.jpg`

### Kích thước ảnh chuẩn:
- **Main**: 800x600px (4:3)
- **Thumbnail**: 300x225px (4:3)
- **Gallery**: 1200x900px (4:3)

## 📝 API endpoints cần tạo:

### 1. Upload ảnh sản phẩm:
```python
@app.post("/api/admin/products/{product_id}/images/upload")
async def upload_product_image(
    product_id: int,
    image_type: str,  # main, thumb, gallery
    file: UploadFile
):
    # Validate file type, size
    # Resize ảnh tự động
    # Lưu vào thư mục đúng
    # Cập nhật database
```

### 2. Xóa ảnh sản phẩm:
```python
@app.delete("/api/admin/products/{product_id}/images/{image_type}")
async def delete_product_image(product_id: int, image_type: str):
    # Xóa file ảnh
    # Cập nhật database
```

### 3. Lấy danh sách ảnh:
```python
@app.get("/api/admin/products/{product_id}/images")
async def get_product_images(product_id: int):
    # Trả về danh sách ảnh của sản phẩm
```

## 🛠️ Tính năng cần có trong Admin:

### 1. Upload ảnh:
- Drag & drop upload
- Preview ảnh trước khi upload
- Crop/resize ảnh
- Upload multiple files

### 2. Quản lý ảnh:
- Xem tất cả ảnh của sản phẩm
- Đặt ảnh chính
- Sắp xếp thứ tự ảnh gallery
- Xóa ảnh không cần thiết

### 3. Tối ưu ảnh:
- Tự động resize khi upload
- Compress ảnh để giảm dung lượng
- Tạo thumbnail tự động
- Convert sang WebP (tùy chọn)

## 🔒 Bảo mật và validation:

### 1. Validation file:
- Chỉ cho phép: jpg, jpeg, png, webp
- Giới hạn kích thước: max 5MB
- Kiểm tra file header (không chỉ extension)

### 2. Bảo mật:
- Rename file để tránh conflict
- Sanitize filename
- Giới hạn số lượng file upload/phút

## 📊 Database schema đề xuất:

```sql
-- Bảng lưu thông tin ảnh sản phẩm
CREATE TABLE product_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    product_id INT NOT NULL,
    image_type ENUM('main', 'thumb', 'gallery') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    width INT,
    height INT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_id (product_id),
    INDEX idx_image_type (image_type)
);
```

## 🚀 Triển khai từng bước:

### Bước 1: Tạo cấu trúc thư mục
### Bước 2: Tạo API upload ảnh
### Bước 3: Tạo API quản lý ảnh
### Bước 4: Tạo giao diện admin upload ảnh
### Bước 5: Migrate ảnh hiện tại
### Bước 6: Cập nhật frontend để hiển thị ảnh đúng

## 💡 Lợi ích:

1. **Dễ quản lý**: Mỗi sản phẩm có ảnh riêng, rõ ràng
2. **Dễ mở rộng**: Có thể thêm nhiều ảnh cho 1 sản phẩm
3. **Tối ưu hiệu suất**: Có thumbnail, resize tự động
4. **Dễ backup**: Cấu trúc thư mục rõ ràng
5. **SEO friendly**: Tên file có ý nghĩa