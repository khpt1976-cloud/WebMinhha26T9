#!/bin/bash

echo "🛡️ KHỞI ĐỘNG AN TOÀN - WEBSITE MINH HÀ"
echo "====================================="

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "❌ Port $port đang được sử dụng"
        return 1
    else
        echo "✅ Port $port khả dụng"
        return 0
    fi
}

# Function to find available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    while ! check_port $port; do
        port=$((port + 1))
        if [ $port -gt $((start_port + 100)) ]; then
            echo "❌ Không tìm được port khả dụng từ $start_port đến $((start_port + 100))"
            exit 1
        fi
    done
    echo $port
}

# Check system requirements
echo "🔍 Kiểm tra system requirements..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js chưa được cài đặt"
    echo "📥 Đang cài đặt Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "⚠️ Node.js version $NODE_VERSION < 16, khuyến nghị upgrade"
else
    echo "✅ Node.js version: $(node --version)"
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 chưa được cài đặt"
    echo "📥 Đang cài đặt Python3..."
    sudo apt-get update && sudo apt-get install -y python3 python3-pip
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "✅ Python version: $PYTHON_VERSION"

# Check available ports
echo "🔍 Kiểm tra ports..."
FRONTEND_PORT=$(find_available_port 12000)
BACKEND_PORT=$(find_available_port 12001)

echo "✅ Frontend sẽ chạy trên port: $FRONTEND_PORT"
echo "✅ Backend sẽ chạy trên port: $BACKEND_PORT"

# Detect environment
if [[ "$HOSTNAME" == *"prod-runtime"* ]] || [[ "$PWD" == *"workspace"* ]]; then
    echo "🔍 Detected environment: openhands"
    ENVIRONMENT="openhands"
    API_URL="https://work-2-huysglptbcssgdhx.prod-runtime.all-hands.dev"
else
    echo "🔍 Detected environment: local"
    ENVIRONMENT="local"
    API_URL="http://localhost:$BACKEND_PORT"
fi

# Create frontend .env with dynamic ports
echo "📝 Tạo frontend configuration..."
cat > frontend/.env << EOF
REACT_APP_API_URL=$API_URL
PORT=$FRONTEND_PORT
HOST=0.0.0.0
DANGEROUSLY_DISABLE_HOST_CHECK=true
REACT_APP_ENV=development
REACT_APP_HOTLINE=0974.876.168
REACT_APP_ADDRESS=417 Ngô Gia Tự, Hải An, Hải Phòng
REACT_APP_STORE_NAME=Cửa Hàng Minh Hà
EOF

# Create backend .env with dynamic ports
echo "📝 Tạo backend configuration..."
cat > backend/.env << EOF
PORT=$BACKEND_PORT
HOST=0.0.0.0
DEBUG=True
CORS_ORIGINS=["http://localhost:$FRONTEND_PORT", "https://work-1-huysglptbcssgdhx.prod-runtime.all-hands.dev"]
EOF

# Install dependencies with error handling
echo "📦 Cài đặt dependencies..."

# Backend dependencies
echo "📦 Cài đặt backend dependencies..."
cd backend
if [ -f "requirements.txt" ]; then
    pip3 install -r requirements.txt || {
        echo "⚠️ Lỗi cài đặt Python packages, thử với --user flag"
        pip3 install --user -r requirements.txt
    }
fi
cd ..

# Frontend dependencies
echo "📦 Cài đặt frontend dependencies..."
cd frontend
if [ -f "package.json" ]; then
    if command -v npm &> /dev/null; then
        npm install || {
            echo "⚠️ npm install failed, thử với --legacy-peer-deps"
            npm install --legacy-peer-deps
        }
    elif command -v yarn &> /dev/null; then
        yarn install
    else
        echo "❌ Không tìm thấy npm hoặc yarn"
        exit 1
    fi
fi
cd ..

# Start services with error handling
echo "🚀 Khởi động services..."

# Start backend
echo "🔧 Khởi động backend trên port $BACKEND_PORT..."
cd backend
nohup python3 -m uvicorn main:app --host 0.0.0.0 --port $BACKEND_PORT --reload > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Đợi backend khởi động..."
sleep 10

# Check backend health
if curl -s "http://localhost:$BACKEND_PORT/health" > /dev/null; then
    echo "✅ Backend đã khởi động thành công"
else
    echo "❌ Backend khởi động thất bại, kiểm tra backend.log"
    cat backend.log
    exit 1
fi

# Start frontend
echo "🎨 Khởi động frontend trên port $FRONTEND_PORT..."
cd frontend
nohup npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
echo "⏳ Đợi frontend khởi động..."
sleep 30

# Final health check
echo "🏥 Kiểm tra health cuối cùng..."
if curl -s "http://localhost:$FRONTEND_PORT" > /dev/null; then
    echo "✅ Frontend đã khởi động thành công"
else
    echo "❌ Frontend khởi động thất bại, kiểm tra frontend.log"
    tail -20 frontend.log
fi

# Display results
echo ""
echo "🎉 KHỞI ĐỘNG HOÀN TẤT!"
echo "====================="
echo "🌐 Frontend: http://localhost:$FRONTEND_PORT"
echo "🔧 Backend:  http://localhost:$BACKEND_PORT"
echo "📊 Backend Health: http://localhost:$BACKEND_PORT/health"
echo ""
echo "📝 Log files:"
echo "   - Backend: backend.log"
echo "   - Frontend: frontend.log"
echo ""
echo "🛑 Để dừng services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"

# Save PIDs for cleanup
echo "$BACKEND_PID" > backend.pid
echo "$FRONTEND_PID" > frontend.pid

echo "✅ Website đã sẵn sàng sử dụng!"