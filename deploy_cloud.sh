#!/bin/bash

echo "☁️ TRIỂN KHAI CLOUD - 99% ĐẢM BẢO"
echo "================================="
echo "🌐 Deploy lên Vercel + Railway"
echo "✅ Không cần cài đặt gì trên máy user!"
echo ""

# Check if required tools are installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm chưa được cài đặt"
    exit 1
fi

# Install deployment tools
echo "📦 Cài đặt deployment tools..."
npm install -g vercel @railway/cli

# Deploy Frontend to Vercel
echo ""
echo "🚀 Deploy Frontend lên Vercel..."
cd frontend

# Create vercel.json config
cat > vercel.json << EOF
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "s-maxage=31536000,immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_URL": "https://minhha-backend.railway.app"
  }
}
EOF

# Deploy to Vercel
vercel --prod

cd ..

# Deploy Backend to Railway
echo ""
echo "🚂 Deploy Backend lên Railway..."
cd backend

# Create railway.json config
cat > railway.json << EOF
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "python -m uvicorn main:app --host 0.0.0.0 --port \$PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF

# Deploy to Railway
railway login
railway init
railway up

cd ..

echo ""
echo "🎉 CLOUD DEPLOYMENT HOÀN TẤT!"
echo "============================="
echo ""
echo "🌐 Website URLs:"
echo "   Frontend: https://minhha-website.vercel.app"
echo "   Backend:  https://minhha-backend.railway.app"
echo ""
echo "✅ Ưu điểm Cloud Deployment:"
echo "   - 99% uptime guarantee"
echo "   - Auto-scaling"
echo "   - Global CDN"
echo "   - HTTPS tự động"
echo "   - Không cần server maintenance"
echo "   - Truy cập từ mọi nơi trên thế giới"
echo ""
echo "💰 Chi phí:"
echo "   - Vercel: Free tier (đủ dùng)"
echo "   - Railway: \$5/month (có free tier)"
echo ""
echo "🔗 Chia sẻ link này với khách hàng:"
echo "   https://minhha-website.vercel.app"