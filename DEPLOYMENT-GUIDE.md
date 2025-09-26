# 🚀 HƯỚNG DẪN TRIỂN KHAI - Website Minh Hà

## 📋 TÓM TẮT VẤN ĐỀ VÀ GIẢI PHÁP

### 🔍 **Vấn đề khi chuyển sang máy khác:**

1. **ERR_CONNECTION_REFUSED** - Frontend không kết nối được backend
2. **CORS Policy Errors** - Backend từ chối requests từ frontend  
3. **API Endpoints Mismatch** - Frontend gọi sai API endpoints
4. **Port Conflicts** - Ports đã được sử dụng bởi services khác
5. **Hardcoded Configuration** - URLs và cấu hình cố định cho môi trường cụ thể

### ✅ **Giải pháp đã triển khai:**

1. **Auto-Detection System** - Tự động phát hiện môi trường và cấu hình API
2. **Dynamic CORS Configuration** - Backend tự động cấu hình CORS cho mọi môi trường
3. **Flexible Port Configuration** - Hỗ trợ nhiều ports và tự động fallback
4. **Environment Templates** - Templates cấu hình cho mọi môi trường
5. **Automated Setup Scripts** - Scripts tự động cài đặt và cấu hình

## 🛠️ CÁCH TRIỂN KHAI TRÊN MÁY MỚI

### **Bước 1: Clone và Setup**
```bash
# Clone repository
git clone https://github.com/khpt1976-cloud/WebMinhha26T9.git
cd WebMinhha26T9

# Chạy script setup tự động
chmod +x setup-environment.sh
./setup-environment.sh
```

### **Bước 2: Khởi động Services**
```bash
# Khởi động tất cả services
./start-all.sh

# Hoặc khởi động từng service riêng biệt
./start-backend.sh    # Backend API (port 8000)
./start-frontend.sh   # Frontend Web (port 3000)  
./start-admin.sh      # Admin Panel (port 3001)
```

### **Bước 3: Kiểm tra kết nối**
```bash
# Test backend
curl http://localhost:8000/health

# Test products API
curl http://localhost:8000/api/products

# Mở browser và truy cập
# Frontend: http://localhost:3000
# Admin: http://localhost:3001
```

## 🔧 CẤU HÌNH CHI TIẾT

### **Frontend Configuration**

**File: `frontend/.env`**
```bash
# API URL - Để trống để auto-detect
REACT_APP_API_URL=

# Server settings
PORT=3000
HOST=0.0.0.0
DANGEROUSLY_DISABLE_HOST_CHECK=true

# Environment
REACT_APP_ENV=development
REACT_APP_AUTO_DETECT_API=true
```

**Auto-Detection Logic:**
- ✅ Tự động phát hiện `localhost`, `127.0.0.1`, local network IPs
- ✅ Hỗ trợ OpenHands environment (`*.prod-runtime.all-hands.dev`)
- ✅ Test multiple ports: `8000`, `12000`, `5000`, `3001`, `8080`
- ✅ Fallback gracefully nếu không tìm thấy API

### **Backend Configuration**

**File: `backend/.env`**
```bash
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=development
CORS_ORIGINS=["*"]  # Auto-configured in code
```

**Auto-CORS Logic:**
- ✅ Tự động include `localhost`, `127.0.0.1` với multiple ports
- ✅ Auto-detect local network IPs (`192.168.x.x`)
- ✅ Support OpenHands patterns (`work-*-*.prod-runtime.all-hands.dev`)
- ✅ Wildcard fallback cho development environment

## 🌐 ENVIRONMENT DETECTION

### **Development Environment**
```typescript
// Detected when:
hostname === 'localhost' || 
hostname === '127.0.0.1' || 
hostname.startsWith('192.168.')

// API URLs tested:
- http://localhost:8000
- http://localhost:12000  
- http://localhost:5000
- http://127.0.0.1:8000
- http://192.168.x.x:8000
```

### **OpenHands Environment**
```typescript
// Detected when:
hostname.includes('prod-runtime.all-hands.dev')

// API URLs tested:
- https://work-1-*.prod-runtime.all-hands.dev
- https://work-2-*.prod-runtime.all-hands.dev
- https://work-3-*.prod-runtime.all-hands.dev
```

### **Production Environment**
```typescript
// Detected when:
hostname.includes('minhha.com')

// API URLs tested:
- https://api.minhha.com
- https://minhha.com/api
```

## 🚨 TROUBLESHOOTING

### **1. ERR_CONNECTION_REFUSED**
```bash
# Kiểm tra backend có chạy không
curl http://localhost:8000/health

# Kiểm tra port có bị chiếm không
lsof -ti:8000

# Restart services
./start-all.sh
```

### **2. CORS Errors**
```bash
# Backend tự động cấu hình CORS
# Kiểm tra logs backend để xem CORS origins
# Thường do frontend và backend chạy khác port dự kiến
```

### **3. Products Not Loading**
```bash
# Test API trực tiếp
curl http://localhost:8000/api/products

# Kiểm tra database
ls -la backend/database.db

# Xem logs backend
```

### **4. Port Conflicts**
```bash
# Tìm process đang dùng port
lsof -ti:8000

# Kill process
kill -9 <PID>

# Hoặc đổi port trong .env files
```

## 📊 MONITORING & DEBUGGING

### **Frontend Debugging**
```javascript
// Mở browser DevTools Console để xem:
// 🔍 Testing API connections: [urls...]
// ✅ Found working API URL: http://localhost:8000
// 🔄 API URL updated to: http://localhost:8000
```

### **Backend Debugging**
```bash
# Backend logs hiển thị:
# 🌐 CORS Origins configured (X total):
#    • http://localhost:3000
#    • http://localhost:8000
#    • ...
```

### **API Testing**
```bash
# Health check
curl http://localhost:8000/health

# Products API
curl http://localhost:8000/api/products | jq '.[0:3]'

# Specific product
curl http://localhost:8000/api/products/1
```

## 🎯 BEST PRACTICES

### **1. Environment Setup**
- ✅ Luôn chạy `./setup-environment.sh` trên máy mới
- ✅ Không hardcode URLs trong code
- ✅ Sử dụng environment variables
- ✅ Test API connections trước khi deploy

### **2. Development Workflow**
- ✅ Start backend trước, frontend sau
- ✅ Check health endpoint trước khi test frontend
- ✅ Monitor browser console cho API connection logs
- ✅ Use `./start-all.sh` để start tất cả services

### **3. Debugging**
- ✅ Check browser DevTools Network tab
- ✅ Monitor backend terminal logs
- ✅ Test API endpoints với curl
- ✅ Verify ports không bị conflict

## 📞 SUPPORT

Nếu gặp vấn đề:
1. Đọc `TROUBLESHOOTING.md`
2. Check browser console và backend logs
3. Test API endpoints trực tiếp với curl
4. Verify environment configuration

---

**🎉 Với hệ thống auto-detection này, website sẽ hoạt động trên bất kỳ máy nào mà không cần cấu hình thủ công!**