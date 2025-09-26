import React, { useState, useEffect } from 'react';
import './UserModal.css';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
  last_login?: string;
}

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  mode: 'view' | 'edit' | 'create';
  onClose: () => void;
  onSave: (userData: Partial<User>) => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, isOpen, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    role: 'customer',
    status: 'active' as 'active' | 'pending' | 'inactive'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && (mode === 'edit' || mode === 'view')) {
      setFormData({
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone || '',
        role: user.role,
        status: user.status
      });
    } else if (mode === 'create') {
      setFormData({
        username: '',
        email: '',
        full_name: '',
        phone: '',
        role: 'customer',
        status: 'active'
      });
    }
    setErrors({});
  }, [user, mode, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập là bắt buộc';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Họ tên là bắt buộc';
    } else if (formData.full_name.length < 2) {
      newErrors.full_name = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { class: 'badge-success', text: 'Hoạt động', icon: '✅' },
      pending: { class: 'badge-warning', text: 'Chờ duyệt', icon: '⏳' },
      inactive: { class: 'badge-danger', text: 'Tạm khóa', icon: '🚫' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`badge ${config.class}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {mode === 'create' && '➕ Tạo người dùng mới'}
            {mode === 'edit' && '✏️ Chỉnh sửa người dùng'}
            {mode === 'view' && '👁️ Chi tiết người dùng'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {mode === 'view' && user ? (
            // View Mode
            <div className="user-detail-view">
              <div className="user-header">
                <div className="user-avatar-large">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <h4>{user.full_name}</h4>
                  <p className="username">@{user.username}</p>
                  {getStatusBadge(user.status)}
                </div>
              </div>

              <div className="user-details-grid">
                <div className="detail-section">
                  <h5>Thông tin cơ bản</h5>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{user.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Số điện thoại:</label>
                      <span>{user.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Vai trò:</label>
                      <span className="role-badge">
                        {user.role === 'customer' ? '👤 Khách hàng' : 
                         user.role === 'admin' ? '👨‍💼 Quản trị' : 
                         user.role === 'moderator' ? '🛡️ Kiểm duyệt' : user.role}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>Trạng thái:</label>
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h5>Thông tin hệ thống</h5>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Ngày tạo:</label>
                      <span>{formatDate(user.created_at)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Lần cuối đăng nhập:</label>
                      <span>
                        {user.last_login ? formatDate(user.last_login) : 'Chưa đăng nhập'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <label>ID:</label>
                      <span className="user-id">#{user.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="user-activity">
                <h5>Hoạt động gần đây</h5>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-icon">🔐</span>
                    <span className="activity-text">Đăng nhập thành công</span>
                    <span className="activity-time">2 giờ trước</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">✏️</span>
                    <span className="activity-text">Cập nhật thông tin cá nhân</span>
                    <span className="activity-time">1 ngày trước</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-icon">🛒</span>
                    <span className="activity-text">Đặt hàng #12345</span>
                    <span className="activity-time">3 ngày trước</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Edit/Create Mode
            <form onSubmit={handleSubmit} className="user-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Tên đăng nhập *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.username ? 'error' : ''}`}
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    placeholder="Nhập tên đăng nhập"
                    disabled={mode === 'edit'} // Username không thể sửa
                  />
                  {errors.username && <span className="error-text">{errors.username}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Email *
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? 'error' : ''}`}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Nhập địa chỉ email"
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-group full-width">
                  <label className="form-label">
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.full_name ? 'error' : ''}`}
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Nhập họ và tên đầy đủ"
                  />
                  {errors.full_name && <span className="error-text">{errors.full_name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    className={`form-control ${errors.phone ? 'error' : ''}`}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Vai trò
                  </label>
                  <select
                    className="form-control"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                  >
                    <option value="customer">👤 Khách hàng</option>
                    <option value="moderator">🛡️ Kiểm duyệt</option>
                    <option value="admin">👨‍💼 Quản trị</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Trạng thái
                  </label>
                  <select
                    className="form-control"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'pending' | 'inactive')}
                  >
                    <option value="active">✅ Hoạt động</option>
                    <option value="pending">⏳ Chờ duyệt</option>
                    <option value="inactive">🚫 Tạm khóa</option>
                  </select>
                </div>
              </div>

              {mode === 'create' && (
                <div className="form-group">
                  <label className="form-label">
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  />
                  <small className="form-help">
                    Mật khẩu sẽ được gửi qua email cho người dùng
                  </small>
                </div>
              )}
            </form>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            {mode === 'view' ? 'Đóng' : 'Hủy'}
          </button>
          
          {mode === 'view' && (
            <button className="btn btn-primary" onClick={() => {/* Switch to edit mode */}}>
              ✏️ Chỉnh sửa
            </button>
          )}
          
          {(mode === 'edit' || mode === 'create') && (
            <button 
              type="submit" 
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  {mode === 'create' ? 'Đang tạo...' : 'Đang lưu...'}
                </>
              ) : (
                <>
                  {mode === 'create' ? '➕ Tạo người dùng' : '💾 Lưu thay đổi'}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserModal;