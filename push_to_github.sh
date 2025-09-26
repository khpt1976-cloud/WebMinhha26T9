#!/bin/bash

echo "🚀 Đang push code lên GitHub repository WebMinhha..."

# Kiểm tra git status
echo "📋 Git status hiện tại:"
git status

echo ""
echo "🔄 Đang push code lên GitHub..."

# Push code lên GitHub
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ THÀNH CÔNG! Code đã được push lên GitHub"
    echo "🔗 Truy cập repository tại: https://github.com/khpt1976-cloud/WebMinhha"
    echo ""
    echo "📁 Cấu trúc repository:"
    echo "   ├── Admin/           # React Admin Panel (Bước 6 hoàn thành)"
    echo "   ├── backend/         # FastAPI Backend"
    echo "   ├── frontend/        # React Frontend"
    echo "   └── kehoachlamquantri.md # Kế hoạch phát triển"
    echo ""
    echo "🎯 Trạng thái: Bước 6 HOÀN THÀNH - User Management System"
else
    echo ""
    echo "❌ LỖI: Không thể push code lên GitHub"
    echo "💡 Hãy kiểm tra:"
    echo "   1. Repository WebMinhha đã được tạo chưa?"
    echo "   2. Token có quyền push không?"
    echo "   3. Kết nối internet ổn định không?"
fi