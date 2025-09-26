# 🗄️ **DATABASE SCHEMA - ADMIN PANEL**

## 📊 **Tổng quan Database Schema**

Database được thiết kế để hỗ trợ đầy đủ các chức năng của Admin Panel với 4 module chính:

### **🔐 1. User Management Module**
- **users** - Thông tin người dùng
- **roles** - Vai trò người dùng  
- **permissions** - Quyền hạn chi tiết
- **role_permissions** - Liên kết role và permission

### **🛍️ 2. Product Management Module**
- **categories** - Danh mục sản phẩm
- **products** - Sản phẩm
- **product_images** - Ảnh sản phẩm

### **⚙️ 3. Settings Management Module**
- **website_settings** - Cài đặt website linh hoạt
- **contact_settings** - Thông tin liên hệ
- **seo_settings** - Cài đặt SEO
- **appearance_settings** - Giao diện và theme

### **📊 4. Audit & Logging Module**
- **audit_logs** - Nhật ký hoạt động
- **system_logs** - Log hệ thống
- **login_attempts** - Lịch sử đăng nhập
- **data_exports** - Theo dõi xuất dữ liệu

---

## 🔐 **USER MANAGEMENT TABLES**

### **👤 users**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    hashed_password VARCHAR(255) NOT NULL,
    
    -- Status and permissions
    status VARCHAR(20) DEFAULT 'pending',  -- pending, active, suspended, banned
    role_id INTEGER REFERENCES roles(id),
    is_super_admin BOOLEAN DEFAULT FALSE,
    
    -- Profile
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    
    -- Authentication
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- Password reset
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by INTEGER REFERENCES users(id)
);
```

### **🎭 roles**
```sql
CREATE TABLE roles (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
```

### **🔑 permissions**
```sql
CREATE TABLE permissions (
    id INTEGER PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL,  -- users, products, categories, settings
    action VARCHAR(50) NOT NULL,    -- create, read, update, delete, approve
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **🔗 role_permissions** (Many-to-Many)
```sql
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id),
    permission_id INTEGER REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);
```

---

## 🛍️ **PRODUCT MANAGEMENT TABLES**

### **📂 categories**
```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    
    -- Hierarchy
    parent_id INTEGER REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    
    -- Display
    image_url VARCHAR(500),
    icon_class VARCHAR(100),
    color VARCHAR(7),  -- Hex color
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);
```

### **🛒 products**
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    sku VARCHAR(100) UNIQUE,
    category_id INTEGER REFERENCES categories(id),
    
    -- Pricing
    original_price DECIMAL(12,2) NOT NULL,
    sale_price DECIMAL(12,2),
    cost_price DECIMAL(12,2),
    
    -- Content
    short_description TEXT,
    description TEXT,  -- Rich text from CKEditor
    specifications JSON,
    
    -- Inventory
    stock_quantity INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 0,
    max_stock_level INTEGER,
    
    -- Attributes
    weight DECIMAL(8,2),
    dimensions JSON,  -- {length, width, height}
    color VARCHAR(50),
    material VARCHAR(100),
    brand VARCHAR(100),
    
    -- Status and flags
    status VARCHAR(20) DEFAULT 'draft',  -- draft, active, inactive, out_of_stock
    is_featured BOOLEAN DEFAULT FALSE,
    is_hot BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords VARCHAR(500),
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    purchase_count INTEGER DEFAULT 0,
    rating_average DECIMAL(3,2) DEFAULT 0.0,
    rating_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    published_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);
```

### **🖼️ product_images**
```sql
CREATE TABLE product_images (
    id INTEGER PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    
    -- Image details
    image_type VARCHAR(20) DEFAULT 'gallery',  -- main, thumbnail, gallery
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    
    -- Metadata
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    mime_type VARCHAR(100),
    
    -- Display
    alt_text VARCHAR(255),
    title VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER REFERENCES users(id)
);
```

---

## ⚙️ **SETTINGS MANAGEMENT TABLES**

### **🔧 website_settings**
```sql
CREATE TABLE website_settings (
    id INTEGER PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    default_value TEXT,
    
    -- Metadata
    group VARCHAR(50) DEFAULT 'general',  -- general, header, footer, contact, social, seo
    type VARCHAR(20) DEFAULT 'text',      -- text, textarea, html, image, url, email, phone, boolean, json, color
    label VARCHAR(255) NOT NULL,
    description TEXT,
    placeholder VARCHAR(255),
    
    -- Validation
    is_required BOOLEAN DEFAULT FALSE,
    validation_rules JSON,
    options JSON,
    
    -- Display
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);
```

### **📞 contact_settings**
```sql
CREATE TABLE contact_settings (
    id INTEGER PRIMARY KEY,
    
    -- Company info
    company_name VARCHAR(255),
    company_slogan VARCHAR(500),
    company_description TEXT,
    
    -- Contact details
    primary_phone VARCHAR(20),
    secondary_phone VARCHAR(20),
    whatsapp_phone VARCHAR(20),
    zalo_phone VARCHAR(20),
    
    -- Email
    primary_email VARCHAR(255),
    support_email VARCHAR(255),
    sales_email VARCHAR(255),
    
    -- Address
    street_address VARCHAR(500),
    ward VARCHAR(100),
    district VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'Vietnam',
    
    -- Business hours
    business_hours JSON,
    timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
    
    -- Social media
    facebook_url VARCHAR(500),
    zalo_url VARCHAR(500),
    instagram_url VARCHAR(500),
    youtube_url VARCHAR(500),
    tiktok_url VARCHAR(500),
    
    -- Maps
    google_maps_url VARCHAR(1000),
    latitude VARCHAR(50),
    longitude VARCHAR(50),
    
    -- Quick contact buttons
    show_call_button BOOLEAN DEFAULT TRUE,
    show_zalo_button BOOLEAN DEFAULT TRUE,
    show_facebook_button BOOLEAN DEFAULT TRUE,
    call_button_phone VARCHAR(20),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    updated_by INTEGER REFERENCES users(id)
);
```

---

## 📊 **AUDIT & LOGGING TABLES**

### **📝 audit_logs**
```sql
CREATE TABLE audit_logs (
    id INTEGER PRIMARY KEY,
    
    -- Who
    user_id INTEGER REFERENCES users(id),
    username VARCHAR(50),
    user_ip VARCHAR(45),
    user_agent VARCHAR(500),
    
    -- What
    action VARCHAR(50) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(50),
    
    -- Details
    description TEXT,
    old_values JSON,
    new_values JSON,
    
    -- Request details
    method VARCHAR(10),
    endpoint VARCHAR(255),
    request_data JSON,
    response_status INTEGER,
    
    -- Categorization
    level VARCHAR(20) DEFAULT 'info',
    category VARCHAR(50),
    tags JSON,
    
    -- Result
    success VARCHAR(10),
    error_message TEXT,
    
    -- Timing
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duration_ms INTEGER,
    session_id VARCHAR(255)
);
```

---

## 🎯 **DEFAULT DATA**

### **🔐 Super Admin Account**
```sql
-- Username: Hpt
-- Password: HptPttn7686  
-- Email: Khpt1976@gmail.com
-- Role: Super Administrator
-- Status: Active
```

### **🎭 Default Roles**
- **Super Administrator** - Quyền cao nhất
- **Administrator** - Quản trị viên
- **Product Manager** - Quản lý sản phẩm
- **Content Editor** - Biên tập nội dung
- **Viewer** - Chỉ xem

### **📂 Default Categories**
- Võng xếp
- Rèm - Màn
- Giá phơi đồ
- Bàn ghế
- Giá treo
- Sản phẩm khác

### **⚙️ Default Settings**
- Site title, slogan
- Contact information
- Social media links
- Header/Footer content

---

## 🔧 **Database Operations**

### **Tạo Database:**
```bash
cd backend
python database.py
```

### **Seed Data:**
```bash
cd backend  
python seed_data.py
```

### **Reset Database:**
```python
from database import reset_database
reset_database()
```

---

## 📈 **Performance Considerations**

### **Indexes:**
- Primary keys (auto-indexed)
- Foreign keys (indexed)
- Username, email (unique indexes)
- Slug fields (unique indexes)
- Status fields (indexed for filtering)
- Created_at (indexed for sorting)

### **Relationships:**
- One-to-Many: User → Products, Category → Products
- Many-to-Many: Role ↔ Permissions
- Self-referencing: Category → Parent Category

### **JSON Fields:**
- Product specifications
- Website settings validation rules
- Audit log data
- Business hours configuration

---

**📅 Schema Version:** 1.0  
**🔄 Last Updated:** 24/09/2025  
**👨‍💻 Created by:** OpenHands AI Assistant