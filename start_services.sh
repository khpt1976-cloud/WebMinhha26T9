#!/bin/bash

echo "🚀 KHỞI ĐỘNG WEBSITE MINH HÀ"
echo "============================"

# Tạo thư mục logs nếu chưa có
mkdir -p logs

echo "🔧 Khởi động Backend API (Port 12000)..."
cd backend
source venv/bin/activate
python main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" > ../logs/backend.pid
echo "✅ Backend đã khởi động (PID: $BACKEND_PID)"

# Chờ backend khởi động
sleep 5

echo ""
echo "🌐 Khởi động Frontend (Port 12001)..."
cd ../frontend
BROWSER=none npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" > ../logs/frontend.pid
echo "✅ Frontend đã khởi động (PID: $FRONTEND_PID)"

echo ""
echo "👑 Khởi động Admin Panel (Port 3000)..."
cd ../Admin
BROWSER=none npm start > ../logs/admin.log 2>&1 &
ADMIN_PID=$!
echo "$ADMIN_PID" > ../logs/admin.pid
echo "✅ Admin Panel đã khởi động (PID: $ADMIN_PID)"

echo ""
echo "⏳ Chờ tất cả services khởi động hoàn tất..."
sleep 10

echo ""
echo "🎉 TẤT CẢ SERVICES ĐÃ KHỞI ĐỘNG THÀNH CÔNG!"
echo "========================================"
echo ""
echo "🔗 CÁC ĐƯỜNG DẪN TRUY CẬP:"
echo "   📱 Frontend Website: https://work-2-wsdjbzmcnwcsmpzs.prod-runtime.all-hands.dev"
echo "   👑 Admin Panel: http://localhost:3000"
echo "   🔧 Backend API: https://work-1-wsdjbzmcnwcsmpzs.prod-runtime.all-hands.dev"
echo "   📚 API Documentation: https://work-1-wsdjbzmcnwcsmpzs.prod-runtime.all-hands.dev/docs"
echo ""
echo "👤 THÔNG TIN ĐĂNG NHẬP ADMIN:"
echo "   Username: Hpt"
echo "   Password: HptPttn7686"
echo ""
echo "🛑 Để dừng tất cả services, chạy: ./stop_services.sh"
echo ""
echo "✅ Website đã sẵn sàng sử dụng!"