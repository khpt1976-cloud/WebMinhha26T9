# Admin Panel - Cửa Hàng Minh Hà

## 📋 Mô tả
Admin Panel cho website Cửa Hàng Minh Hà - Hệ thống quản trị toàn diện cho việc quản lý sản phẩm, người dùng và cài đặt website.

## 🚀 Cài đặt và Chạy

### Yêu cầu hệ thống
- Node.js >= 16.x
- npm >= 8.x
- Backend API đang chạy trên port 12000

### Cài đặt dependencies
```bash
npm install
```

### Chạy development server
```bash
npm start
```
Admin panel sẽ chạy trên: http://localhost:12002

### Build production
```bash
npm run build
```

## 🏗️ Cấu trúc thư mục
```
Admin/
├── public/
│   └── index.html
├── src/
│   ├── components/     # Các component tái sử dụng
│   ├── pages/         # Các trang chính
│   │   ├── Dashboard.tsx
│   │   └── Login.tsx
│   ├── services/      # API services
│   │   └── api.ts
│   ├── types/         # TypeScript types
│   │   └── index.ts
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   └── index.css
├── package.json
├── tsconfig.json
└── .env
```

## 🔐 Tài khoản Super Admin
- **Username:** `Hpt`
- **Password:** `HptPttn7686`
- **Email:** `Khpt1976@gmail.com`

## 🌐 Cấu hình môi trường

### Development
- Port: 12002
- API URL: http://localhost:12000
- Proxy: Tự động proxy API requests đến backend

### Production
- Có thể chạy trên subdomain: admin.cuahangminhha.com
- API URL: Cấu hình qua biến môi trường

## 📊 Tính năng chính

### ✅ Đã hoàn thành (Bước 4-6)
- [x] Cấu trúc thư mục Admin riêng biệt
- [x] React TypeScript setup
- [x] React Router configuration
- [x] API service với axios
- [x] Professional layout system
- [x] Header component với notifications, user menu, search
- [x] Sidebar component với navigation đa cấp
- [x] Main layout responsive hoàn chỉnh
- [x] Login page template
- [x] Dashboard page với stats cards, tables
- [x] TypeScript types definition
- [x] Environment configuration
- [x] Subdomain ready configuration
- [x] Mobile-first responsive design
- [x] Professional theme với gradients
- [x] CSS utilities và component system
- [x] **User management system hoàn chỉnh**
- [x] **User CRUD với search, filter, pagination**
- [x] **User approval system cho tài khoản chờ duyệt**
- [x] **Role management và permission system**
- [x] **UserModal component với view/edit modes**
- [x] **UserService API integration**
- [x] **Bulk operations và form validation**

### ⏳ Sẽ triển khai tiếp (Bước 7+)
- [ ] Authentication system (JWT)
- [ ] Product management (CRUD, categories)
- [ ] Image upload system
- [ ] CKEditor 5 integration
- [ ] Website settings management
- [ ] Dashboard statistics với API
- [ ] Order management system

## 🔧 Cấu hình kỹ thuật

### Dependencies chính
- React 19.1.1
- TypeScript 4.9.5
- React Router DOM 6.30.1
- Axios 1.12.2
- React Scripts 5.0.1

### API Integration
- Base URL: Tự động detect development/production
- Authentication: JWT Bearer token
- Auto-redirect khi unauthorized
- Request/Response interceptors

### Responsive Design
- Mobile-first approach
- Flexible grid layout
- Professional admin theme

## 📝 Ghi chú phát triển

### Bước tiếp theo (Bước 7)
Sau khi hoàn thành Bước 6, sẽ tiến hành:
1. Xây dựng chức năng quản lý sản phẩm
2. Tạo Product CRUD operations
3. Category management system
4. Image upload và CKEditor integration

### Cấu hình Subdomain
Admin panel đã được cấu hình sẵn để có thể chạy trên subdomain `admin.cuahangminhha.com` khi deploy production.

---

**📅 Hoàn thành:** 24/09/2025  
**👨‍💻 Phát triển bởi:** OpenHands AI Assistant  
**🎯 Trạng thái:** Bước 6 hoàn thành - User Management System hoàn chỉnh, sẵn sàng cho Bước 7