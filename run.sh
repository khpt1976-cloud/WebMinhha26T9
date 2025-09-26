#!/bin/bash

echo "🚀 Khởi động Everon Website..."

# Chuyển đến thư mục dự án
cd /workspace/DuAnPttn

# Khởi động backend
echo "📡 Khởi động Backend API..."
cd backend
source venv/bin/activate
python main.py > backend.log 2>&1 &
BACKEND_PID=$!

# Đợi backend khởi động
sleep 3

# Khởi động frontend
echo "🌐 Khởi động Frontend..."
cd ../frontend
BROWSER=none npm start > frontend.log 2>&1 &
FRONTEND_PID=$!

echo "✅ Website đã khởi động!"
echo "🔗 Frontend: https://work-2-pvbqbmqnoiprzkcy.prod-runtime.all-hands.dev"
echo "🔗 Backend API: https://work-1-pvbqbmqnoiprzkcy.prod-runtime.all-hands.dev"
echo "📚 API Docs: https://work-1-pvbqbmqnoiprzkcy.prod-runtime.all-hands.dev/docs"
echo ""
echo "📝 Để dừng website, chạy: ./stop.sh"
echo "📝 Để xem logs:"
echo "   - Backend: tail -f backend/backend.log"
echo "   - Frontend: tail -f frontend/frontend.log"

# Lưu PID để có thể dừng sau
echo $BACKEND_PID > backend.pid
echo $FRONTEND_PID > frontend.pid