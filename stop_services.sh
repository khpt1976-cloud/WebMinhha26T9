#!/bin/bash

echo "🛑 DỪNG TẤT CẢ SERVICES WEBSITE MINH HÀ"
echo "====================================="

# Function để dừng process theo PID file
stop_service() {
    local service_name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if [ ! -z "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            echo "🛑 Dừng $service_name (PID: $pid)"
            kill -TERM "$pid"
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                echo "⚠️  Force kill $service_name"
                kill -9 "$pid"
            fi
            rm -f "$pid_file"
            echo "✅ $service_name đã dừng"
        else
            echo "⚠️  $service_name không đang chạy"
            rm -f "$pid_file"
        fi
    else
        echo "⚠️  Không tìm thấy PID file cho $service_name"
    fi
}

# Dừng các services
stop_service "Backend API" "logs/backend.pid"
stop_service "Frontend" "logs/frontend.pid" 
stop_service "Admin Panel" "logs/admin.pid"

# Dừng tất cả processes còn lại liên quan
echo ""
echo "🧹 Dọn dẹp processes còn lại..."
pkill -f "python main.py" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true

echo ""
echo "✅ Tất cả services đã được dừng!"