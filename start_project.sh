#!/bin/bash

echo "🚀 Khởi động Everon Website Clone..."

# Chuyển đến thư mục dự án
cd /workspace/WebMinhha

# Khởi động backend
echo "📡 Khởi động Backend API..."
cd backend
source venv/bin/activate
python main.py > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Đợi backend khởi động
sleep 3

# Khởi động frontend
echo "🌐 Khởi động Frontend..."
cd ../frontend
npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Đợi frontend khởi động
sleep 10

echo "✅ Website đã khởi động thành công!"
echo ""
echo "🔗 Truy cập website tại:"
echo "   Frontend: https://work-2-yuqzjjovdhykmiht.prod-runtime.all-hands.dev"
echo "   Backend API: https://work-1-yuqzjjovdhykmiht.prod-runtime.all-hands.dev"
echo "   API Documentation: https://work-1-yuqzjjovdhykmiht.prod-runtime.all-hands.dev/docs"
echo ""
echo "📝 Để dừng website, chạy lệnh:"
echo "   ./stop_project.sh"
echo ""
echo "📊 Để xem logs:"
echo "   Backend: tail -f backend/backend.log"
echo "   Frontend: tail -f frontend/frontend.log"

# Lưu PIDs để có thể dừng sau
echo $BACKEND_PID > backend.pid
echo $FRONTEND_PID > frontend.pid