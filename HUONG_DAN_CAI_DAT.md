# 🚀 Hướng Dẫn Cài Đặt và Chạy Website Everon Clone

## 📋 Tổng Quan
Website bán chăn ga gối đệm Everon được tạo theo mẫu từ https://everonvn.com.vn/

## 🏗️ Cấu Trúc Dự Án
```
DuAnPttn/
├── frontend/          # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── assets/        # Hình ảnh và icons
│   │   └── styles/        # CSS styles
│   └── package.json
├── backend/           # Python FastAPI backend
│   ├── main.py           # API server
│   ├── requirements.txt  # Python dependencies
│   └── venv/            # Virtual environment
├── start_project.sh   # Script khởi động tự động
├── stop_project.sh    # Script dừng dự án
└── README.md
```

## ✅ Yêu Cầu Hệ Thống
- **Python 3.8+**
- **Node.js 18+**
- **npm hoặc yarn**

## 🔧 Cài Đặt

### Bước 1: Clone dự án
```bash
git clone https://github.com/khpt1976-cloud/DuAnPttn.git
cd DuAnPttn
```

### Bước 2: Cài đặt Backend (Python)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# hoặc venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### Bước 3: Cài đặt Frontend (Node.js)
```bash
cd ../frontend
npm install
```

## 🚀 Chạy Dự Án

### Phương pháp 1: Sử dụng script tự động (Khuyến nghị)
```bash
cd DuAnPttn
./start_project.sh
```

### Phương pháp 2: Chạy thủ công

#### Terminal 1 - Backend:
```bash
cd DuAnPttn/backend
source venv/bin/activate
python main.py
```

#### Terminal 2 - Frontend:
```bash
cd DuAnPttn/frontend
npm start
```

## 🌐 Truy Cập Website

Sau khi khởi động thành công:

- **Frontend**: https://work-2-fewblihqnnirrlef.prod-runtime.all-hands.dev
- **Backend API**: https://work-1-fewblihqnnirrlef.prod-runtime.all-hands.dev
- **API Documentation**: https://work-1-fewblihqnnirrlef.prod-runtime.all-hands.dev/docs

## 🛑 Dừng Dự Án
```bash
./stop_project.sh
```

## 📊 Xem Logs
```bash
# Backend logs
tail -f backend/backend.log

# Frontend logs
tail -f frontend/frontend.log
```

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- **React 18** với TypeScript
- **Styled Components** cho styling
- **Axios** cho API calls
- **React Icons** cho icons

### Backend
- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation

## 📱 Tính Năng

### ✅ Đã Hoàn Thành
- [x] Header với logo và navigation
- [x] Hero section với search
- [x] Product grid hiển thị danh mục sản phẩm
- [x] Product cards với hình ảnh và rating
- [x] Footer với thông tin liên hệ
- [x] Responsive design cho mobile
- [x] Backend API với FastAPI
- [x] Kết nối frontend-backend

### 🔄 API Endpoints

- `GET /api/products` - Lấy tất cả sản phẩm
- `GET /api/products/{id}` - Lấy sản phẩm theo ID
- `GET /api/categories` - Lấy tất cả danh mục
- `GET /api/categories/{slug}` - Lấy danh mục theo slug
- `GET /api/search?q={query}` - Tìm kiếm sản phẩm

## 🎨 Thiết Kế

Website được thiết kế theo mẫu của everonvn.com.vn với:
- Màu sắc chủ đạo: Xanh dương và đỏ
- Layout responsive
- Typography hiện đại
- Hiệu ứng hover và transition

## 🐛 Troubleshooting

### Lỗi Backend không khởi động
```bash
# Kiểm tra Python version
python --version

# Kiểm tra virtual environment
source backend/venv/bin/activate
pip list
```

### Lỗi Frontend không khởi động
```bash
# Kiểm tra Node.js version
node --version
npm --version

# Cài đặt lại dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Lỗi kết nối API
- Kiểm tra backend đang chạy trên port 12000
- Kiểm tra file `.env` trong thư mục frontend
- Kiểm tra CORS settings trong `backend/main.py`

## 📞 Thông Tin Liên Hệ (Demo)

- **Showroom 1**: 47 Ngô Gia Tự, Long Biên, Hà Nội
- **Showroom 2**: 270 Phố Huế, Hai Bà Trưng, Hà Nội
- **Hotline**: 0984 725 199 - 0984 685 283

## 📝 Ghi Chú

- Dự án này được tạo cho mục đích học tập và demo
- Hình ảnh được lấy từ website gốc everonvn.com.vn
- Dữ liệu sản phẩm là dữ liệu mẫu

## 🔄 Cập Nhật

Để cập nhật dự án:
```bash
git pull origin main
cd backend && pip install -r requirements.txt
cd ../frontend && npm install
```

---

**Chúc bạn sử dụng thành công! 🎉**