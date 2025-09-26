#!/usr/bin/env python3
"""
BƯỚC 7.1: Migration Script - Migrate dữ liệu từ API cũ sang Database
Chuyển 58 sản phẩm từ mock data (/api/products) vào database (/api/v1/products/)
"""

import requests
import json
from sqlalchemy.orm import Session
from database import SessionLocal, create_tables
from models.product_models import Product, Category, ProductStatus, ProductImage, ImageType
from datetime import datetime
import re

def clean_price(price_str):
    """Chuyển đổi giá từ string sang float"""
    if not price_str:
        return 0.0
    # Loại bỏ ký tự không phải số và dấu chấm
    clean = re.sub(r'[^\d.]', '', price_str.replace('đ', '').replace(',', ''))
    try:
        return float(clean)
    except:
        return 0.0

def get_category_id_by_slug(db: Session, slug: str):
    """Lấy category_id từ slug"""
    category = db.query(Category).filter(Category.slug == slug).first()
    if category:
        return category.id
    
    # Nếu không tìm thấy, tạo category mới
    category_names = {
        'vong-xep': 'Võng xếp',
        'rem-man': 'Rèm - Màn', 
        'gia-phoi': 'Giá phơi đồ',
        'ban-ghe': 'Bàn ghế',
        'gia-treo': 'Giá treo đồ',
        'giam-gia': 'Giảm giá hot',
        'san-pham-khac': 'Sản phẩm khác'
    }
    
    category_name = category_names.get(slug, slug.replace('-', ' ').title())
    new_category = Category(
        name=category_name,
        slug=slug,
        description=f"Danh mục {category_name}",
        is_featured=True,
        sort_order=len(category_names) + 1
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category.id

def fetch_mock_products():
    """Lấy dữ liệu từ API cũ"""
    try:
        print("🔄 Đang lấy dữ liệu từ API cũ...")
        response = requests.get('http://localhost:12000/api/products', timeout=10)
        response.raise_for_status()
        products = response.json()
        print(f"✅ Đã lấy được {len(products)} sản phẩm từ API cũ")
        return products
    except Exception as e:
        print(f"❌ Lỗi khi lấy dữ liệu từ API cũ: {e}")
        return []

def migrate_products_to_database():
    """Migrate sản phẩm từ mock data vào database"""
    print("🚀 Bắt đầu migration sản phẩm...")
    
    # Tạo tables nếu chưa có
    create_tables()
    
    # Lấy dữ liệu từ API cũ
    mock_products = fetch_mock_products()
    if not mock_products:
        print("❌ Không có dữ liệu để migrate!")
        return False
    
    # Kết nối database
    db = SessionLocal()
    
    try:
        # Xóa sản phẩm cũ nếu có
        existing_count = db.query(Product).count()
        if existing_count > 0:
            print(f"⚠️ Đã có {existing_count} sản phẩm trong database")
            confirm = input("Bạn có muốn xóa và tạo lại không? (y/N): ")
            if confirm.lower() == 'y':
                db.query(Product).delete()
                db.commit()
                print("🗑️ Đã xóa sản phẩm cũ")
            else:
                print("❌ Hủy migration")
                return False
        
        migrated_count = 0
        
        for mock_product in mock_products:
            try:
                # Lấy category_id
                category_id = get_category_id_by_slug(db, mock_product.get('category', 'san-pham-khac'))
                
                # Chuyển đổi giá
                price = clean_price(mock_product.get('price', '0'))
                original_price = clean_price(mock_product.get('original_price', '0'))
                
                # Tạo sản phẩm mới
                product = Product(
                    name=mock_product.get('title', 'Sản phẩm không tên'),
                    slug=f"san-pham-{mock_product.get('id', migrated_count + 1)}",
                    description=f"Mô tả cho {mock_product.get('title', 'sản phẩm')}",
                    short_description=mock_product.get('title', 'Sản phẩm chất lượng cao'),
                    original_price=original_price if original_price > price else price * 1.2,
                    sale_price=price,
                    category_id=category_id,
                    status=ProductStatus.ACTIVE.value,
                    is_featured=True,
                    is_hot=True,
                    stock_quantity=100,  # Mặc định
                    meta_title=mock_product.get('title', 'Sản phẩm'),
                    meta_description=f"Mua {mock_product.get('title', 'sản phẩm')} chất lượng cao, giá tốt tại Cửa hàng Minh Hà"
                )
                
                db.add(product)
                db.flush()  # Để lấy product.id
                
                # Tạo hình ảnh chính cho sản phẩm
                image_url = mock_product.get('image', '/static/images/product1.jpg')
                product_image = ProductImage(
                    product_id=product.id,
                    image_type=ImageType.MAIN.value,
                    file_name=f"product_{product.id}_main.jpg",
                    file_path=image_url,
                    file_url=image_url,
                    alt_text=product.name,
                    sort_order=1
                )
                db.add(product_image)
                
                migrated_count += 1
                
                if migrated_count % 10 == 0:
                    print(f"⏳ Đã migrate {migrated_count}/{len(mock_products)} sản phẩm...")
                    
            except Exception as e:
                print(f"⚠️ Lỗi khi migrate sản phẩm {mock_product.get('title', 'unknown')}: {e}")
                continue
        
        # Commit tất cả
        db.commit()
        
        print(f"✅ Migration hoàn thành!")
        print(f"📊 Đã migrate {migrated_count}/{len(mock_products)} sản phẩm thành công")
        
        # Kiểm tra kết quả
        total_products = db.query(Product).count()
        total_categories = db.query(Category).count()
        print(f"📈 Tổng sản phẩm trong database: {total_products}")
        print(f"📈 Tổng danh mục trong database: {total_categories}")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi trong quá trình migration: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def verify_migration():
    """Kiểm tra kết quả migration"""
    print("\n🔍 Kiểm tra kết quả migration...")
    
    try:
        # Test API mới
        response = requests.get('http://localhost:12000/api/v1/products/', timeout=10)
        response.raise_for_status()
        new_products = response.json()
        
        print(f"✅ API mới trả về {len(new_products)} sản phẩm")
        
        if len(new_products) > 0:
            print("📋 Sản phẩm đầu tiên:")
            first_product = new_products[0]
            print(f"   - ID: {first_product.get('id')}")
            print(f"   - Tên: {first_product.get('name')}")
            print(f"   - Giá: {first_product.get('price')}")
            print(f"   - Danh mục: {first_product.get('category_name')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Lỗi khi kiểm tra API mới: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🔄 BƯỚC 7.1: MIGRATION SCRIPT - API CŨ SANG DATABASE")
    print("=" * 60)
    
    # Thực hiện migration
    success = migrate_products_to_database()
    
    if success:
        # Kiểm tra kết quả
        verify_migration()
        print("\n🎉 Migration hoàn thành thành công!")
        print("🔗 Bây giờ có thể chuyển frontend sang sử dụng API mới")
    else:
        print("\n❌ Migration thất bại!")
        print("🔧 Vui lòng kiểm tra lại cấu hình và thử lại")
    
    print("=" * 60)