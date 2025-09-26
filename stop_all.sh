#!/bin/bash

# Script dừng tất cả các service của Website Minh Hà
# Author: OpenHands AI Assistant

echo "🛑 DỪNG TẤT CẢ SERVICE WEBSITE MINH HÀ"
echo "====================================="

# Function để dừng process theo PID
stop_process() {
    local name=$1
    local pid_file=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat $pid_file)
        if ps -p $pid > /dev/null 2>&1; then
            echo "🛑 Đang dừng $name (PID: $pid)..."
            kill -TERM $pid
            sleep 3
            
            # Nếu process vẫn chạy, force kill
            if ps -p $pid > /dev/null 2>&1; then
                echo "⚠️  Force killing $name..."
                kill -9 $pid
            fi
            echo "✅ $name đã dừng"
        else
            echo "ℹ️  $name không đang chạy"
        fi
        rm -f $pid_file
    else
        echo "ℹ️  Không tìm thấy PID file cho $name"
    fi
}

# Function để dừng process theo port
stop_port() {
    local port=$1
    local name=$2
    
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "🛑 Đang dừng $name trên port $port..."
        echo $pids | xargs kill -TERM
        sleep 3
        
        # Kiểm tra lại và force kill nếu cần
        pids=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$pids" ]; then
            echo "⚠️  Force killing processes trên port $port..."
            echo $pids | xargs kill -9
        fi
        echo "✅ $name đã dừng"
    else
        echo "ℹ️  Không có process nào chạy trên port $port"
    fi
}

# Dừng theo PID files nếu có
if [ -d "logs" ]; then
    stop_process "Backend" "logs/backend.pid"
    stop_process "Frontend" "logs/frontend.pid"
    stop_process "Admin Panel" "logs/admin.pid"
fi

# Dừng theo ports để đảm bảo
echo ""
echo "🔍 Kiểm tra và dọn dẹp các port..."
stop_port 12000 "Backend API"
stop_port 12001 "Frontend"
stop_port 3000 "Admin Panel"

# Dọn dẹp các process Node.js và Python liên quan
echo ""
echo "🧹 Dọn dẹp các process liên quan..."

# Tìm và dừng các process react-scripts
react_pids=$(pgrep -f "react-scripts")
if [ ! -z "$react_pids" ]; then
    echo "🛑 Dừng React development servers..."
    echo $react_pids | xargs kill -TERM 2>/dev/null
    sleep 2
    # Force kill nếu cần
    react_pids=$(pgrep -f "react-scripts")
    if [ ! -z "$react_pids" ]; then
        echo $react_pids | xargs kill -9 2>/dev/null
    fi
fi

# Tìm và dừng các process Python main.py
python_pids=$(pgrep -f "python.*main.py")
if [ ! -z "$python_pids" ]; then
    echo "🛑 Dừng Python API servers..."
    echo $python_pids | xargs kill -TERM 2>/dev/null
    sleep 2
    # Force kill nếu cần
    python_pids=$(pgrep -f "python.*main.py")
    if [ ! -z "$python_pids" ]; then
        echo $python_pids | xargs kill -9 2>/dev/null
    fi
fi

echo ""
echo "✅ TẤT CẢ SERVICE ĐÃ ĐƯỢC DỪNG!"
echo ""
echo "📊 Trạng thái các port:"
for port in 12000 12001 3000; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "   Port $port: ❌ Vẫn đang sử dụng"
    else
        echo "   Port $port: ✅ Đã giải phóng"
    fi
done

echo ""
echo "🔄 Để khởi động lại, chạy: ./start_all.sh"