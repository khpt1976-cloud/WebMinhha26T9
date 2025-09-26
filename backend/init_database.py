"""
Database Initialization Script for Admin Panel
Script khởi tạo database cho hệ thống Admin Panel

Chạy script này để:
1. Tạo tất cả các bảng cần thiết
2. Seed data với Super Admin account
3. Tạo dữ liệu mẫu cơ bản

Usage:
    python init_database.py
    python init_database.py --reset  # Reset và tạo lại database
"""

import sys
import os
import argparse

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from migrations.initial_migration import create_all_tables, drop_all_tables
from migrations.seed_data import run_seed_data

def init_database(reset=False):
    """
    Khởi tạo database hoàn chỉnh
    """
    print("🚀 KHỞI TẠO DATABASE ADMIN PANEL")
    print("=" * 60)
    
    if reset:
        print("🔄 Reset mode: Sẽ xóa và tạo lại database...")
        if not drop_all_tables():
            print("❌ Không thể xóa database!")
            return False
    
    # 1. Tạo tất cả các bảng
    print("\n📋 BƯỚC 1: Tạo database tables...")
    if not create_all_tables():
        print("❌ Không thể tạo database tables!")
        return False
    
    # 2. Seed data
    print("\n🌱 BƯỚC 2: Seed data...")
    if not run_seed_data():
        print("❌ Không thể seed data!")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 KHỞI TẠO DATABASE THÀNH CÔNG!")
    print("\n📊 Database đã sẵn sàng với:")
    print("   ✅ Tất cả các bảng cần thiết")
    print("   ✅ Super Admin account: Hpt / HptPttn7686")
    print("   ✅ Roles và Permissions đầy đủ")
    print("   ✅ Categories sản phẩm mẫu")
    print("   ✅ Website settings cơ bản")
    
    print("\n🔗 Bạn có thể:")
    print("   1. Đăng nhập Admin Panel với tài khoản Super Admin")
    print("   2. Bắt đầu thêm sản phẩm và quản lý website")
    print("   3. Tạo thêm tài khoản admin khác")
    
    return True

def check_database_status():
    """
    Kiểm tra trạng thái database
    """
    print("🔍 KIỂM TRA TRẠNG THÁI DATABASE")
    print("=" * 40)
    
    try:
        from sqlalchemy import create_engine, text
        from database import DATABASE_URL
        
        engine = create_engine(DATABASE_URL)
        
        # Kiểm tra kết nối
        with engine.connect() as conn:
            # Kiểm tra các bảng chính
            tables_to_check = ['users', 'roles', 'permissions', 'categories', 'website_settings']
            
            for table in tables_to_check:
                try:
                    result = conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = result.scalar()
                    print(f"   ✅ {table}: {count} records")
                except Exception as e:
                    print(f"   ❌ {table}: Không tồn tại hoặc lỗi")
            
            # Kiểm tra Super Admin
            try:
                result = conn.execute(text("SELECT username FROM users WHERE username = 'Hpt'"))
                admin = result.fetchone()
                if admin:
                    print(f"   👑 Super Admin: Đã tồn tại")
                else:
                    print(f"   ⚠️ Super Admin: Chưa tồn tại")
            except:
                print(f"   ❌ Không thể kiểm tra Super Admin")
        
        engine.dispose()
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi kiểm tra database: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Database Initialization for Admin Panel')
    parser.add_argument('--reset', action='store_true', 
                       help='Reset database (drop all tables and recreate)')
    parser.add_argument('--check', action='store_true',
                       help='Check database status')
    
    args = parser.parse_args()
    
    if args.check:
        check_database_status()
    else:
        init_database(reset=args.reset)

if __name__ == "__main__":
    main()