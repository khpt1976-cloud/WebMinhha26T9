"""
Audit and Logging Models for Admin Panel
Tracks all changes and activities for security and compliance
"""

from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

# Import Base from database module
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import Base

class ActionType(enum.Enum):
    """Types of actions that can be logged"""
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    APPROVE = "approve"
    REJECT = "reject"
    UPLOAD = "upload"
    DOWNLOAD = "download"
    EXPORT = "export"
    IMPORT = "import"

class LogLevel(enum.Enum):
    """Log levels for filtering"""
    DEBUG = "debug"
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class AuditLog(Base):
    """
    Audit Log table - Tracks all user activities and system changes
    """
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Who performed the action
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    username = Column(String(50), nullable=True)  # Cached for deleted users
    user_ip = Column(String(45), nullable=True)  # IPv4 or IPv6
    user_agent = Column(String(500), nullable=True)
    
    # What action was performed
    action = Column(String(50), nullable=False, index=True)
    resource = Column(String(100), nullable=False, index=True)  # users, products, etc.
    resource_id = Column(String(50), nullable=True, index=True)  # ID of affected resource
    
    # Action details
    description = Column(Text, nullable=True)
    old_values = Column(JSON, nullable=True)  # Previous values (for updates)
    new_values = Column(JSON, nullable=True)  # New values (for creates/updates)
    
    # Request details
    method = Column(String(10), nullable=True)  # GET, POST, PUT, DELETE
    endpoint = Column(String(255), nullable=True)
    request_data = Column(JSON, nullable=True)
    response_status = Column(Integer, nullable=True)
    
    # Categorization
    level = Column(String(20), default=LogLevel.INFO.value, nullable=False)
    category = Column(String(50), nullable=True)  # auth, product, user, system
    tags = Column(JSON, nullable=True)  # Additional tags for filtering
    
    # Success/failure
    success = Column(String(10), nullable=True)  # success, failure, partial
    error_message = Column(Text, nullable=True)
    
    # Timing
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    duration_ms = Column(Integer, nullable=True)  # Request duration in milliseconds
    
    # Session tracking
    session_id = Column(String(255), nullable=True, index=True)
    
    # Relationships
    user = relationship("User")
    
    @classmethod
    def log_action(cls, session, user_id=None, action=None, resource=None, 
                   resource_id=None, description=None, old_values=None, 
                   new_values=None, **kwargs):
        """
        Convenience method to create audit log entries
        """
        log_entry = cls(
            user_id=user_id,
            action=action,
            resource=resource,
            resource_id=str(resource_id) if resource_id else None,
            description=description,
            old_values=old_values,
            new_values=new_values,
            **kwargs
        )
        session.add(log_entry)
        return log_entry

class SystemLog(Base):
    """
    System Log table - For system-level events and errors
    """
    __tablename__ = "system_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Log details
    level = Column(String(20), nullable=False, index=True)
    message = Column(Text, nullable=False)
    logger_name = Column(String(100), nullable=True)
    module = Column(String(100), nullable=True)
    function = Column(String(100), nullable=True)
    line_number = Column(Integer, nullable=True)
    
    # Context
    context = Column(JSON, nullable=True)
    exception_type = Column(String(100), nullable=True)
    exception_message = Column(Text, nullable=True)
    stack_trace = Column(Text, nullable=True)
    
    # Environment
    server_name = Column(String(100), nullable=True)
    process_id = Column(Integer, nullable=True)
    thread_id = Column(String(50), nullable=True)
    
    # Timing
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    @classmethod
    def log_error(cls, session, message, exception=None, context=None, **kwargs):
        """
        Convenience method to log errors
        """
        log_entry = cls(
            level=LogLevel.ERROR.value,
            message=message,
            exception_type=type(exception).__name__ if exception else None,
            exception_message=str(exception) if exception else None,
            context=context,
            **kwargs
        )
        session.add(log_entry)
        return log_entry

class LoginAttempt(Base):
    """
    Login Attempts table - Tracks login attempts for security
    """
    __tablename__ = "login_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Attempt details
    username = Column(String(50), nullable=True, index=True)
    email = Column(String(255), nullable=True, index=True)
    ip_address = Column(String(45), nullable=False, index=True)
    user_agent = Column(String(500), nullable=True)
    
    # Result
    success = Column(String(10), nullable=False, index=True)  # success, failure
    failure_reason = Column(String(100), nullable=True)  # invalid_credentials, account_locked, etc.
    
    # User info (if successful)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timing
    attempted_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    user = relationship("User")

class DataExport(Base):
    """
    Data Export table - Tracks data exports for compliance
    """
    __tablename__ = "data_exports"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Export details
    export_type = Column(String(50), nullable=False)  # users, products, orders, etc.
    format = Column(String(20), nullable=False)  # csv, xlsx, json, pdf
    filters = Column(JSON, nullable=True)  # Applied filters
    
    # File details
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=True)  # bytes
    record_count = Column(Integer, nullable=True)
    
    # User and timing
    exported_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    exported_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)  # Auto-delete date
    
    # Status
    status = Column(String(20), default="completed")  # pending, completed, failed, expired
    
    # Relationships
    exporter = relationship("User")