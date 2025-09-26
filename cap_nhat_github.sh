#!/bin/bash

# 🚀 Script cập nhật lên GitHub
# Chạy script này để push code lên GitHub

echo "🚀 Bắt đầu cập nhật lên GitHub..."

# Kiểm tra git status
echo "📋 Kiểm tra trạng thái git..."
git status

# Add tất cả files
echo "📁 Thêm tất cả files..."
git add .

# Commit với message
echo "💾 Commit changes..."
git commit -m "✨ Cải thiện hệ thống quản lý ảnh sản phẩm

🎯 Vấn đề đã giải quyết:
- Chỉ có 3 ảnh mẫu cho hàng trăm sản phẩm
- Khó quản lý ảnh khi làm admin
- Hay gặp lỗi ảnh khi cài đặt

🚀 Tính năng mới:
- Hệ thống quản lý ảnh hoàn chỉnh (image_manager.py)
- API upload/xóa/quản lý ảnh (image_api.py)
- Cấu trúc thư mục theo danh mục sản phẩm
- Tự động resize ảnh (main, thumb, gallery)
- Giao diện admin upload ảnh (drag & drop)
- Validation file ảnh đầy đủ
- Ảnh mặc định khi không có ảnh

📁 Cấu trúc thư mục mới:
static/images/products/
├── vong-xep/
├── rem-man/
├── gia-phoi/
├── ban-ghe/
├── gia-treo/
├── san-pham-khac/
└── giam-gia/

📚 Tài liệu:
- HUONG_DAN_QUAN_LY_ANH.md: Hướng dẫn chi tiết
- NGUYEN_NHAN_LOI_ANH.md: Phân tích nguyên nhân lỗi ảnh
- TOM_TAT_QUAN_LY_ANH.md: Tóm tắt cải thiện
- admin_image_upload_example.html: Giao diện admin mẫu"

# Push lên GitHub
echo "🌐 Push lên GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Cập nhật thành công lên GitHub!"
    echo "🔗 Xem tại: https://github.com/khpt1976-cloud/DuAnPttn"
else
    echo "❌ Có lỗi khi push lên GitHub"
    echo "💡 Hãy kiểm tra:"
    echo "   - GitHub token có quyền push không?"
    echo "   - Repository có tồn tại không?"
    echo "   - Internet connection có ổn định không?"
fi

echo "🎉 Hoàn thành!"