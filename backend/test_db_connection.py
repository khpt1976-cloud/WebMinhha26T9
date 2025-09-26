"""
Test Database Connection for Admin Panel
Script kiểm tra kết nối database và các chức năng cơ bản
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from database import DATABASE_URL, get_db
from models.user_models import User, Role, Permission
from models.product_models import Category, Product
from models.settings_models import WebsiteSetting

def test_database_connection():
    """
    Test basic database connection
    """
    print("🔌 Testing database connection...")
    
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            if result.scalar() == 1:
                print("✅ Database connection successful!")
                return True
            else:
                print("❌ Database connection failed!")
                return False
    except Exception as e:
        print(f"❌ Database connection error: {str(e)}")
        return False

def test_models():
    """
    Test database models and relationships
    """
    print("\n🏗️ Testing database models...")
    
    try:
        # Test database session
        db = next(get_db())
        
        # Test User model
        user_count = db.query(User).count()
        print(f"   👤 Users: {user_count} records")
        
        # Test Role model
        role_count = db.query(Role).count()
        print(f"   👥 Roles: {role_count} records")
        
        # Test Permission model
        permission_count = db.query(Permission).count()
        print(f"   🔐 Permissions: {permission_count} records")
        
        # Test Category model
        category_count = db.query(Category).count()
        print(f"   📂 Categories: {category_count} records")
        
        # Test Product model
        product_count = db.query(Product).count()
        print(f"   📦 Products: {product_count} records")
        
        # Test WebsiteSetting model
        setting_count = db.query(WebsiteSetting).count()
        print(f"   ⚙️ Website Settings: {setting_count} records")
        
        db.close()
        print("✅ All models working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Model test error: {str(e)}")
        return False

def test_super_admin():
    """
    Test Super Admin account
    """
    print("\n👑 Testing Super Admin account...")
    
    try:
        db = next(get_db())
        
        # Find Super Admin
        super_admin = db.query(User).filter(User.username == "Hpt").first()
        
        if super_admin:
            print(f"   ✅ Super Admin found: {super_admin.username}")
            print(f"   📧 Email: {super_admin.email}")
            print(f"   👤 Full Name: {super_admin.full_name}")
            print(f"   🔐 Status: {super_admin.status}")
            print(f"   👑 Is Super Admin: {super_admin.is_super_admin}")
            
            # Test role
            if super_admin.role:
                print(f"   👥 Role: {super_admin.role.display_name}")
                print(f"   🔑 Permissions: {len(super_admin.role.permissions)} permissions")
            
            # Test password verification (optional)
            # Note: Uncomment if you want to test password
            # if super_admin.verify_password("HptPttn7686"):
            #     print("   🔑 Password verification: ✅ Correct")
            # else:
            #     print("   🔑 Password verification: ❌ Incorrect")
            
            db.close()
            return True
        else:
            print("   ❌ Super Admin not found!")
            db.close()
            return False
            
    except Exception as e:
        print(f"❌ Super Admin test error: {str(e)}")
        return False

def test_relationships():
    """
    Test database relationships
    """
    print("\n🔗 Testing database relationships...")
    
    try:
        db = next(get_db())
        
        # Test User-Role relationship
        users_with_roles = db.query(User).join(Role).count()
        print(f"   👤➡️👥 Users with roles: {users_with_roles}")
        
        # Test Role-Permission relationship
        roles_with_permissions = db.query(Role).join(Role.permissions).count()
        print(f"   👥➡️🔐 Roles with permissions: {roles_with_permissions}")
        
        # Test Category hierarchy (if any)
        categories_with_parent = db.query(Category).filter(Category.parent_id.isnot(None)).count()
        print(f"   📂➡️📂 Categories with parent: {categories_with_parent}")
        
        db.close()
        print("✅ All relationships working correctly!")
        return True
        
    except Exception as e:
        print(f"❌ Relationship test error: {str(e)}")
        return False

def run_all_tests():
    """
    Run all database tests
    """
    print("🧪 RUNNING DATABASE TESTS")
    print("=" * 50)
    
    tests = [
        ("Database Connection", test_database_connection),
        ("Database Models", test_models),
        ("Super Admin Account", test_super_admin),
        ("Database Relationships", test_relationships)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        print(f"\n🔍 {test_name}...")
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 50)
    
    passed = 0
    failed = 0
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"   {test_name}: {status}")
        if result:
            passed += 1
        else:
            failed += 1
    
    print(f"\n📈 Total: {len(results)} tests")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    
    if failed == 0:
        print("\n🎉 All tests passed! Database is ready for use.")
        return True
    else:
        print(f"\n⚠️ {failed} test(s) failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    run_all_tests()