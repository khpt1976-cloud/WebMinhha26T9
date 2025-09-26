import React, { useState, useEffect } from 'react';
import userService, { User, Role } from '../services/userService';
import { useAuth } from '../contexts/AuthContext';
import './Users.css';

const Users: React.FC = () => {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  const usersPerPage = 10;

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, [currentPage, searchTerm, statusFilter, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await userService.getUsers({
        page: currentPage,
        per_page: usersPerPage,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter as any : undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined
      });
      
      setUsers(response.data);
      setTotalUsers(response.total || 0);
    } catch (error: any) {
      setError(error.message || 'Không thể tải danh sách người dùng');
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const response = await userService.getRoles();
      setRoles(response.data);
    } catch (error: any) {
      console.error('Load roles error:', error);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: 'active' | 'inactive') => {
    if (!hasPermission('manage_users')) {
      alert('Bạn không có quyền thay đổi trạng thái người dùng');
      return;
    }

    try {
      await userService.updateUserStatus(userId, newStatus);
      await loadUsers(); // Reload users
    } catch (error: any) {
      alert(error.message || 'Không thể cập nhật trạng thái người dùng');
    }
  };

  const handleBulkStatusChange = async (status: 'active' | 'inactive') => {
    if (!hasPermission('manage_users')) {
      alert('Bạn không có quyền thay đổi trạng thái người dùng');
      return;
    }

    if (selectedUsers.length === 0) {
      alert('Vui lòng chọn ít nhất một người dùng');
      return;
    }

    try {
      await userService.bulkUpdateUserStatus(selectedUsers, status);
      setSelectedUsers([]);
      await loadUsers();
    } catch (error: any) {
      alert(error.message || 'Không thể cập nhật trạng thái người dùng');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!hasPermission('manage_users')) {
      alert('Bạn không có quyền xóa người dùng');
      return;
    }

    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    try {
      await userService.deleteUser(userId);
      await loadUsers();
    } catch (error: any) {
      alert(error.message || 'Không thể xóa người dùng');
    }
  };

  // Mock data fallback for development
  useEffect(() => {
    if (users.length === 0 && !loading && !error) {
      const mockUsers: User[] = [
        {
          id: 1,
          username: 'nguyenvana',
          email: 'nguyenvana@gmail.com',
          full_name: 'Nguyễn Văn A',
          phone: '0901234567',
          avatar_url: null,
          role: { id: 1, name: 'customer', display_name: 'Khách hàng', description: 'Khách hàng thường' },
          permissions: [],
          is_super_admin: false,
          status: 'active',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z',
          last_login: '2024-09-24T08:15:00Z'
        },
        {
          id: 2,
          username: 'tranthib',
          email: 'tranthib@gmail.com',
          full_name: 'Trần Thị B',
          phone: '0907654321',
          avatar_url: null,
          role: { id: 1, name: 'customer', display_name: 'Khách hàng', description: 'Khách hàng thường' },
          permissions: [],
          is_super_admin: false,
          status: 'pending',
          created_at: '2024-09-23T14:20:00Z',
          updated_at: '2024-09-23T14:20:00Z',
          last_login: null
        }
      ];

      setTimeout(() => {
        setUsers(mockUsers);
        setTotalUsers(mockUsers.length);
        setLoading(false);
      }, 1000);
    }
  }, [users.length, loading, error]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role.name === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };



  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
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
        <p>Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Quản lý Người dùng</h1>
        <p className="page-subtitle">Quản lý tài khoản người dùng và phân quyền</p>
        <div className="breadcrumb">
          <span className="breadcrumb-item">🏠 Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">Quản lý User</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            👥
          </div>
          <div className="stat-content">
            <h3>{users.length}</h3>
            <p>Tổng người dùng</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            ✅
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.status === 'active').length}</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            ⏳
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.status === 'pending').length}</h3>
            <p>Chờ duyệt</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon danger">
            🚫
          </div>
          <div className="stat-content">
            <h3>{users.filter(u => u.status === 'inactive').length}</h3>
            <p>Tạm khóa</p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="card">
        <div className="card-body">
          <div className="users-toolbar">
            <div className="toolbar-left">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-control"
                />
                <button className="search-btn">🔍</button>
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-control filter-select"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="pending">Chờ duyệt</option>
                <option value="inactive">Tạm khóa</option>
              </select>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-control filter-select"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="customer">Khách hàng</option>
                <option value="admin">Quản trị</option>
              </select>
            </div>
            
            <div className="toolbar-right">
              {selectedUsers.length > 0 && (
                <div className="bulk-actions">
                  <button className="btn btn-success">
                    ✅ Kích hoạt ({selectedUsers.length})
                  </button>
                  <button className="btn btn-danger">
                    🚫 Khóa ({selectedUsers.length})
                  </button>
                </div>
              )}
              <button className="btn btn-primary">
                ➕ Thêm người dùng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Danh sách người dùng ({filteredUsers.length})
          </h3>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table users-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Người dùng</th>
                  <th>Liên hệ</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Lần cuối đăng nhập</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.full_name}</div>
                          <div className="username">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="email">{user.email}</div>
                        {user.phone && <div className="phone">{user.phone}</div>}
                      </div>
                    </td>
                    <td>
                      <span className="role-badge">
                        {user.role.display_name}
                      </span>
                    </td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      {user.last_login ? formatDate(user.last_login) : 
                        <span className="text-muted">Chưa đăng nhập</span>
                      }
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-primary"
                          onClick={() => handleViewUser(user)}
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button
                          className="btn-icon btn-warning"
                          title="Chỉnh sửa"
                        >
                          ✏️
                        </button>
                        {user.status === 'active' ? (
                          <button
                            className="btn-icon btn-danger"
                            onClick={() => handleStatusChange(user.id, 'inactive')}
                            title="Khóa tài khoản"
                          >
                            🚫
                          </button>
                        ) : (
                          <button
                            className="btn-icon btn-success"
                            onClick={() => handleStatusChange(user.id, 'active')}
                            title="Kích hoạt"
                          >
                            ✅
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card-footer">
            <div className="pagination-wrapper">
              <div className="pagination-info">
                Hiển thị {startIndex + 1}-{Math.min(startIndex + usersPerPage, filteredUsers.length)} 
                trong tổng số {filteredUsers.length} người dùng
              </div>
              <div className="pagination">
                <button
                  className="btn btn-outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  ← Trước
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    className={`btn ${page === currentPage ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  className="btn btn-outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Sau →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết người dùng</h3>
              <button 
                className="modal-close"
                onClick={() => setShowUserModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="user-detail-info">
                <div className="user-avatar-large">
                  {selectedUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="user-detail-content">
                  <h4>{selectedUser.full_name}</h4>
                  <p className="username">@{selectedUser.username}</p>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Email:</label>
                      <span>{selectedUser.email}</span>
                    </div>
                    <div className="detail-item">
                      <label>Số điện thoại:</label>
                      <span>{selectedUser.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="detail-item">
                      <label>Vai trò:</label>
                      <span>{selectedUser.role.display_name}</span>
                    </div>
                    <div className="detail-item">
                      <label>Trạng thái:</label>
                      {getStatusBadge(selectedUser.status)}
                    </div>
                    <div className="detail-item">
                      <label>Ngày tạo:</label>
                      <span>{formatDate(selectedUser.created_at)}</span>
                    </div>
                    <div className="detail-item">
                      <label>Lần cuối đăng nhập:</label>
                      <span>
                        {selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Chưa đăng nhập'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowUserModal(false)}>
                Đóng
              </button>
              <button className="btn btn-primary">
                ✏️ Chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;