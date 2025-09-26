"""
Seed data for Admin Panel
Creates initial data including Super Admin account, roles, permissions, and sample data
"""

from sqlalchemy.orm import Session
from database import SessionLocal, create_tables
from models.user_models import User, Role, Permission, UserStatus
from models.product_models import Category, Product, ProductStatus
from models.settings_models import WebsiteSetting, ContactSetting, SettingGroup, SettingType
from models.audit_models import AuditLog
from datetime import datetime

def create_permissions(db: Session):
    """Create default permissions"""
    permissions_data = [
        # User management
        {"name": "users.create", "description": "Tạo người dùng mới", "resource": "users", "action": "create"},
        {"name": "users.read", "description": "Xem danh sách người dùng", "resource": "users", "action": "read"},
        {"name": "users.update", "description": "Cập nhật thông tin người dùng", "resource": "users", "action": "update"},
        {"name": "users.delete", "description": "Xóa người dùng", "resource": "users", "action": "delete"},
        {"name": "users.approve", "description": "Duyệt tài khoản người dùng", "resource": "users", "action": "approve"},
        
        # Product management
        {"name": "products.create", "description": "Tạo sản phẩm mới", "resource": "products", "action": "create"},
        {"name": "products.read", "description": "Xem danh sách sản phẩm", "resource": "products", "action": "read"},
        {"name": "products.update", "description": "Cập nhật sản phẩm", "resource": "products", "action": "update"},
        {"name": "products.delete", "description": "Xóa sản phẩm", "resource": "products", "action": "delete"},
        
        # Category management
        {"name": "categories.create", "description": "Tạo danh mục mới", "resource": "categories", "action": "create"},
        {"name": "categories.read", "description": "Xem danh sách danh mục", "resource": "categories", "action": "read"},
        {"name": "categories.update", "description": "Cập nhật danh mục", "resource": "categories", "action": "update"},
        {"name": "categories.delete", "description": "Xóa danh mục", "resource": "categories", "action": "delete"},
        
        # Settings management
        {"name": "settings.read", "description": "Xem cài đặt website", "resource": "settings", "action": "read"},
        {"name": "settings.update", "description": "Cập nhật cài đặt website", "resource": "settings", "action": "update"},
        
        # Dashboard and reports
        {"name": "dashboard.read", "description": "Xem dashboard", "resource": "dashboard", "action": "read"},
        {"name": "reports.read", "description": "Xem báo cáo", "resource": "reports", "action": "read"},
        {"name": "reports.export", "description": "Xuất báo cáo", "resource": "reports", "action": "export"},
        
        # Audit logs
        {"name": "audit.read", "description": "Xem nhật ký hoạt động", "resource": "audit", "action": "read"},
    ]
    
    for perm_data in permissions_data:
        permission = db.query(Permission).filter(Permission.name == perm_data["name"]).first()
        if not permission:
            permission = Permission(**perm_data)
            db.add(permission)
    
    db.commit()
    print("✅ Permissions created successfully!")

def create_roles(db: Session):
    """Create default roles"""
    roles_data = [
        {
            "name": "super_admin",
            "display_name": "Super Administrator",
            "description": "Quyền cao nhất, có thể làm tất cả",
            "is_system_role": True
        },
        {
            "name": "admin",
            "display_name": "Administrator", 
            "description": "Quản trị viên, có hầu hết các quyền",
            "is_system_role": True
        },
        {
            "name": "product_manager",
            "display_name": "Product Manager",
            "description": "Quản lý sản phẩm và danh mục",
            "is_system_role": True
        },
        {
            "name": "content_editor",
            "display_name": "Content Editor",
            "description": "Biên tập nội dung và cài đặt website",
            "is_system_role": True
        },
        {
            "name": "viewer",
            "display_name": "Viewer",
            "description": "Chỉ xem, không được chỉnh sửa",
            "is_system_role": True
        }
    ]
    
    for role_data in roles_data:
        role = db.query(Role).filter(Role.name == role_data["name"]).first()
        if not role:
            role = Role(**role_data)
            db.add(role)
    
    db.commit()
    
    # Assign permissions to roles
    assign_permissions_to_roles(db)
    print("✅ Roles created successfully!")

def assign_permissions_to_roles(db: Session):
    """Assign permissions to roles"""
    # Get all permissions
    all_permissions = db.query(Permission).all()
    
    # Super Admin gets all permissions (handled by is_super_admin flag)
    super_admin_role = db.query(Role).filter(Role.name == "super_admin").first()
    
    # Admin gets most permissions
    admin_role = db.query(Role).filter(Role.name == "admin").first()
    admin_permissions = [p for p in all_permissions if p.resource != "users" or p.action != "approve"]
    admin_role.permissions = admin_permissions
    
    # Product Manager gets product and category permissions
    product_manager_role = db.query(Role).filter(Role.name == "product_manager").first()
    product_permissions = [p for p in all_permissions if p.resource in ["products", "categories", "dashboard"]]
    product_manager_role.permissions = product_permissions
    
    # Content Editor gets settings and basic permissions
    content_editor_role = db.query(Role).filter(Role.name == "content_editor").first()
    editor_permissions = [p for p in all_permissions if p.resource in ["settings", "dashboard"] or p.action == "read"]
    content_editor_role.permissions = editor_permissions
    
    # Viewer gets only read permissions
    viewer_role = db.query(Role).filter(Role.name == "viewer").first()
    viewer_permissions = [p for p in all_permissions if p.action == "read"]
    viewer_role.permissions = viewer_permissions
    
    db.commit()

def create_super_admin(db: Session):
    """Create Super Admin account as specified in requirements"""
    # Check if super admin already exists
    super_admin = db.query(User).filter(User.username == "Hpt").first()
    if super_admin:
        print("⚠️ Super Admin account already exists!")
        return
    
    # Get super admin role
    super_admin_role = db.query(Role).filter(Role.name == "super_admin").first()
    
    # Create super admin user
    super_admin = User(
        username="Hpt",
        email="Khpt1976@gmail.com",
        full_name="Super Administrator",
        hashed_password=User.hash_password("HptPttn7686"),
        status=UserStatus.ACTIVE.value,
        role_id=super_admin_role.id,
        is_super_admin=True,
        approved_at=datetime.utcnow()
    )
    
    db.add(super_admin)
    db.commit()
    
    # Log the creation
    AuditLog.log_action(
        db,
        user_id=super_admin.id,
        action="create",
        resource="users",
        resource_id=super_admin.id,
        description="Super Admin account created during system initialization"
    )
    db.commit()
    
    print("✅ Super Admin account created successfully!")
    print(f"   Username: Hpt")
    print(f"   Password: HptPttn7686")
    print(f"   Email: Khpt1976@gmail.com")

def create_sample_categories(db: Session):
    """Create sample product categories based on website"""
    categories_data = [
        {
            "name": "Võng xếp",
            "slug": "vong-xep",
            "description": "Các loại võng xếp chất lượng cao",
            "is_featured": True,
            "sort_order": 1
        },
        {
            "name": "Rèm - Màn",
            "slug": "rem-man", 
            "description": "Rèm cửa và màn che đa dạng",
            "is_featured": True,
            "sort_order": 2
        },
        {
            "name": "Giá phơi đồ",
            "slug": "gia-phoi-do",
            "description": "Giá phơi quần áo tiện dụng",
            "is_featured": True,
            "sort_order": 3
        },
        {
            "name": "Bàn ghế",
            "slug": "ban-ghe",
            "description": "Bàn ghế gia đình và văn phòng",
            "is_featured": True,
            "sort_order": 4
        },
        {
            "name": "Giá treo",
            "slug": "gia-treo",
            "description": "Giá treo đồ đa năng",
            "is_featured": False,
            "sort_order": 5
        },
        {
            "name": "Sản phẩm khác",
            "slug": "san-pham-khac",
            "description": "Các sản phẩm gia dụng khác",
            "is_featured": False,
            "sort_order": 6
        }
    ]
    
    for cat_data in categories_data:
        category = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
        if not category:
            category = Category(**cat_data)
            db.add(category)
    
    db.commit()
    print("✅ Sample categories created successfully!")

def create_website_settings(db: Session):
    """Create default website settings"""
    settings_data = [
        # Header settings
        {
            "key": "site_title",
            "value": "Cửa hàng Minh Hà",
            "group": SettingGroup.HEADER.value,
            "type": SettingType.TEXT.value,
            "label": "Tiêu đề website",
            "description": "Tiêu đề chính của website"
        },
        {
            "key": "site_slogan",
            "value": "VÕNG - RÈM - MÀN - GIÁ PHƠI - BÀN GHẾ",
            "group": SettingGroup.HEADER.value,
            "type": SettingType.TEXT.value,
            "label": "Slogan chính",
            "description": "Slogan hiển thị trên header"
        },
        {
            "key": "site_sub_slogan",
            "value": "Chất lượng cao - Giá cả hợp lý - Bảo hành chính hãng",
            "group": SettingGroup.HEADER.value,
            "type": SettingType.TEXT.value,
            "label": "Slogan phụ",
            "description": "Slogan phụ hiển thị dưới slogan chính"
        },
        {
            "key": "header_phone",
            "value": "0123456789",
            "group": SettingGroup.HEADER.value,
            "type": SettingType.PHONE.value,
            "label": "Số điện thoại header",
            "description": "Số điện thoại hiển thị trên header"
        },
        
        # Contact settings
        {
            "key": "call_button_phone",
            "value": "0123456789",
            "group": SettingGroup.CONTACT.value,
            "type": SettingType.PHONE.value,
            "label": "Số điện thoại nút 'Gọi ngay'",
            "description": "Số điện thoại cho nút gọi nhanh"
        },
        {
            "key": "zalo_phone",
            "value": "0123456789",
            "group": SettingGroup.CONTACT.value,
            "type": SettingType.PHONE.value,
            "label": "Số điện thoại Zalo",
            "description": "Số điện thoại Zalo (có thể khác số chính)"
        },
        
        # Social media
        {
            "key": "facebook_url",
            "value": "https://facebook.com/cuahangminhha",
            "group": SettingGroup.SOCIAL.value,
            "type": SettingType.URL.value,
            "label": "Link Facebook",
            "description": "Đường dẫn trang Facebook"
        },
        
        # Footer settings
        {
            "key": "footer_copyright",
            "value": "© 2025 Cửa hàng Minh Hà. All rights reserved.",
            "group": SettingGroup.FOOTER.value,
            "type": SettingType.TEXT.value,
            "label": "Copyright footer",
            "description": "Thông tin bản quyền ở footer"
        }
    ]
    
    for setting_data in settings_data:
        setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == setting_data["key"]).first()
        if not setting:
            setting = WebsiteSetting(**setting_data)
            db.add(setting)
    
    db.commit()
    print("✅ Website settings created successfully!")

def create_contact_settings(db: Session):
    """Create default contact settings"""
    contact_setting = db.query(ContactSetting).first()
    if not contact_setting:
        contact_setting = ContactSetting(
            company_name="Cửa hàng Minh Hà",
            company_slogan="VÕNG - RÈM - MÀN - GIÁ PHƠI - BÀN GHẾ",
            company_description="Chuyên cung cấp võng xếp, rèm màn, giá phơi đồ, bàn ghế chất lượng cao với giá cả hợp lý.",
            primary_phone="0123456789",
            zalo_phone="0123456789",
            primary_email="info@cuahangminhha.com",
            street_address="123 Đường ABC, Phường XYZ",
            district="Quận 1",
            city="TP. Hồ Chí Minh",
            country="Vietnam",
            facebook_url="https://facebook.com/cuahangminhha",
            show_call_button=True,
            show_zalo_button=True,
            show_facebook_button=True,
            call_button_phone="0123456789"
        )
        db.add(contact_setting)
        db.commit()
        print("✅ Contact settings created successfully!")

def seed_all_data():
    """Run all seed functions"""
    print("🌱 Starting database seeding...")
    
    # Create tables first
    create_tables()
    
    # Get database session
    db = SessionLocal()
    
    try:
        # Create permissions and roles
        create_permissions(db)
        create_roles(db)
        
        # Create super admin account
        create_super_admin(db)
        
        # Create sample data
        create_sample_categories(db)
        create_website_settings(db)
        create_contact_settings(db)
        
        print("🎉 Database seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_all_data()