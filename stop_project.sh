#!/bin/bash

echo "🛑 Đang dừng Everon Website..."

cd /workspace/DuAnPttn

# Dừng backend
if [ -f backend.pid ]; then
    BACKEND_PID=$(cat backend.pid)
    echo "Đang dừng Backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    rm backend.pid
fi

# Dừng frontend
if [ -f frontend.pid ]; then
    FRONTEND_PID=$(cat frontend.pid)
    echo "Đang dừng Frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    rm frontend.pid
fi

# Dừng tất cả process liên quan
pkill -f "python main.py" 2>/dev/null
pkill -f "react-scripts start" 2>/dev/null

echo "✅ Website đã được dừng!"