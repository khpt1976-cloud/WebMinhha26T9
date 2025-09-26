# Database Setup Guide - Admin Panel WebMinhha

## 📋 Tổng quan

Hướng dẫn này giúp bạn thiết lập và quản lý database cho hệ thống Admin Panel của WebMinhha.

## 🚀 Khởi tạo Database

### 1. Khởi tạo lần đầu
```bash
cd backend
source venv/bin/activate
python init_database.py
```

### 2. Reset và tạo lại database
```bash
python init_database.py --reset
```

### 3. Kiểm tra trạng thái database
```bash
python init_database.py --check
```

## 🏗️ Cấu trúc Database

### Các bảng chính:
- **users**: Quản lý tài khoản người dùng
- **roles**: Vai trò người dùng (Super Admin, Admin, Editor, Customer)
- **permissions**: Quyền hạn chi tiết
- **role_permissions**: Liên kết vai trò và quyền
- **categories**: Danh mục sản phẩm
- **products**: Sản phẩm
- **product_images**: Hình ảnh sản phẩm
- **website_settings**: Cài đặt website
- **contact_settings**: Thông tin liên hệ
- **seo_settings**: Cài đặt SEO
- **appearance_settings**: Cài đặt giao diện
- **audit_logs**: Nhật ký hoạt động
- **system_logs**: Nhật ký hệ thống
- **login_attempts**: Lịch sử đăng nhập
- **data_exports**: Xuất dữ liệu

## 👑 Tài khoản Super Admin

Sau khi khởi tạo database, bạn sẽ có tài khoản Super Admin:

- **Username**: `Hpt`
- **Password**: `HptPttn7686`
- **Email**: `Khpt1976@gmail.com`
- **Quyền**: Toàn quyền quản trị hệ thống

## 🔐 Hệ thống Phân quyền

### Vai trò (Roles):
1. **Super Admin**: Toàn quyền
2. **Admin**: Quản lý users và products
3. **Editor**: Quản lý sản phẩm
4. **Customer**: Khách hàng thông thường

### Quyền hạn (Permissions):
- **users.***: Quản lý người dùng
- **products.***: Quản lý sản phẩm
- **categories.***: Quản lý danh mục
- **settings.***: Quản lý cài đặt
- **dashboard.read**: Xem dashboard
- **system.admin**: Quản trị hệ thống

## 📂 Danh mục sản phẩm mẫu

Database được tạo với 5 danh mục sản phẩm:
1. **Võng Xếp** - Các loại võng xếp, võng du lịch
2. **Rèm - Màn** - Rèm cửa, màn che nắng
3. **Giá Phơi Đồ** - Giá phơi quần áo đa năng
4. **Bàn Ghế** - Bàn ghế xếp, nội thất
5. **Sản Phẩm Khác** - Các sản phẩm tiện ích khác

## ⚙️ Cài đặt Website mặc định

- **site_name**: Cửa Hàng Minh Hà
- **site_description**: Chuyên cung cấp võng xếp, rèm màn, giá phơi đồ, bàn ghế chất lượng cao
- **contact_phone**: 0123456789
- **contact_email**: info@cuahangminhha.com
- **contact_address**: 123 Đường ABC, Quận XYZ, TP.HCM
- **facebook_url**: https://facebook.com/cuahangminhha
- **zalo_phone**: 0123456789
- **business_hours**: 8:00 - 18:00 (Thứ 2 - Chủ nhật)

## 🔧 Scripts Migration

### 1. Initial Migration (`migrations/initial_migration.py`)
- Tạo tất cả các bảng cần thiết
- Hỗ trợ tạo và xóa bảng

### 2. Seed Data (`migrations/seed_data.py`)
- Tạo permissions và roles
- Tạo tài khoản Super Admin
- Tạo danh mục sản phẩm mẫu
- Tạo cài đặt website cơ bản

## 📝 Lưu ý quan trọng

1. **Backup**: Luôn backup database trước khi chạy migration
2. **Environment**: Đảm bảo virtual environment được kích hoạt
3. **Dependencies**: Cài đặt đầy đủ dependencies trong requirements.txt
4. **Permissions**: Kiểm tra quyền ghi file database
5. **Configuration**: Kiểm tra DATABASE_URL trong file database.py

## 🚨 Troubleshooting

### Lỗi thường gặp:

1. **Import Error**: Kiểm tra PYTHONPATH và cấu trúc thư mục
2. **Database Lock**: Đóng tất cả kết nối database trước khi reset
3. **Permission Denied**: Kiểm tra quyền ghi thư mục database
4. **Module Not Found**: Cài đặt lại dependencies

### Giải pháp:
```bash
# Cài đặt lại dependencies
pip install -r requirements.txt

# Kiểm tra cấu trúc database
python init_database.py --check

# Reset hoàn toàn
python init_database.py --reset
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs trong terminal
2. Xem file DATABASE_SETUP.md này
3. Liên hệ team phát triển

---

**Phiên bản**: 1.0  
**Cập nhật**: 2024-12-19  
**Tác giả**: Admin Panel Development Team