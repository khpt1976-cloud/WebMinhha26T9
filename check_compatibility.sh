#!/bin/bash

echo "🔍 KIỂM TRA TƯƠNG THÍCH HỆ THỐNG"
echo "================================"

ERRORS=0
WARNINGS=0

# Function to log error
log_error() {
    echo "❌ ERROR: $1"
    ERRORS=$((ERRORS + 1))
}

# Function to log warning
log_warning() {
    echo "⚠️ WARNING: $1"
    WARNINGS=$((WARNINGS + 1))
}

# Function to log success
log_success() {
    echo "✅ $1"
}

# Check OS
echo "🖥️ Kiểm tra Operating System..."
OS=$(uname -s)
case $OS in
    Linux*)     log_success "OS: Linux - Supported" ;;
    Darwin*)    log_success "OS: macOS - Supported" ;;
    CYGWIN*)    log_warning "OS: Windows/Cygwin - May have issues" ;;
    MINGW*)     log_warning "OS: Windows/MinGW - May have issues" ;;
    *)          log_error "OS: $OS - Unknown/Unsupported" ;;
esac

# Check Node.js
echo ""
echo "📦 Kiểm tra Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2)
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)
    if [ "$MAJOR_VERSION" -ge 16 ]; then
        log_success "Node.js: v$NODE_VERSION - Compatible"
    elif [ "$MAJOR_VERSION" -ge 14 ]; then
        log_warning "Node.js: v$NODE_VERSION - May work but upgrade recommended"
    else
        log_error "Node.js: v$NODE_VERSION - Too old, need v14+"
    fi
else
    log_error "Node.js: Not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    log_success "npm: v$NPM_VERSION - Available"
else
    log_warning "npm: Not found - Will try yarn"
fi

# Check yarn
if command -v yarn &> /dev/null; then
    YARN_VERSION=$(yarn --version)
    log_success "yarn: v$YARN_VERSION - Available"
fi

# Check Python
echo ""
echo "🐍 Kiểm tra Python..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    MAJOR_VERSION=$(echo $PYTHON_VERSION | cut -d'.' -f1)
    MINOR_VERSION=$(echo $PYTHON_VERSION | cut -d'.' -f2)
    if [ "$MAJOR_VERSION" -eq 3 ] && [ "$MINOR_VERSION" -ge 8 ]; then
        log_success "Python: v$PYTHON_VERSION - Compatible"
    elif [ "$MAJOR_VERSION" -eq 3 ] && [ "$MINOR_VERSION" -ge 6 ]; then
        log_warning "Python: v$PYTHON_VERSION - May work but upgrade recommended"
    else
        log_error "Python: v$PYTHON_VERSION - Need Python 3.8+"
    fi
else
    log_error "Python3: Not installed"
fi

# Check pip
if command -v pip3 &> /dev/null; then
    PIP_VERSION=$(pip3 --version | cut -d' ' -f2)
    log_success "pip3: v$PIP_VERSION - Available"
else
    log_error "pip3: Not installed"
fi

# Check ports
echo ""
echo "🔌 Kiểm tra ports..."
check_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warning "Port $port: In use"
            return 1
        else
            log_success "Port $port: Available"
            return 0
        fi
    elif command -v netstat &> /dev/null; then
        if netstat -tulpn 2>/dev/null | grep ":$port " > /dev/null; then
            log_warning "Port $port: In use"
            return 1
        else
            log_success "Port $port: Available"
            return 0
        fi
    else
        log_warning "Cannot check port $port: No lsof or netstat"
        return 0
    fi
}

check_port 12000
check_port 12001

# Check network connectivity
echo ""
echo "🌐 Kiểm tra network connectivity..."
if command -v curl &> /dev/null; then
    if curl -s --connect-timeout 5 https://www.google.com > /dev/null; then
        log_success "Internet: Connected"
    else
        log_warning "Internet: Connection issues"
    fi
else
    log_warning "curl: Not installed - Cannot test connectivity"
fi

# Check disk space
echo ""
echo "💾 Kiểm tra disk space..."
if command -v df &> /dev/null; then
    AVAILABLE=$(df . | tail -1 | awk '{print $4}')
    if [ "$AVAILABLE" -gt 1000000 ]; then  # > 1GB
        log_success "Disk space: $(($AVAILABLE / 1024))MB available"
    else
        log_warning "Disk space: Only $(($AVAILABLE / 1024))MB available"
    fi
fi

# Check memory
echo ""
echo "🧠 Kiểm tra memory..."
if command -v free &> /dev/null; then
    AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
    if [ "$AVAILABLE_MEM" -gt 1024 ]; then  # > 1GB
        log_success "Memory: ${AVAILABLE_MEM}MB available"
    else
        log_warning "Memory: Only ${AVAILABLE_MEM}MB available"
    fi
elif command -v vm_stat &> /dev/null; then
    # macOS
    log_success "Memory: macOS detected (assuming sufficient)"
fi

# Check git
echo ""
echo "📚 Kiểm tra Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version | cut -d' ' -f3)
    log_success "Git: v$GIT_VERSION - Available"
else
    log_error "Git: Not installed"
fi

# Summary
echo ""
echo "📊 TỔNG KẾT KIỂM TRA"
echo "==================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "🎉 HOÀN HẢO! Hệ thống hoàn toàn tương thích"
    echo "✅ Có thể chạy: ./start_safe.sh"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️ CÓ THỂ CHẠY với $WARNINGS cảnh báo"
    echo "💡 Khuyến nghị: Sửa các cảnh báo trước khi chạy"
    echo "✅ Có thể thử: ./start_safe.sh"
    exit 0
else
    echo "❌ CÓ $ERRORS lỗi nghiêm trọng và $WARNINGS cảnh báo"
    echo "🛠️ CẦN SỬA các lỗi trước khi chạy"
    echo ""
    echo "🔧 HƯỚNG DẪN SỬA LỖI:"
    echo "- Cài Node.js: https://nodejs.org/"
    echo "- Cài Python: https://python.org/"
    echo "- Cài Git: https://git-scm.com/"
    exit 1
fi