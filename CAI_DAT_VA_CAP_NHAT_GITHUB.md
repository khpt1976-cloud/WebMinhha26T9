# 🚀 Hướng Dẫn Cài Đặt và Cập Nhật GitHub - Website Minh Hà

## ✅ Trạng Thái Hiện Tại

### 📥 Đã Tải Xuống Thành Công
- ✅ Repository đã được clone từ GitHub: `https://github.com/khpt1976-cloud/WebMinhha26T9.git`
- ✅ Tất cả files và dependencies đã được tải về
- ✅ Cấu trúc dự án hoàn chỉnh

### 🔧 Cài Đặt Dependencies
- ✅ **Backend**: Python virtual environment đã được tạo
- ✅ **Backend Dependencies**: FastAPI, Uvicorn, SQLAlchemy và các packages khác đã được cài đặt
- ✅ **Frontend**: Node.js dependencies sẵn sàng cài đặt

### 📤 Cập Nhật GitHub Thành Công
- ✅ Đã cập nhật quyền thực thi cho `start_safe.sh`
- ✅ Commit message: "Update start_safe.sh permissions for executable access"
- ✅ Push thành công lên GitHub repository

## 🏗️ Cấu Trúc Dự Án

```
WebMinhha26T9/
├── backend/                 # Python FastAPI backend
│   ├── venv/               # Virtual environment (đã cài đặt)
│   ├── main.py             # Entry point
│   ├── requirements.txt    # Python dependencies
│   ├── api/                # API routes
│   ├── models/             # Database models
│   └── static/             # Static files
├── frontend/               # React TypeScript frontend
│   ├── src/                # Source code
│   ├── public/             # Public assets
│   ├── package.json        # Node.js dependencies
│   └── .env                # Environment variables
├── Admin/                  # Admin panel
├── start_universal.sh      # Script khởi động thông minh
├── start_safe.sh          # Script khởi động an toàn (✅ executable)
├── start.sh               # Script khởi động cơ bản
└── README.md              # Tài liệu hướng dẫn
```

## 🚀 Cách Khởi Động Website

### Phương pháp 1: Script Universal (Khuyến nghị)
```bash
cd /workspace/project/WebMinhha26T9
./start_universal.sh
```

### Phương pháp 2: Script Safe
```bash
cd /workspace/project/WebMinhha26T9
./start_safe.sh
```

### Phương pháp 3: Khởi động thủ công

#### Backend:
```bash
cd /workspace/project/WebMinhha26T9/backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 12000 --reload
```

#### Frontend (terminal mới):
```bash
cd /workspace/project/WebMinhha26T9/frontend
npm install  # nếu chưa cài
npm start
```

## 🌐 Truy Cập Website

Sau khi khởi động thành công:
- **Frontend**: `http://localhost:12000` hoặc port được hiển thị
- **Backend API**: `http://localhost:12001` hoặc port được hiển thị
- **API Documentation**: `http://localhost:12001/docs`

## 🔄 Cập Nhật Từ GitHub

Để cập nhật dự án từ GitHub:
```bash
cd /workspace/project/WebMinhha26T9
git pull origin main

# Cập nhật backend dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Cập nhật frontend dependencies
cd ../frontend
npm install
```

## 📤 Đẩy Thay Đổi Lên GitHub

```bash
cd /workspace/project/WebMinhha26T9

# Kiểm tra trạng thái
git status

# Thêm files thay đổi
git add .

# Commit với message
git commit -m "Mô tả thay đổi

Co-authored-by: openhands <openhands@all-hands.dev>"

# Push lên GitHub
git push origin main
```

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy** - Database ORM
- **Pydantic** - Data validation
- **Python-Jose** - JWT tokens

### Frontend
- **React 19** với TypeScript
- **Styled Components** cho styling
- **Axios** cho API calls
- **React Router** cho navigation
- **React Icons** cho icons

## 📱 Tính Năng Website

### ✅ Đã Hoàn Thành
- [x] Header với logo và navigation
- [x] Hero section với search
- [x] Product grid hiển thị danh mục sản phẩm
- [x] Product cards với hình ảnh và rating
- [x] Footer với thông tin liên hệ
- [x] Responsive design cho mobile
- [x] Backend API với FastAPI
- [x] Kết nối frontend-backend
- [x] Admin panel system
- [x] User authentication

## 🔧 Troubleshooting

### Lỗi Port đang được sử dụng
```bash
# Tìm và dừng process đang sử dụng port
ps aux | grep -E "(uvicorn|main.py|npm start)" | grep -v grep
pkill -f "uvicorn\|main.py\|npm start"
```

### Lỗi Dependencies
```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install --legacy-peer-deps
```

### Lỗi Git Authentication
```bash
# Cập nhật remote URL với token
git remote set-url origin https://YOUR_TOKEN@github.com/khpt1976-cloud/WebMinhha26T9.git
```

## 📞 Thông Tin Liên Hệ

**Cửa Hàng Minh Hà**
- 📞 Hotline: 0974.876.168
- 📍 Địa chỉ: 417 Ngô Gia Tự, Hải An, Hải Phòng
- 🕐 Giờ mở cửa: Thứ 2 - Chủ nhật: 8:00 - 20:00

## 📝 Ghi Chú

- Dự án đã được cài đặt thành công và sẵn sàng sử dụng
- Tất cả dependencies đã được cài đặt
- GitHub repository đã được cập nhật
- Website có thể chạy trên nhiều môi trường khác nhau

---

**🎉 Dự án đã sẵn sàng để phát triển và triển khai!**

**GitHub Repository**: https://github.com/khpt1976-cloud/WebMinhha26T9.git