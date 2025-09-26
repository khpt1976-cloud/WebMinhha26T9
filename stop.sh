#!/bin/bash

echo "🛑 Đang dừng Everon Website..."

# Dừng tất cả các process Node.js (React)
echo "🌐 Dừng Frontend..."
pkill -f "react-scripts start"
pkill -f "node.*react-scripts"

# Dừng tất cả các process Python (FastAPI)
echo "📡 Dừng Backend..."
pkill -f "python main.py"
pkill -f "uvicorn"

echo "✅ Đã dừng tất cả services!"