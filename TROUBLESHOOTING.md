# 🛠️ HƯỚNG DẪN KHẮC PHỤC SỰ CỐ

## 🚨 **CÁC LỖI THƯỜNG GẶP VÀ CÁCH SỬA**

### **1. LỖI PORT CONFLICTS**

#### **Triệu chứng:**
```bash
Error: listen EADDRINUSE: address already in use :::12000
Error: listen EADDRINUSE: address already in use :::12001
```

#### **Nguyên nhân:**
Port 12000 hoặc 12001 đã được sử dụng bởi ứng dụng khác

#### **Cách sửa:**
```bash
# Kiểm tra process đang sử dụng port
lsof -i :12000
lsof -i :12001

# Kill process đang sử dụng port
kill -9 <PID>

# Hoặc sử dụng script an toàn
./start_safe.sh  # Tự động tìm port khả dụng
```

---

### **2. LỖI NODE.JS VERSION**

#### **Triệu chứng:**
```bash
Error: Node.js version 14.x required, found 12.x
npm ERR! engine Unsupported engine
```

#### **Cách sửa:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node

# Windows
# Download từ https://nodejs.org/
```

---

### **3. LỖI PYTHON VERSION**

#### **Triệu chứng:**
```bash
Error: Python 3.8+ required, found 3.6
ModuleNotFoundError: No module named 'fastapi'
```

#### **Cách sửa:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.9 python3.9-pip

# macOS
brew install python@3.9

# Cài packages
pip3 install -r backend/requirements.txt
```

---

### **4. LỖI DEPENDENCIES**

#### **Triệu chứng:**
```bash
npm ERR! peer dep missing
pip install failed
Module not found
```

#### **Cách sửa:**
```bash
# Frontend dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Backend dependencies
cd backend
pip3 install --user -r requirements.txt
```

---

### **5. LỖI NETWORK/FIREWALL**

#### **Triệu chứng:**
```bash
Error: Connection refused
Error: Network unreachable
CORS policy error
```

#### **Cách sửa:**
```bash
# Kiểm tra firewall
sudo ufw status
sudo ufw allow 12000
sudo ufw allow 12001

# Kiểm tra network
ping google.com
curl -I https://www.google.com
```

---

### **6. LỖI PERMISSIONS**

#### **Triệu chứng:**
```bash
Permission denied
EACCES: permission denied
```

#### **Cách sửa:**
```bash
# Cấp quyền execute cho scripts
chmod +x start_safe.sh
chmod +x check_compatibility.sh

# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

---

### **7. LỖI CORS**

#### **Triệu chứng:**
```
Access to fetch at 'http://localhost:12001' from origin 'http://localhost:12000' 
has been blocked by CORS policy
```

#### **Cách sửa:**
```python
# backend/main.py - Đảm bảo CORS được config đúng
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Hoặc specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 🔧 **CÔNG CỤ DIAGNOSTIC**

### **1. Health Check Script**
```bash
#!/bin/bash
echo "🏥 HEALTH CHECK"
echo "==============="

# Check backend
echo "🔧 Backend Health:"
curl -s http://localhost:12001/health || echo "❌ Backend down"

# Check frontend
echo "🎨 Frontend Health:"
curl -s http://localhost:12000 > /dev/null && echo "✅ Frontend up" || echo "❌ Frontend down"

# Check processes
echo "📊 Running Processes:"
ps aux | grep -E "(node|python|uvicorn)" | grep -v grep
```

### **2. Log Analyzer**
```bash
#!/bin/bash
echo "📝 LOG ANALYSIS"
echo "==============="

echo "🔧 Backend Logs (last 20 lines):"
tail -20 backend.log

echo ""
echo "🎨 Frontend Logs (last 20 lines):"
tail -20 frontend.log

echo ""
echo "🚨 Error Summary:"
grep -i error *.log | tail -10
```

---

## 📋 **CHECKLIST KHẮC PHỤC**

### **Khi gặp lỗi, làm theo thứ tự:**

- [ ] **1. Chạy compatibility check**
  ```bash
  ./check_compatibility.sh
  ```

- [ ] **2. Kiểm tra system requirements**
  - Node.js >= 16
  - Python >= 3.8
  - Git installed
  - Sufficient disk space (>1GB)
  - Available ports

- [ ] **3. Kiểm tra network**
  ```bash
  ping google.com
  curl -I https://www.google.com
  ```

- [ ] **4. Clean install**
  ```bash
  # Clean frontend
  cd frontend && rm -rf node_modules package-lock.json
  npm install --legacy-peer-deps
  
  # Clean backend
  cd backend && pip3 install --user -r requirements.txt
  ```

- [ ] **5. Sử dụng safe start**
  ```bash
  ./start_safe.sh
  ```

- [ ] **6. Kiểm tra logs**
  ```bash
  tail -f backend.log
  tail -f frontend.log
  ```

- [ ] **7. Health check**
  ```bash
  curl http://localhost:12001/health
  curl http://localhost:12000
  ```

---

## 🆘 **KHI TẤT CẢ ĐỀU THẤT BẠI**

### **Plan B - Manual Setup:**

```bash
# 1. Setup backend manually
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
pip install fastapi uvicorn python-dotenv
python3 -m uvicorn main:app --host 0.0.0.0 --port 12001

# 2. Setup frontend manually (terminal mới)
cd frontend
npm install react react-dom react-scripts
npm start
```

### **Plan C - Docker (nếu có Docker):**

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 12000
CMD ["npm", "start"]
```

```bash
docker build -t minhha-website .
docker run -p 12000:12000 minhha-website
```

---

## 📞 **HỖ TRỢ KHẨN CẤP**

### **Thông tin debug cần cung cấp:**

1. **OS và version:** `uname -a`
2. **Node.js version:** `node --version`
3. **Python version:** `python3 --version`
4. **Error logs:** Nội dung file `backend.log` và `frontend.log`
5. **Network status:** `curl -I https://www.google.com`
6. **Port status:** `lsof -i :12000` và `lsof -i :12001`

### **Commands để collect info:**
```bash
echo "=== SYSTEM INFO ===" > debug_info.txt
uname -a >> debug_info.txt
node --version >> debug_info.txt
python3 --version >> debug_info.txt
echo "=== LOGS ===" >> debug_info.txt
cat backend.log >> debug_info.txt
cat frontend.log >> debug_info.txt
```

---

## ✅ **THÀNH CÔNG INDICATORS**

### **Khi mọi thứ hoạt động đúng:**

```bash
✅ Backend Health: {"status":"healthy"}
✅ Frontend: React app loaded
✅ API Connection: Successful
✅ Products: Displaying correctly
✅ Navigation: All menus working
```

### **URLs để test:**
- Frontend: http://localhost:12000
- Backend API: http://localhost:12001/health
- Products API: http://localhost:12001/api/products
- Categories API: http://localhost:12001/api/categories

**Nếu tất cả URLs trên đều hoạt động → Website đã sẵn sàng!** 🎉