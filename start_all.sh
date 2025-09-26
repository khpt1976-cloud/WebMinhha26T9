#!/bin/bash

# Script khởi động tất cả các service của Website Minh Hà
# Author: OpenHands AI Assistant
# Date: $(date)

echo "🚀 KHỞI ĐỘNG WEBSITE MINH HÀ"
echo "================================"

# Kiểm tra và tạo thư mục logs
mkdir -p logs

# Function để kiểm tra port có đang sử dụng không
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $port đang được sử dụng"
        return 1
    else
        echo "✅ Port $port sẵn sàng"
        return 0
    fi
}

# Function để dừng process trên port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        echo "🛑 Dừng process trên port $port (PID: $pid)"
        kill -9 $pid
        sleep 2
    fi
}

echo "📋 Kiểm tra các port cần thiết..."
# Kiểm tra và dọn dẹp các port
for port in 12000 12001 3000; do
    if ! check_port $port; then
        kill_port $port
    fi
done

echo ""
echo "🔧 KHỞI ĐỘNG BACKEND API (Port 12000)..."
cd backend
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment không tồn tại. Vui lòng chạy cài đặt trước."
    exit 1
fi

source venv/bin/activate
python main.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend đã khởi động (PID: $BACKEND_PID)"

# Chờ backend khởi động
echo "⏳ Chờ backend khởi động..."
sleep 5

# Kiểm tra backend
if curl -s http://localhost:12000/health > /dev/null; then
    echo "✅ Backend API đang hoạt động tại http://localhost:12000"
else
    echo "❌ Backend không thể khởi động"
    exit 1
fi

echo ""
echo "🌐 KHỞI ĐỘNG FRONTEND (Port 12001)..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    echo "❌ Node modules không tồn tại. Vui lòng chạy npm install trước."
    exit 1
fi

BROWSER=none npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend đã khởi động (PID: $FRONTEND_PID)"

echo ""
echo "👑 KHỞI ĐỘNG ADMIN PANEL (Port 3000)..."
cd ../Admin
if [ ! -d "node_modules" ]; then
    echo "❌ Node modules không tồn tại. Vui lòng chạy npm install trước."
    exit 1
fi

BROWSER=none npm start > ../logs/admin.log 2>&1 &
ADMIN_PID=$!
echo "✅ Admin Panel đã khởi động (PID: $ADMIN_PID)"

# Chờ các service khởi động
echo ""
echo "⏳ Chờ tất cả service khởi động hoàn tất..."
sleep 15

echo ""
echo "🎉 TẤT CẢ SERVICE ĐÃ KHỞI ĐỘNG THÀNH CÔNG!"
echo "========================================"
echo ""
echo "🔗 CÁC ĐƯỜNG DẪN TRUY CẬP:"
echo "   📱 Frontend Website: https://work-2-wicjglkwtqupxpkd.prod-runtime.all-hands.dev"
echo "   👑 Admin Panel: http://localhost:3000"
echo "   🔧 Backend API: https://work-1-wicjglkwtqupxpkd.prod-runtime.all-hands.dev"
echo "   📚 API Documentation: https://work-1-wicjglkwtqupxpkd.prod-runtime.all-hands.dev/docs"
echo ""
echo "👤 THÔNG TIN ĐĂNG NHẬP ADMIN:"
echo "   Username: Hpt"
echo "   Password: HptPttn7686"
echo ""
echo "📊 PROCESS IDs:"
echo "   Backend: $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo "   Admin: $ADMIN_PID"
echo ""
echo "📝 LOGS:"
echo "   Backend: logs/backend.log"
echo "   Frontend: logs/frontend.log"
echo "   Admin: logs/admin.log"
echo ""
echo "🛑 Để dừng tất cả service, chạy: ./stop_all.sh"
echo ""

# Lưu PIDs vào file để script stop có thể sử dụng
echo "$BACKEND_PID" > logs/backend.pid
echo "$FRONTEND_PID" > logs/frontend.pid
echo "$ADMIN_PID" > logs/admin.pid

echo "✅ Website đã sẵn sàng sử dụng!"