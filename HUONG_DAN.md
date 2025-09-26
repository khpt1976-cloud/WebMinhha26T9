# 🛍️ Everon Website - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan
Dự án DuAnPttn là một website bán hàng clone của Everon với:
- **Frontend**: React 19 + TypeScript
- **Backend**: FastAPI + Python
- **Database**: JSON data (có thể mở rộng với PostgreSQL/MySQL)

## 🚀 Khởi Động Nhanh

### Cách 1: Sử dụng script tự động
```bash
cd /workspace/DuAnPttn
./run.sh
```

### Cách 2: Khởi động thủ công

#### Backend (API):
```bash
cd /workspace/DuAnPttn/backend
source venv/bin/activate
python main.py
```

#### Frontend (Website):
```bash
cd /workspace/DuAnPttn/frontend
npm start
```

## 🔗 Truy Cập Website

- **🌐 Website chính**: https://work-2-pvbqbmqnoiprzkcy.prod-runtime.all-hands.dev
- **📡 API Backend**: https://work-1-pvbqbmqnoiprzkcy.prod-runtime.all-hands.dev
- **📚 API Documentation**: https://work-1-pvbqbmqnoiprzkcy.prod-runtime.all-hands.dev/docs

## 🛑 Dừng Website
```bash
cd /workspace/DuAnPttn
./stop.sh
```

## 📁 Cấu Trúc Dự Án

```
DuAnPttn/
├── backend/                 # FastAPI Backend
│   ├── main.py             # Entry point
│   ├── data/               # JSON data files
│   ├── venv/               # Python virtual environment
│   └── requirements.txt    # Python dependencies
├── frontend/               # React Frontend
│   ├── src/                # Source code
│   ├── public/             # Static files
│   ├── package.json        # Node.js dependencies
│   └── .env                # Environment variables
├── run.sh                  # Script khởi động
├── stop.sh                 # Script dừng
└── HUONG_DAN.md           # File này
```

## 🔧 Cấu Hình

### Backend (Port 12000)
- API endpoint: `/api/products`, `/api/categories`, `/api/search`
- CORS được cấu hình cho runtime URLs
- Uvicorn server với host `0.0.0.0`

### Frontend (Port 12001)
- React development server
- API URL được cấu hình qua biến môi trường
- TypeScript support

## 📝 Logs

Xem logs realtime:
```bash
# Backend logs
tail -f /workspace/DuAnPttn/backend/backend.log

# Frontend logs  
tail -f /workspace/DuAnPttn/frontend/frontend.log
```

## 🛠️ Development

### Thêm sản phẩm mới:
Chỉnh sửa file `/workspace/DuAnPttn/backend/data/products.json`

### Thêm danh mục mới:
Chỉnh sửa file `/workspace/DuAnPttn/backend/data/categories.json`

### Thay đổi giao diện:
Chỉnh sửa các file trong `/workspace/DuAnPttn/frontend/src/components/`

## 🐛 Troubleshooting

### Lỗi port đã được sử dụng:
```bash
./stop.sh
./run.sh
```

### Lỗi dependencies:
```bash
# Backend
cd backend && pip install -r requirements.txt

# Frontend  
cd frontend && npm install
```

### Lỗi CORS:
Kiểm tra cấu hình CORS trong `backend/main.py`

## 📞 Hỗ Trợ

Nếu gặp vấn đề, hãy kiểm tra:
1. Logs của backend và frontend
2. Network connectivity
3. Port conflicts
4. Dependencies installation

---
*Dự án được tạo bởi OpenHands AI Assistant* 🤖