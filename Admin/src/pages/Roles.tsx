import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import './Roles.css';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: number;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  user_count: number;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

const Roles: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    permissions: [] as string[]
  });

  const { hasPermission } = useAuth();

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await userService.getRoles();
      setRoles(response.data);
    } catch (error: any) {
      setError(error.message || 'Không thể tải danh sách vai trò');
      console.error('Load roles error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await userService.getPermissions();
      setPermissions(response.data);
    } catch (error: any) {
      console.error('Load permissions error:', error);
      // Fallback to mock permissions if API fails
      const mockPermissions: Permission[] = [
      // User Management
      { id: 'users.view', name: 'Xem người dùng', description: 'Xem danh sách và thông tin người dùng', category: 'Quản lý người dùng' },
      { id: 'users.create', name: 'Tạo người dùng', description: 'Tạo tài khoản người dùng mới', category: 'Quản lý người dùng' },
      { id: 'users.edit', name: 'Sửa người dùng', description: 'Chỉnh sửa thông tin người dùng', category: 'Quản lý người dùng' },
      { id: 'users.delete', name: 'Xóa người dùng', description: 'Xóa tài khoản người dùng', category: 'Quản lý người dùng' },
      { id: 'users.approve', name: 'Duyệt tài khoản', description: 'Phê duyệt tài khoản đăng ký mới', category: 'Quản lý người dùng' },
      
      // Product Management
      { id: 'products.view', name: 'Xem sản phẩm', description: 'Xem danh sách sản phẩm', category: 'Quản lý sản phẩm' },
      { id: 'products.create', name: 'Tạo sản phẩm', description: 'Thêm sản phẩm mới', category: 'Quản lý sản phẩm' },
      { id: 'products.edit', name: 'Sửa sản phẩm', description: 'Chỉnh sửa thông tin sản phẩm', category: 'Quản lý sản phẩm' },
      { id: 'products.delete', name: 'Xóa sản phẩm', description: 'Xóa sản phẩm', category: 'Quản lý sản phẩm' },
      
      // Order Management
      { id: 'orders.view', name: 'Xem đơn hàng', description: 'Xem danh sách đơn hàng', category: 'Quản lý đơn hàng' },
      { id: 'orders.edit', name: 'Sửa đơn hàng', description: 'Cập nhật trạng thái đơn hàng', category: 'Quản lý đơn hàng' },
      { id: 'orders.cancel', name: 'Hủy đơn hàng', description: 'Hủy đơn hàng', category: 'Quản lý đơn hàng' },
      
      // System Settings
      { id: 'settings.view', name: 'Xem cài đặt', description: 'Xem cài đặt hệ thống', category: 'Cài đặt hệ thống' },
      { id: 'settings.edit', name: 'Sửa cài đặt', description: 'Chỉnh sửa cài đặt hệ thống', category: 'Cài đặt hệ thống' },
      
      // Role Management
      { id: 'roles.view', name: 'Xem vai trò', description: 'Xem danh sách vai trò', category: 'Quản lý phân quyền' },
      { id: 'roles.create', name: 'Tạo vai trò', description: 'Tạo vai trò mới', category: 'Quản lý phân quyền' },
      { id: 'roles.edit', name: 'Sửa vai trò', description: 'Chỉnh sửa vai trò', category: 'Quản lý phân quyền' },
      { id: 'roles.delete', name: 'Xóa vai trò', description: 'Xóa vai trò', category: 'Quản lý phân quyền' }
      ];
      setPermissions(mockPermissions);
    }
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setIsEditing(false);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      permissions: []
    });
    setShowRoleModal(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setIsEditing(true);
    setFormData({
      name: role.name,
      display_name: role.display_name,
      description: role.description,
      permissions: role.permissions
    });
    setShowRoleModal(true);
  };

  const handleDeleteRole = (roleId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vai trò này?')) {
      setRoles(prev => prev.filter(role => role.id !== roleId));
    }
  };

  const handleSaveRole = () => {
    if (isEditing && selectedRole) {
      // Update existing role
      setRoles(prev => prev.map(role =>
        role.id === selectedRole.id
          ? { ...role, ...formData, updated_at: new Date().toISOString() }
          : role
      ));
    } else {
      // Create new role
      const newRole: Role = {
        id: Math.max(...roles.map(r => r.id)) + 1,
        ...formData,
        user_count: 0,
        is_system: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setRoles(prev => [...prev, newRole]);
    }
    setShowRoleModal(false);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải danh sách vai trò...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Quản lý Phân quyền</h1>
        <p className="page-subtitle">Quản lý vai trò và phân quyền người dùng</p>
        <div className="breadcrumb">
          <span className="breadcrumb-item">🏠 Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">
            <a href="/users" className="breadcrumb-link">Quản lý User</a>
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">Phân quyền</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            👥
          </div>
          <div className="stat-content">
            <h3>{roles.length}</h3>
            <p>Tổng vai trò</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            🔐
          </div>
          <div className="stat-content">
            <h3>{permissions.length}</h3>
            <p>Tổng quyền hạn</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            🛡️
          </div>
          <div className="stat-content">
            <h3>{roles.filter(r => r.is_system).length}</h3>
            <p>Vai trò hệ thống</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            👤
          </div>
          <div className="stat-content">
            <h3>{roles.reduce((sum, role) => sum + role.user_count, 0)}</h3>
            <p>Tổng người dùng</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card">
        <div className="card-body">
          <div className="roles-toolbar">
            <div className="toolbar-left">
              <h3 className="mb-0">Danh sách vai trò</h3>
            </div>
            <div className="toolbar-right">
              <button className="btn btn-primary" onClick={handleCreateRole}>
                ➕ Tạo vai trò mới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="roles-grid">
        {roles.map(role => (
          <div key={role.id} className={`role-card ${role.is_system ? 'system-role' : ''}`}>
            <div className="role-header">
              <div className="role-info">
                <h4 className="role-name">{role.display_name}</h4>
                <span className="role-code">@{role.name}</span>
                {role.is_system && (
                  <span className="system-badge">🛡️ Hệ thống</span>
                )}
              </div>
              <div className="role-actions">
                <button
                  className="btn-icon btn-primary"
                  onClick={() => handleEditRole(role)}
                  title="Chỉnh sửa"
                >
                  ✏️
                </button>
                {!role.is_system && (
                  <button
                    className="btn-icon btn-danger"
                    onClick={() => handleDeleteRole(role.id)}
                    title="Xóa vai trò"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>

            <div className="role-description">
              {role.description}
            </div>

            <div className="role-stats">
              <div className="stat-item">
                <span className="stat-label">Người dùng:</span>
                <span className="stat-value">{role.user_count}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Quyền hạn:</span>
                <span className="stat-value">{role.permissions.length}</span>
              </div>
            </div>

            <div className="role-permissions">
              <h5>Quyền hạn ({role.permissions.length})</h5>
              <div className="permissions-list">
                {role.permissions.slice(0, 6).map(permissionId => {
                  const permission = permissions.find(p => p.id === permissionId);
                  return permission ? (
                    <span key={permissionId} className="permission-tag">
                      {permission.name}
                    </span>
                  ) : null;
                })}
                {role.permissions.length > 6 && (
                  <span className="permission-tag more">
                    +{role.permissions.length - 6} khác
                  </span>
                )}
              </div>
            </div>

            <div className="role-footer">
              <small className="text-muted">
                Cập nhật: {formatDate(role.updated_at)}
              </small>
            </div>
          </div>
        ))}
      </div>

      {/* Role Modal */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div className="modal-content role-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {isEditing ? '✏️ Chỉnh sửa vai trò' : '➕ Tạo vai trò mới'}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowRoleModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Tên vai trò *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.display_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Nhập tên hiển thị vai trò"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mã vai trò *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập mã vai trò (không dấu, không khoảng trắng)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Nhập mô tả vai trò"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Quyền hạn ({formData.permissions.length}/{permissions.length})
                </label>
                <div className="permissions-selector">
                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <div key={category} className="permission-category">
                      <h5 className="category-title">{category}</h5>
                      <div className="permission-checkboxes">
                        {categoryPermissions.map(permission => (
                          <label key={permission.id} className="permission-checkbox">
                            <input
                              type="checkbox"
                              checked={formData.permissions.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                            />
                            <div className="checkbox-content">
                              <span className="permission-name">{permission.name}</span>
                              <span className="permission-desc">{permission.description}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowRoleModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveRole}
                disabled={!formData.name || !formData.display_name}
              >
                {isEditing ? '💾 Cập nhật' : '➕ Tạo vai trò'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Roles;