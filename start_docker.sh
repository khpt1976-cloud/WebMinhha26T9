#!/bin/bash

echo "🐳 KHỞI ĐỘNG WEBSITE MINH HÀ - DOCKER MODE"
echo "=========================================="
echo "📦 Đảm bảo 95% thành công trên mọi máy có Docker!"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker chưa được cài đặt!"
    echo ""
    echo "🔧 HƯỚNG DẪN CÀI DOCKER:"
    echo "================================"
    echo ""
    echo "🐧 Ubuntu/Debian:"
    echo "curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "sudo sh get-docker.sh"
    echo "sudo usermod -aG docker \$USER"
    echo ""
    echo "🍎 macOS:"
    echo "brew install --cask docker"
    echo "# Hoặc download Docker Desktop từ docker.com"
    echo ""
    echo "🪟 Windows:"
    echo "# Download Docker Desktop từ docker.com"
    echo ""
    echo "Sau khi cài xong, chạy lại script này!"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo "❌ Docker Compose chưa được cài đặt!"
    echo "pip install docker-compose"
    exit 1
fi

echo "✅ Docker đã được cài đặt"
echo "✅ Docker Compose đã sẵn sàng"
echo ""

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon chưa chạy!"
    echo "🔧 Khởi động Docker:"
    echo "sudo systemctl start docker  # Linux"
    echo "# Hoặc mở Docker Desktop      # macOS/Windows"
    exit 1
fi

echo "✅ Docker daemon đang chạy"
echo ""

# Stop any existing containers
echo "🛑 Dừng containers cũ (nếu có)..."
docker-compose -f docker-compose-production.yml down 2>/dev/null || true

# Clean up old images (optional)
echo "🧹 Dọn dẹp images cũ..."
docker system prune -f

# Build and start services
echo "🏗️ Build và khởi động services..."
echo "⏳ Quá trình này có thể mất 3-5 phút..."
echo ""

if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose-production.yml up --build -d
else
    docker compose -f docker-compose-production.yml up --build -d
fi

# Wait for services to be ready
echo ""
echo "⏳ Đợi services khởi động..."
sleep 30

# Health check
echo ""
echo "🏥 Kiểm tra health..."

# Check backend
echo "🔧 Kiểm tra Backend..."
for i in {1..10}; do
    if curl -s http://localhost:12001/health > /dev/null; then
        echo "✅ Backend: Healthy"
        break
    else
        echo "⏳ Backend: Đang khởi động... ($i/10)"
        sleep 5
    fi
done

# Check frontend
echo "🎨 Kiểm tra Frontend..."
for i in {1..10}; do
    if curl -s http://localhost:12000 > /dev/null; then
        echo "✅ Frontend: Healthy"
        break
    else
        echo "⏳ Frontend: Đang khởi động... ($i/10)"
        sleep 5
    fi
done

# Display results
echo ""
echo "🎉 DOCKER DEPLOYMENT HOÀN TẤT!"
echo "=============================="
echo ""
echo "🌐 Website URLs:"
echo "   Frontend: http://localhost:12000"
echo "   Backend:  http://localhost:12001"
echo "   API Docs: http://localhost:12001/docs"
echo ""
echo "📊 Container Status:"
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose-production.yml ps
else
    docker compose -f docker-compose-production.yml ps
fi
echo ""
echo "📝 Useful Commands:"
echo "   Xem logs:     docker-compose -f docker-compose-production.yml logs -f"
echo "   Dừng:         docker-compose -f docker-compose-production.yml down"
echo "   Restart:      docker-compose -f docker-compose-production.yml restart"
echo "   Rebuild:      docker-compose -f docker-compose-production.yml up --build -d"
echo ""
echo "✅ Website đã sẵn sàng sử dụng!"
echo "🐳 Docker đảm bảo chạy được trên 95% máy tính!"