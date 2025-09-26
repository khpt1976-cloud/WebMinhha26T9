"""
Database configuration and session management for Admin Panel
"""

import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Database URL from environment variable or default to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./admin_panel.db")

# Create engine
if DATABASE_URL.startswith("sqlite"):
    # SQLite specific configuration
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False  # Set to True for SQL debugging
    )
else:
    # PostgreSQL/MySQL configuration
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_recycle=300,
        echo=False  # Set to True for SQL debugging
    )

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Metadata for migrations
metadata = MetaData()

def get_db():
    """
    Dependency to get database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_tables():
    """
    Create all tables in the database
    """
    # Import all models to ensure they are registered
    from models.user_models import User, Role, Permission, RolePermission
    from models.product_models import Category, Product, ProductImage
    from models.settings_models import WebsiteSetting, ContactSetting, SeoSetting, AppearanceSetting
    from models.audit_models import AuditLog, SystemLog, LoginAttempt, DataExport
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

def drop_tables():
    """
    Drop all tables in the database (use with caution!)
    """
    Base.metadata.drop_all(bind=engine)
    print("⚠️ All database tables dropped!")

def reset_database():
    """
    Reset database by dropping and recreating all tables
    """
    print("🔄 Resetting database...")
    drop_tables()
    create_tables()
    print("✅ Database reset completed!")

if __name__ == "__main__":
    # Create tables when running this file directly
    create_tables()