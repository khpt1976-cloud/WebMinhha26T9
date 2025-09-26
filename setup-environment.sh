#!/bin/bash

# =============================================================================
# SETUP SCRIPT CHO WEBSITE MINH HÀ
# Tự động cấu hình môi trường cho máy mới
# =============================================================================

set -e  # Exit on any error

echo "🚀 ===== SETUP WEBSITE MINH HÀ ===== 🚀"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "backend/main.py" ] || [ ! -f "frontend/package.json" ]; then
    print_error "Please run this script from the WebMinhha26T9 root directory"
    exit 1
fi

print_info "Detected project directory: $(pwd)"

# 1. Setup Frontend Environment
echo ""
echo "📦 Setting up Frontend..."

# Copy .env.example to .env if not exists
if [ ! -f "frontend/.env" ]; then
    if [ -f "frontend/.env.example" ]; then
        cp frontend/.env.example frontend/.env
        print_status "Created frontend/.env from template"
    else
        # Create basic .env
        cat > frontend/.env << EOF
# Auto-generated environment configuration
REACT_APP_API_URL=
PORT=3000
HOST=0.0.0.0
DANGEROUSLY_DISABLE_HOST_CHECK=true
REACT_APP_ENV=development
REACT_APP_HOTLINE=0974.876.168
REACT_APP_ADDRESS=417 Ngô Gia Tự, Hải An, Hải Phòng
REACT_APP_STORE_NAME=Cửa Hàng Minh Hà
REACT_APP_DEBUG=true
REACT_APP_AUTO_DETECT_API=true
EOF
        print_status "Created basic frontend/.env"
    fi
else
    print_warning "frontend/.env already exists, skipping..."
fi

# Install frontend dependencies
cd frontend
if [ ! -d "node_modules" ]; then
    print_info "Installing frontend dependencies..."
    npm install
    print_status "Frontend dependencies installed"
else
    print_info "Frontend dependencies already installed"
fi
cd ..

# 2. Setup Backend Environment
echo ""
echo "🐍 Setting up Backend..."

# Create backend .env if not exists
if [ ! -f "backend/.env" ]; then
    cat > backend/.env << EOF
# Auto-generated backend configuration
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
DATABASE_URL=sqlite:///./database.db
DATABASE_ECHO=false
CORS_ORIGINS=["*"]
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production-$(date +%s)
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
UPLOAD_DIR=static/uploads
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=["jpg","jpeg","png","gif","webp"]
ADMIN_EMAIL=admin@minhha.com
ADMIN_PASSWORD=admin123
STORE_NAME=Cửa Hàng Minh Hà
STORE_HOTLINE=0974.876.168
STORE_ADDRESS=417 Ngô Gia Tự, Hải An, Hải Phòng
EOF
    print_status "Created backend/.env"
else
    print_warning "backend/.env already exists, skipping..."
fi

# Setup Python virtual environment
cd backend
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
    print_status "Virtual environment created"
fi

# Activate virtual environment and install dependencies
print_info "Installing backend dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
print_status "Backend dependencies installed"
cd ..

# 3. Create startup scripts
echo ""
echo "📝 Creating startup scripts..."

# Create start-backend.sh
cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Backend API Server..."
cd backend
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
EOF
chmod +x start-backend.sh
print_status "Created start-backend.sh"

# Create start-frontend.sh
cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Frontend Development Server..."
cd frontend
npm start
EOF
chmod +x start-frontend.sh
print_status "Created start-frontend.sh"

# Create start-admin.sh
cat > start-admin.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Admin Panel..."
cd Admin
npm start
EOF
chmod +x start-admin.sh
print_status "Created start-admin.sh"

# Create start-all.sh
cat > start-all.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting All Services..."

# Function to kill background processes on exit
cleanup() {
    echo "🛑 Stopping all services..."
    jobs -p | xargs -r kill
    exit
}
trap cleanup SIGINT SIGTERM

# Start backend
echo "Starting Backend..."
./start-backend.sh &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 5

# Start frontend
echo "Starting Frontend..."
./start-frontend.sh &
FRONTEND_PID=$!

# Start admin (if exists)
if [ -d "Admin" ]; then
    echo "Starting Admin Panel..."
    ./start-admin.sh &
    ADMIN_PID=$!
fi

echo ""
echo "🎉 All services started!"
echo "📊 Backend API: http://localhost:8000"
echo "🌐 Frontend: http://localhost:3000"
if [ -d "Admin" ]; then
    echo "⚙️  Admin Panel: http://localhost:3001"
fi
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for all background processes
wait
EOF
chmod +x start-all.sh
print_status "Created start-all.sh"

# 4. Test API endpoints
echo ""
echo "🧪 Testing setup..."

# Start backend temporarily to test
print_info "Starting backend for testing..."
cd backend
source venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 10

# Test health endpoint
if curl -s http://localhost:8000/health > /dev/null; then
    print_status "Backend health check passed"
else
    print_warning "Backend health check failed (this might be normal on first run)"
fi

# Stop test backend
kill $BACKEND_PID 2>/dev/null || true

# 5. Create troubleshooting guide
echo ""
echo "📚 Creating troubleshooting guide..."

cat > TROUBLESHOOTING.md << 'EOF'
# 🔧 TROUBLESHOOTING GUIDE - Website Minh Hà

## Common Issues and Solutions

### 1. 🚫 ERR_CONNECTION_REFUSED
**Problem:** Frontend cannot connect to backend
**Solutions:**
- Check if backend is running: `curl http://localhost:8000/health`
- Verify backend port in terminal output
- Check frontend .env file for correct API_URL
- Try restarting both services: `./start-all.sh`

### 2. 🌐 CORS Policy Errors
**Problem:** Browser blocks API requests due to CORS
**Solutions:**
- Backend automatically configures CORS for development
- Check browser console for specific CORS errors
- Verify frontend and backend are running on expected ports
- Clear browser cache and cookies

### 3. 📦 Module Not Found Errors
**Problem:** Missing dependencies
**Solutions:**
- Frontend: `cd frontend && npm install`
- Backend: `cd backend && source venv/bin/activate && pip install -r requirements.txt`
- Run setup script again: `./setup-environment.sh`

### 4. 🚪 Port Already in Use
**Problem:** Cannot start service due to port conflict
**Solutions:**
- Find process using port: `lsof -ti:8000` (replace 8000 with your port)
- Kill process: `kill -9 <PID>`
- Or use different port in .env files

### 5. 🔍 Products Not Loading
**Problem:** API returns empty or error responses
**Solutions:**
- Check backend logs for errors
- Verify database is initialized: Look for `database.db` in backend folder
- Test API directly: `curl http://localhost:8000/api/products`
- Check network tab in browser DevTools

### 6. 🖼️ Images Not Loading
**Problem:** Product images show as broken
**Solutions:**
- Check if `backend/static/images/` folder exists
- Verify image files are present
- Check image URLs in API responses
- Ensure backend serves static files correctly

## Quick Commands

```bash
# Check if services are running
curl http://localhost:8000/health          # Backend health
curl http://localhost:3000                 # Frontend
curl http://localhost:8000/api/products    # Products API

# Restart all services
./start-all.sh

# View logs
# Backend logs appear in terminal
# Frontend logs appear in browser console

# Reset environment
rm -rf frontend/node_modules backend/venv
./setup-environment.sh
```

## Port Configuration

| Service | Default Port | Alternative Ports |
|---------|-------------|-------------------|
| Backend | 8000        | 12000, 5000       |
| Frontend| 3000        | 12001             |
| Admin   | 3001        | 12002             |

## Environment Detection

The application automatically detects:
- ✅ Local development (localhost, 127.0.0.1)
- ✅ OpenHands environment (*.prod-runtime.all-hands.dev)
- ✅ Production environment (custom domains)

## Need Help?

1. Check this troubleshooting guide
2. Look at browser DevTools console
3. Check terminal output for error messages
4. Verify all services are running with correct ports
EOF

print_status "Created TROUBLESHOOTING.md"

# 6. Final summary
echo ""
echo "🎉 ===== SETUP COMPLETE ===== 🎉"
echo ""
print_status "Environment configured successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Start all services: ${GREEN}./start-all.sh${NC}"
echo "2. Or start individually:"
echo "   • Backend:  ${BLUE}./start-backend.sh${NC}"
echo "   • Frontend: ${BLUE}./start-frontend.sh${NC}"
echo "   • Admin:    ${BLUE}./start-admin.sh${NC}"
echo ""
echo "🌐 Default URLs:"
echo "   • Backend API: ${BLUE}http://localhost:8000${NC}"
echo "   • Frontend:    ${BLUE}http://localhost:3000${NC}"
echo "   • Admin Panel: ${BLUE}http://localhost:3001${NC}"
echo ""
echo "📚 If you encounter issues, check: ${YELLOW}TROUBLESHOOTING.md${NC}"
echo ""
print_info "The application will automatically detect and configure API connections!"
EOF
chmod +x setup-environment.sh
print_status "Created setup-environment.sh"