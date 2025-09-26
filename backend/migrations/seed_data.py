"""
Seed Data - Tạo dữ liệu mẫu cho Admin Panel
Bao gồm: Super Admin account, Roles, Permissions, Categories mẫu
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import DATABASE_URL
from models.user_models import User, Role, Permission, UserStatus
from models.product_models import Category
from models.settings_models import WebsiteSetting, ContactSetting, SeoSetting, AppearanceSetting
from passlib.context import CryptContext
from datetime import datetime

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_permissions(db_session):
    """
    Tạo các quyền cơ bản cho hệ thống
    """
    print("🔐 Đang tạo permissions...")
    
    permissions_data = [
        # User Management Permissions
        {"name": "users.create", "description": "Tạo người dùng mới", "resource": "users", "action": "create"},
        {"name": "users.read", "description": "Xem danh sách người dùng", "resource": "users", "action": "read"},
        {"name": "users.update", "description": "Cập nhật thông tin người dùng", "resource": "users", "action": "update"},
        {"name": "users.delete", "description": "Xóa người dùng", "resource": "users", "action": "delete"},
        {"name": "users.approve", "description": "Duyệt tài khoản người dùng", "resource": "users", "action": "approve"},
        
        # Product Management Permissions
        {"name": "products.create", "description": "Tạo sản phẩm mới", "resource": "products", "action": "create"},
        {"name": "products.read", "description": "Xem danh sách sản phẩm", "resource": "products", "action": "read"},
        {"name": "products.update", "description": "Cập nhật sản phẩm", "resource": "products", "action": "update"},
        {"name": "products.delete", "description": "Xóa sản phẩm", "resource": "products", "action": "delete"},
        
        # Category Management Permissions
        {"name": "categories.create", "description": "Tạo danh mục mới", "resource": "categories", "action": "create"},
        {"name": "categories.read", "description": "Xem danh sách danh mục", "resource": "categories", "action": "read"},
        {"name": "categories.update", "description": "Cập nhật danh mục", "resource": "categories", "action": "update"},
        {"name": "categories.delete", "description": "Xóa danh mục", "resource": "categories", "action": "delete"},
        
        # Settings Management Permissions
        {"name": "settings.read", "description": "Xem cài đặt website", "resource": "settings", "action": "read"},
        {"name": "settings.update", "description": "Cập nhật cài đặt website", "resource": "settings", "action": "update"},
        
        # Dashboard Permissions
        {"name": "dashboard.read", "description": "Xem dashboard", "resource": "dashboard", "action": "read"},
        
        # System Admin Permissions
        {"name": "system.admin", "description": "Quyền quản trị hệ thống", "resource": "system", "action": "admin"},
    ]
    
    created_permissions = []
    for perm_data in permissions_data:
        # Kiểm tra xem permission đã tồn tại chưa
        existing_perm = db_session.query(Permission).filter(Permission.name == perm_data["name"]).first()
        if not existing_perm:
            permission = Permission(**perm_data)
            db_session.add(permission)
            created_permissions.append(permission)
    
    db_session.commit()
    print(f"✅ Đã tạo {len(created_permissions)} permissions!")
    return created_permissions

def create_roles(db_session):
    """
    Tạo các vai trò cơ bản
    """
    print("👥 Đang tạo roles...")
    
    roles_data = [
        {
            "name": "super_admin",
            "display_name": "Super Administrator", 
            "description": "Quyền cao nhất, có thể làm mọi thứ",
            "permissions": "all"  # Sẽ gán tất cả permissions
        },
        {
            "name": "admin",
            "display_name": "Administrator",
            "description": "Quản trị viên, có thể quản lý users và products",
            "permissions": ["users.read", "users.update", "users.approve", "products.create", "products.read", "products.update", "products.delete", "categories.create", "categories.read", "categories.update", "categories.delete", "dashboard.read"]
        },
        {
            "name": "editor",
            "display_name": "Editor",
            "description": "Biên tập viên, có thể quản lý sản phẩm",
            "permissions": ["products.create", "products.read", "products.update", "categories.read", "dashboard.read"]
        },
        {
            "name": "customer",
            "display_name": "Customer",
            "description": "Khách hàng thông thường",
            "permissions": []
        }
    ]
    
    # Lấy tất cả permissions
    all_permissions = db_session.query(Permission).all()
    permission_dict = {perm.name: perm for perm in all_permissions}
    
    created_roles = []
    for role_data in roles_data:
        # Kiểm tra xem role đã tồn tại chưa
        existing_role = db_session.query(Role).filter(Role.name == role_data["name"]).first()
        if not existing_role:
            role = Role(
                name=role_data["name"],
                display_name=role_data["display_name"],
                description=role_data["description"]
            )
            
            # Gán permissions
            if role_data["permissions"] == "all":
                role.permissions = all_permissions
            else:
                role.permissions = [permission_dict[perm_name] for perm_name in role_data["permissions"] if perm_name in permission_dict]
            
            db_session.add(role)
            created_roles.append(role)
    
    db_session.commit()
    print(f"✅ Đã tạo {len(created_roles)} roles!")
    return created_roles

def create_super_admin(db_session):
    """
    Tạo tài khoản Super Admin theo yêu cầu
    Username: Hpt
    Password: HptPttn7686
    Email: Khpt1976@gmail.com
    """
    print("👑 Đang tạo Super Admin account...")
    
    # Kiểm tra xem Super Admin đã tồn tại chưa
    existing_admin = db_session.query(User).filter(User.username == "Hpt").first()
    if existing_admin:
        print("⚠️ Super Admin đã tồn tại!")
        return existing_admin
    
    # Lấy role super_admin
    super_admin_role = db_session.query(Role).filter(Role.name == "super_admin").first()
    if not super_admin_role:
        print("❌ Không tìm thấy role super_admin!")
        return None
    
    # Hash password
    hashed_password = pwd_context.hash("HptPttn7686")
    
    # Tạo Super Admin user
    super_admin = User(
        username="Hpt",
        email="Khpt1976@gmail.com",
        full_name="Super Administrator",
        hashed_password=hashed_password,
        phone="",
        status=UserStatus.ACTIVE.value,
        role_id=super_admin_role.id,
        is_super_admin=True
    )
    
    db_session.add(super_admin)
    db_session.commit()
    
    print("✅ Đã tạo Super Admin account thành công!")
    print(f"   👤 Username: Hpt")
    print(f"   🔑 Password: HptPttn7686")
    print(f"   📧 Email: Khpt1976@gmail.com")
    
    return super_admin

def create_sample_categories(db_session):
    """
    Tạo các danh mục sản phẩm mẫu
    """
    print("📂 Đang tạo sample categories...")
    
    categories_data = [
        {
            "name": "Võng Xếp",
            "slug": "vong-xep",
            "description": "Các loại võng xếp, võng du lịch, võng thư giãn",
            "image_url": "/images/categories/vong-xep.jpg",
            "is_active": True,
            "sort_order": 1
        },
        {
            "name": "Rèm - Màn",
            "slug": "rem-man", 
            "description": "Rèm cửa, màn che nắng, rèm trang trí",
            "image_url": "/images/categories/rem-man.jpg",
            "is_active": True,
            "sort_order": 2
        },
        {
            "name": "Giá Phơi Đồ",
            "slug": "gia-phoi-do",
            "description": "Giá phơi quần áo, giá treo đồ đa năng",
            "image_url": "/images/categories/gia-phoi.jpg",
            "is_active": True,
            "sort_order": 3
        },
        {
            "name": "Bàn Ghế",
            "slug": "ban-ghe",
            "description": "Bàn ghế xếp, bàn ghế du lịch, nội thất",
            "image_url": "/images/categories/ban-ghe.jpg",
            "is_active": True,
            "sort_order": 4
        },
        {
            "name": "Sản Phẩm Khác",
            "slug": "san-pham-khac",
            "description": "Các sản phẩm tiện ích khác",
            "image_url": "/images/categories/khac.jpg",
            "is_active": True,
            "sort_order": 5
        }
    ]
    
    created_categories = []
    for cat_data in categories_data:
        # Kiểm tra xem category đã tồn tại chưa
        existing_cat = db_session.query(Category).filter(Category.slug == cat_data["slug"]).first()
        if not existing_cat:
            category = Category(**cat_data)
            db_session.add(category)
            created_categories.append(category)
    
    db_session.commit()
    print(f"✅ Đã tạo {len(created_categories)} categories!")
    return created_categories

def create_website_settings(db_session):
    """
    Tạo cài đặt website mặc định
    """
    print("⚙️ Đang tạo website settings...")
    
    settings_data = [
        {"key": "site_name", "value": "Cửa Hàng Minh Hà", "label": "Tên Website", "description": "Tên website hiển thị"},
        {"key": "site_description", "value": "Chuyên cung cấp võng xếp, rèm màn, giá phơi đồ, bàn ghế chất lượng cao", "label": "Mô tả Website", "description": "Mô tả ngắn về website"},
        {"key": "site_keywords", "value": "võng xếp, rèm màn, giá phơi đồ, bàn ghế, nội thất", "label": "Từ khóa SEO", "description": "Từ khóa SEO cho website"},
        {"key": "contact_phone", "value": "0123456789", "label": "Số điện thoại", "description": "Số điện thoại liên hệ"},
        {"key": "contact_email", "value": "info@cuahangminhha.com", "label": "Email liên hệ", "description": "Email liên hệ chính"},
        {"key": "contact_address", "value": "123 Đường ABC, Quận XYZ, TP.HCM", "label": "Địa chỉ", "description": "Địa chỉ cửa hàng"},
        {"key": "facebook_url", "value": "https://facebook.com/cuahangminhha", "label": "Facebook URL", "description": "Link trang Facebook"},
        {"key": "zalo_phone", "value": "0123456789", "label": "Số Zalo", "description": "Số điện thoại Zalo"},
        {"key": "business_hours", "value": "8:00 - 18:00 (Thứ 2 - Chủ nhật)", "label": "Giờ làm việc", "description": "Thời gian hoạt động"},
    ]
    
    created_settings = []
    for setting_data in settings_data:
        # Kiểm tra xem setting đã tồn tại chưa
        existing_setting = db_session.query(WebsiteSetting).filter(WebsiteSetting.key == setting_data["key"]).first()
        if not existing_setting:
            setting = WebsiteSetting(**setting_data)
            db_session.add(setting)
            created_settings.append(setting)
    
    db_session.commit()
    print(f"✅ Đã tạo {len(created_settings)} website settings!")
    return created_settings

def run_seed_data():
    """
    Chạy tất cả các seed data
    """
    print("🌱 Bắt đầu seed data cho Admin Panel...")
    print("=" * 50)
    
    # Tạo database session
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db_session = SessionLocal()
    
    try:
        # 1. Tạo permissions
        create_permissions(db_session)
        
        # 2. Tạo roles
        create_roles(db_session)
        
        # 3. Tạo Super Admin
        create_super_admin(db_session)
        
        # 4. Tạo sample categories
        create_sample_categories(db_session)
        
        # 5. Tạo website settings
        create_website_settings(db_session)
        
        print("=" * 50)
        print("🎉 Seed data hoàn thành thành công!")
        print("\n📋 Tóm tắt:")
        print("   👑 Super Admin: Hpt / HptPttn7686")
        print("   📧 Email: Khpt1976@gmail.com")
        print("   🔐 Permissions: Đã tạo đầy đủ")
        print("   👥 Roles: Super Admin, Admin, Editor, Customer")
        print("   📂 Categories: 5 danh mục sản phẩm")
        print("   ⚙️ Settings: Cài đặt website cơ bản")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi seed data: {str(e)}")
        db_session.rollback()
        return False
        
    finally:
        db_session.close()
        engine.dispose()

if __name__ == "__main__":
    run_seed_data()