# 🎉 CÀI ĐẶT HOÀN TẤT - WEBSITE MINH HÀ

## ✅ Trạng Thái Cài Đặt

Tất cả các thành phần của website đã được cài đặt và cấu hình thành công:

- ✅ **Backend API** (FastAPI + Python)
- ✅ **Frontend Website** (React + TypeScript)  
- ✅ **Admin Panel** (React + TypeScript)
- ✅ **Database** (SQLite với dữ liệu mẫu)
- ✅ **Dependencies** (Python packages + Node modules)

## 🔗 Đường Dẫn Truy Cập

### 🌐 Website Chính (Frontend)
- **URL**: https://work-2-wicjglkwtqupxpkd.prod-runtime.all-hands.dev
- **Port**: 12001
- **Mô tả**: Website bán hàng cho khách hàng

### 👑 Admin Panel
- **URL**: http://localhost:3000
- **Port**: 3000
- **Username**: `Hpt`
- **Password**: `HptPttn7686`
- **Mô tả**: Panel quản trị cho admin

### 🔧 Backend API
- **URL**: https://work-1-wicjglkwtqupxpkd.prod-runtime.all-hands.dev
- **Port**: 12000
- **API Docs**: https://work-1-wicjglkwtqupxpkd.prod-runtime.all-hands.dev/docs
- **Mô tả**: REST API server

## 🚀 Cách Sử Dụng

### Khởi Động Tất Cả Service
```bash
cd /workspace/WebMinhha
./start_all.sh
```

### Dừng Tất Cả Service
```bash
cd /workspace/WebMinhha
./stop_all.sh
```

### Khởi Động Từng Service Riêng Lẻ

#### Backend API
```bash
cd backend
source venv/bin/activate
python main.py
```

#### Frontend Website
```bash
cd frontend
npm start
```

#### Admin Panel
```bash
cd Admin
npm start
```

## 📊 Thông Tin Database

- **Type**: SQLite
- **File**: `backend/admin_panel.db`
- **Super Admin**: 
  - Username: `Hpt`
  - Password: `HptPttn7686`
  - Email: `Khpt1976@gmail.com`

### Khởi Tạo Lại Database
```bash
cd backend
source venv/bin/activate
python init_database.py --reset
```

## 📁 Cấu Trúc Dự Án

```
WebMinhha/
├── backend/                 # FastAPI Backend
│   ├── venv/               # Python virtual environment
│   ├── main.py             # API server entry point
│   ├── database.py         # Database configuration
│   ├── init_database.py    # Database initialization
│   ├── requirements.txt    # Python dependencies
│   ├── api/                # API routes
│   ├── models/             # Database models
│   ├── schemas/            # Pydantic schemas
│   └── migrations/         # Database migrations
├── frontend/               # React Frontend
│   ├── src/                # Source code
│   ├── public/             # Static files
│   ├── package.json        # Node dependencies
│   └── .env                # Environment variables
├── Admin/                  # Admin Panel
│   ├── src/                # Source code
│   ├── public/             # Static files
│   ├── package.json        # Node dependencies
│   └── .env                # Environment variables
├── start_all.sh            # Script khởi động tất cả
├── stop_all.sh             # Script dừng tất cả
└── logs/                   # Log files
```

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **SQLite** - Database

### Frontend & Admin
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Styled Components** - CSS-in-JS
- **Axios** - HTTP client
- **React Router** - Routing

## 📝 Logs

Tất cả logs được lưu trong thư mục `logs/`:
- `backend.log` - Backend API logs
- `frontend.log` - Frontend development server logs
- `admin.log` - Admin panel development server logs

## 🔧 Troubleshooting

### Port đã được sử dụng
```bash
# Kiểm tra port đang sử dụng
lsof -i :12000
lsof -i :12001
lsof -i :3000

# Dừng process trên port
kill -9 $(lsof -ti:12000)
```

### Cài đặt lại dependencies
```bash
# Backend
cd backend
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Admin
cd Admin
rm -rf node_modules package-lock.json
npm install
```

### Reset Database
```bash
cd backend
source venv/bin/activate
python init_database.py --reset
```

## 📞 Thông Tin Liên Hệ (Demo)

- **Showroom 1**: 47 Ngô Gia Tự, Long Biên, Hà Nội
- **Showroom 2**: 270 Phố Huế, Hai Bà Trưng, Hà Nội  
- **Hotline**: 0984 725 199 - 0984 685 283

## 🎯 Tính Năng Chính

### Website Frontend
- Hiển thị danh mục sản phẩm
- Tìm kiếm sản phẩm
- Chi tiết sản phẩm
- Responsive design
- SEO optimized

### Admin Panel
- Quản lý sản phẩm
- Quản lý danh mục
- Quản lý người dùng
- Cài đặt website
- Dashboard thống kê

### Backend API
- RESTful API
- Authentication & Authorization
- File upload
- Database management
- API documentation

---

**🎉 Website đã sẵn sàng sử dụng!**

Được cài đặt bởi OpenHands AI Assistant vào ngày $(date)