#!/bin/bash

# 🚀 Universal Start Script - Website Minh Hà
# Script khởi động thông minh cho mọi môi trường
# Author: OpenHands AI Assistant

set -e  # Exit on any error

echo "🚀 KHỞI ĐỘNG WEBSITE MINH HÀ - UNIVERSAL MODE"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_PORT=${BACKEND_PORT:-12001}
FRONTEND_PORT=${FRONTEND_PORT:-12000}
HOST=${HOST:-0.0.0.0}

# Detect environment
detect_environment() {
    if [[ -n "$CODESPACE_NAME" ]]; then
        echo "codespaces"
    elif [[ -n "$GITPOD_WORKSPACE_ID" ]]; then
        echo "gitpod"
    elif [[ "$HOSTNAME" == *"prod-runtime.all-hands.dev"* ]]; then
        echo "openhands"
    elif [[ -f "/.dockerenv" ]]; then
        echo "docker"
    else
        echo "local"
    fi
}

ENVIRONMENT=$(detect_environment)
echo -e "${BLUE}🔍 Detected environment: $ENVIRONMENT${NC}"

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Function to find available port
find_available_port() {
    local start_port=$1
    local port=$start_port
    
    while ! check_port $port; do
        echo -e "${YELLOW}⚠️  Port $port is in use, trying $((port + 1))${NC}"
        port=$((port + 1))
        if [ $port -gt $((start_port + 100)) ]; then
            echo -e "${RED}❌ Could not find available port after trying 100 ports${NC}"
            exit 1
        fi
    done
    
    echo $port
}

# Auto-detect available ports
echo -e "${BLUE}🔍 Checking available ports...${NC}"
BACKEND_PORT=$(find_available_port $BACKEND_PORT)
FRONTEND_PORT=$(find_available_port $FRONTEND_PORT)

echo -e "${GREEN}✅ Backend will use port: $BACKEND_PORT${NC}"
echo -e "${GREEN}✅ Frontend will use port: $FRONTEND_PORT${NC}"

# Create logs directory
mkdir -p logs

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    
    # Kill background processes
    if [[ -f "logs/backend.pid" ]]; then
        BACKEND_PID=$(cat logs/backend.pid)
        kill $BACKEND_PID 2>/dev/null || true
        rm -f logs/backend.pid
    fi
    
    if [[ -f "logs/frontend.pid" ]]; then
        FRONTEND_PID=$(cat logs/frontend.pid)
        kill $FRONTEND_PID 2>/dev/null || true
        rm -f logs/frontend.pid
    fi
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Set trap for cleanup
trap cleanup EXIT INT TERM

# Update environment files with detected ports
echo -e "${BLUE}🔧 Updating configuration files...${NC}"

# Update backend .env
cat > backend/.env << EOF
HOST=$HOST
PORT=$BACKEND_PORT
ENVIRONMENT=development
DATABASE_URL=sqlite:///./database.db
CORS_ORIGINS=["http://localhost:$FRONTEND_PORT","http://127.0.0.1:$FRONTEND_PORT","http://$HOST:$FRONTEND_PORT","*"]
JWT_SECRET_KEY=dev-secret-key-change-in-production
STORE_NAME=Cửa Hàng Minh Hà
STORE_HOTLINE=0974.876.168
STORE_ADDRESS=417 Ngô Gia Tự, Hải An, Hải Phòng
EOF

# Detect API URL based on environment
if [[ "$HOSTNAME" == *"runtime-huysglptbcssgdhx"* ]] || [[ "$PWD" == *"/workspace"* ]]; then
    API_URL="https://work-2-huysglptbcssgdhx.prod-runtime.all-hands.dev"
    echo -e "${GREEN}🌐 Detected OpenHands environment - Using HTTPS API URL${NC}"
else
    API_URL="http://localhost:$BACKEND_PORT"
    echo -e "${GREEN}🏠 Detected local environment - Using localhost API URL${NC}"
fi

# Update frontend .env
cat > frontend/.env << EOF
REACT_APP_API_URL=$API_URL
PORT=$FRONTEND_PORT
HOST=$HOST
DANGEROUSLY_DISABLE_HOST_CHECK=true
REACT_APP_ENV=development
REACT_APP_HOTLINE=0974.876.168
REACT_APP_ADDRESS=417 Ngô Gia Tự, Hải An, Hải Phòng
REACT_APP_STORE_NAME=Cửa Hàng Minh Hà
EOF

# Start Backend
echo -e "${BLUE}🔧 Starting Backend API (Port: $BACKEND_PORT)...${NC}"
cd backend

# Check if virtual environment exists
if [[ ! -d "venv" ]]; then
    echo -e "${YELLOW}📦 Creating Python virtual environment...${NC}"
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if requirements.txt exists
if [[ -f "requirements.txt" ]]; then
    echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
    pip install -r requirements.txt
fi

# Install additional dependencies
pip install fastapi uvicorn python-dotenv pydantic

# Start backend in background
echo -e "${GREEN}🚀 Starting Backend API server...${NC}"
uvicorn main:app --host $HOST --port $BACKEND_PORT --reload > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid

# Wait for backend to start
echo -e "${YELLOW}⏳ Waiting for backend to start...${NC}"
sleep 5

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend started successfully (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    cat ../logs/backend.log
    exit 1
fi

# Start Frontend
echo -e "${BLUE}🌐 Starting Frontend (Port: $FRONTEND_PORT)...${NC}"
cd ../frontend

# Check if node_modules exists
if [[ ! -d "node_modules" ]]; then
    echo -e "${YELLOW}📦 Installing Node.js dependencies...${NC}"
    npm install
fi

# Start frontend in background
echo -e "${GREEN}🚀 Starting Frontend development server...${NC}"
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid

# Wait for frontend to start
echo -e "${YELLOW}⏳ Waiting for frontend to start...${NC}"
sleep 10

# Check if frontend is running
if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend started successfully (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    cat ../logs/frontend.log
    exit 1
fi

# Display access information
echo ""
echo -e "${GREEN}🎉 WEBSITE MINH HÀ STARTED SUCCESSFULLY!${NC}"
echo "=============================================="
echo -e "${BLUE}🌐 Frontend:${NC} http://localhost:$FRONTEND_PORT"
echo -e "${BLUE}📡 Backend API:${NC} http://localhost:$BACKEND_PORT"
echo -e "${BLUE}📚 API Docs:${NC} http://localhost:$BACKEND_PORT/docs"
echo -e "${BLUE}🔍 Health Check:${NC} http://localhost:$BACKEND_PORT/health"
echo ""
echo -e "${YELLOW}📋 Environment: $ENVIRONMENT${NC}"
echo -e "${YELLOW}📁 Logs: logs/backend.log, logs/frontend.log${NC}"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop all services${NC}"

# Keep script running and monitor processes
while true; do
    # Check if backend is still running
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Backend process died${NC}"
        break
    fi
    
    # Check if frontend is still running
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        echo -e "${RED}❌ Frontend process died${NC}"
        break
    fi
    
    sleep 5
done

echo -e "${RED}❌ One or more services stopped unexpectedly${NC}"
exit 1