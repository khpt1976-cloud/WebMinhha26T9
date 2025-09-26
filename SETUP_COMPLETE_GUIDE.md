# 🎉 Hướng Dẫn Cài Đặt Hoàn Tất - Website Minh Hà

## ✅ Trạng Thái Cài Đặt
- ✅ **Backend**: Đã cài đặt và chạy thành công trên port 12000
- ✅ **Frontend**: Đã cài đặt và chạy thành công trên port 12001
- ✅ **Dependencies**: Tất cả dependencies đã được cài đặt
- ✅ **Configuration**: Đã cấu hình CORS và API endpoints

## 🌐 Truy Cập Website

### 🔗 URLs Chính
- **Frontend (Website)**: https://work-2-yuqzjjovdhykmiht.prod-runtime.all-hands.dev
- **Backend API**: https://work-1-yuqzjjovdhykmiht.prod-runtime.all-hands.dev
- **API Documentation**: https://work-1-yuqzjjovdhykmiht.prod-runtime.all-hands.dev/docs

### 🏥 Health Check
- **Backend Health**: https://work-1-yuqzjjovdhykmiht.prod-runtime.all-hands.dev/health

## 🚀 Cách Khởi Động

### Phương pháp 1: Sử dụng script tự động (Khuyến nghị)
```bash
cd /workspace/WebMinhha
./start.sh
```

### Phương pháp 2: Khởi động thủ công

#### Backend:
```bash
cd /workspace/WebMinhha/backend
source venv/bin/activate
python main.py
```

#### Frontend (terminal mới):
```bash
cd /workspace/WebMinhha/frontend
npm start
```

## 🛑 Cách Dừng Website
```bash
cd /workspace/WebMinhha
./stop.sh
```

## 📊 Xem Logs
```bash
# Backend logs
tail -f /workspace/WebMinhha/backend/backend.log

# Frontend logs
tail -f /workspace/WebMinhha/frontend/frontend.log
```

## 🔧 Cấu Trúc Dự Án
```
WebMinhha/
├── backend/                 # Python FastAPI backend
│   ├── venv/               # Virtual environment
│   ├── main.py             # Entry point
│   ├── requirements.txt    # Python dependencies
│   ├── api/                # API routes
│   ├── models/             # Database models
│   ├── schemas/            # Pydantic schemas
│   └── static/             # Static files
├── frontend/               # React TypeScript frontend
│   ├── src/                # Source code
│   ├── public/             # Public assets
│   ├── package.json        # Node.js dependencies
│   └── .env                # Environment variables
├── start.sh                # Khởi động script
├── stop.sh                 # Dừng script
└── README.md
```

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy** - Database ORM
- **Pydantic** - Data validation
- **Passlib** - Password hashing
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
- [x] Product management

### 🔄 API Endpoints Chính

#### Public APIs
- `GET /` - Root endpoint
- `GET /health` - Health check
- `GET /api/products` - Lấy tất cả sản phẩm
- `GET /api/products/{id}` - Lấy sản phẩm theo ID
- `GET /api/categories` - Lấy tất cả danh mục
- `GET /api/categories/{slug}` - Lấy danh mục theo slug
- `GET /api/search?q={query}` - Tìm kiếm sản phẩm

#### Admin APIs
- `POST /api/v1/auth/login` - Đăng nhập admin
- `GET /api/v1/users` - Quản lý users
- `GET /api/v1/dashboard` - Dashboard data

## 🎨 Thiết Kế

Website được thiết kế theo phong cách:
- **Màu sắc chủ đạo**: Xanh lá và trắng
- **Layout**: Responsive, mobile-first
- **Typography**: Modern, dễ đọc
- **UI/UX**: Clean, professional

## 📞 Thông Tin Liên Hệ (Demo)

- **Showroom 1**: 47 Ngô Gia Tự, Long Biên, Hà Nội
- **Showroom 2**: 270 Phố Huế, Hai Bà Trưng, Hà Nội
- **Hotline**: 0984 725 199 - 0984 685 283

## 🔄 Cập Nhật Dự Án

Để cập nhật dự án từ GitHub:
```bash
cd /workspace/WebMinhha
git pull origin main

# Cập nhật backend dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Cập nhật frontend dependencies
cd ../frontend
npm install
```

## 🐛 Troubleshooting

### Backend không khởi động
```bash
cd /workspace/WebMinhha/backend
source venv/bin/activate
python --version  # Kiểm tra Python version
pip list          # Kiểm tra dependencies
```

### Frontend không khởi động
```bash
cd /workspace/WebMinhha/frontend
node --version    # Kiểm tra Node.js version
npm --version     # Kiểm tra npm version
npm install       # Cài lại dependencies
```

### Lỗi kết nối API
- Kiểm tra backend đang chạy: `curl https://work-1-yuqzjjovdhykmiht.prod-runtime.all-hands.dev/health`
- Kiểm tra file `.env` trong frontend
- Kiểm tra CORS settings trong `backend/main.py`

## 📝 Ghi Chú

- Dự án này được tạo cho mục đích thương mại
- Website bán võng xếp, rèm màn, giá phơi đồ, bàn ghế
- Dữ liệu sản phẩm có thể được cập nhật qua admin panel
- Hỗ trợ SEO và responsive design

---

**🎉 Chúc mừng! Website đã được cài đặt và chạy thành công!**

Bạn có thể truy cập website tại: https://work-2-yuqzjjovdhykmiht.prod-runtime.all-hands.dev