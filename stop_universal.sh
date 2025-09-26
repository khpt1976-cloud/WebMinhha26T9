#!/bin/bash

# 🛑 Universal Stop Script - Website Minh Hà
# Script dừng thông minh cho mọi môi trường

echo "🛑 DỪNG WEBSITE MINH HÀ - UNIVERSAL MODE"
echo "======================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to stop process by PID file
stop_by_pid_file() {
    local service_name=$1
    local pid_file=$2
    
    if [[ -f "$pid_file" ]]; then
        local pid=$(cat "$pid_file")
        echo -e "${BLUE}🛑 Stopping $service_name (PID: $pid)...${NC}"
        
        if kill -0 $pid 2>/dev/null; then
            kill $pid
            sleep 2
            
            # Force kill if still running
            if kill -0 $pid 2>/dev/null; then
                echo -e "${YELLOW}⚠️  Force killing $service_name...${NC}"
                kill -9 $pid 2>/dev/null || true
            fi
            
            echo -e "${GREEN}✅ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}⚠️  $service_name was not running${NC}"
        fi
        
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}⚠️  No PID file found for $service_name${NC}"
    fi
}

# Function to stop processes by name
stop_by_name() {
    local process_name=$1
    local service_name=$2
    
    echo -e "${BLUE}🔍 Looking for $service_name processes...${NC}"
    
    local pids=$(pgrep -f "$process_name" 2>/dev/null || true)
    
    if [[ -n "$pids" ]]; then
        echo -e "${BLUE}🛑 Stopping $service_name processes: $pids${NC}"
        echo "$pids" | xargs kill 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        local remaining_pids=$(pgrep -f "$process_name" 2>/dev/null || true)
        if [[ -n "$remaining_pids" ]]; then
            echo -e "${YELLOW}⚠️  Force killing remaining $service_name processes...${NC}"
            echo "$remaining_pids" | xargs kill -9 2>/dev/null || true
        fi
        
        echo -e "${GREEN}✅ $service_name processes stopped${NC}"
    else
        echo -e "${YELLOW}⚠️  No $service_name processes found${NC}"
    fi
}

# Stop by PID files first
stop_by_pid_file "Backend" "logs/backend.pid"
stop_by_pid_file "Frontend" "logs/frontend.pid"

# Stop by process names as backup
stop_by_name "uvicorn.*main:app" "Backend"
stop_by_name "react-scripts start" "Frontend"
stop_by_name "node.*react-scripts" "Frontend"

# Clean up additional processes
echo -e "${BLUE}🧹 Cleaning up additional processes...${NC}"

# Stop any Python processes running main.py
pkill -f "python.*main.py" 2>/dev/null || true

# Stop any Node.js processes on our ports
for port in 12000 12001 3000; do
    local pid=$(lsof -ti:$port 2>/dev/null || true)
    if [[ -n "$pid" ]]; then
        echo -e "${BLUE}🛑 Stopping process on port $port (PID: $pid)...${NC}"
        kill $pid 2>/dev/null || true
    fi
done

# Clean up log files if they exist
if [[ -d "logs" ]]; then
    echo -e "${BLUE}🧹 Cleaning up log files...${NC}"
    rm -f logs/*.pid
    # Keep log files for debugging, just remove PID files
fi

echo ""
echo -e "${GREEN}✅ ALL SERVICES STOPPED SUCCESSFULLY!${NC}"
echo -e "${BLUE}💡 You can restart with: ./start_universal.sh${NC}"