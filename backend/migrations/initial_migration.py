"""
Initial Migration - Create all tables for Admin Panel
Tạo tất cả các bảng cần thiết cho hệ thống Admin Panel
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from database import Base, DATABASE_URL
from models.user_models import User, Role, Permission, role_permissions
from models.product_models import Product, Category, ProductImage
from models.settings_models import WebsiteSetting, ContactSetting, SeoSetting, AppearanceSetting
from models.audit_models import AuditLog

def create_all_tables():
    """
    Tạo tất cả các bảng trong database
    """
    print("🔄 Đang tạo database tables...")
    
    # Tạo engine
    engine = create_engine(DATABASE_URL)
    
    try:
        # Tạo tất cả các bảng
        Base.metadata.create_all(bind=engine)
        print("✅ Đã tạo thành công tất cả các bảng!")
        
        # In danh sách các bảng đã tạo
        print("\n📋 Các bảng đã được tạo:")
        for table_name in Base.metadata.tables.keys():
            print(f"   - {table_name}")
            
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi tạo bảng: {str(e)}")
        return False
    
    finally:
        engine.dispose()

def drop_all_tables():
    """
    Xóa tất cả các bảng (dùng để reset database)
    """
    print("🗑️ Đang xóa tất cả các bảng...")
    
    engine = create_engine(DATABASE_URL)
    
    try:
        Base.metadata.drop_all(bind=engine)
        print("✅ Đã xóa thành công tất cả các bảng!")
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi xóa bảng: {str(e)}")
        return False
    
    finally:
        engine.dispose()

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Database Migration Script')
    parser.add_argument('--action', choices=['create', 'drop', 'reset'], 
                       default='create', help='Action to perform')
    
    args = parser.parse_args()
    
    if args.action == 'create':
        create_all_tables()
    elif args.action == 'drop':
        drop_all_tables()
    elif args.action == 'reset':
        print("🔄 Đang reset database...")
        drop_all_tables()
        create_all_tables()
        print("✅ Database đã được reset thành công!")