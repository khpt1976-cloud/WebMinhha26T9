import React, { useState, useEffect } from 'react';
import './UsersPending.css';

interface PendingUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone?: string;
  registration_date: string;
  registration_ip?: string;
  verification_status: 'email_pending' | 'email_verified' | 'phone_pending' | 'phone_verified';
  notes?: string;
}

const UsersPending: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [approvalNote, setApprovalNote] = useState('');

  // Mock data - sẽ thay thế bằng API call
  useEffect(() => {
    const mockPendingUsers: PendingUser[] = [
      {
        id: 1,
        username: 'newuser1',
        email: 'newuser1@gmail.com',
        full_name: 'Nguyễn Văn Mới',
        phone: '0901234567',
        registration_date: '2024-09-24T10:30:00Z',
        registration_ip: '192.168.1.100',
        verification_status: 'email_verified',
        notes: 'Đăng ký từ trang chủ'
      },
      {
        id: 2,
        username: 'customer2024',
        email: 'customer2024@gmail.com',
        full_name: 'Trần Thị Khách',
        phone: '0907654321',
        registration_date: '2024-09-24T09:15:00Z',
        registration_ip: '192.168.1.101',
        verification_status: 'email_pending'
      },
      {
        id: 3,
        username: 'buyer123',
        email: 'buyer123@gmail.com',
        full_name: 'Lê Văn Mua',
        phone: '0912345678',
        registration_date: '2024-09-23T16:45:00Z',
        registration_ip: '192.168.1.102',
        verification_status: 'email_verified',
        notes: 'Đăng ký qua Facebook'
      }
    ];

    setTimeout(() => {
      setPendingUsers(mockPendingUsers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredUsers = pendingUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  const handleApprovalAction = (user: PendingUser, action: 'approve' | 'reject') => {
    setSelectedUser(user);
    setApprovalAction(action);
    setApprovalNote('');
    setShowApprovalModal(true);
  };

  const handleBulkApproval = (action: 'approve' | 'reject') => {
    if (selectedUsers.length === 0) return;
    
    // TODO: Implement bulk approval API call
    console.log(`${action} users:`, selectedUsers);
    
    // Remove approved/rejected users from pending list
    setPendingUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
    setSelectedUsers([]);
  };

  const handleConfirmApproval = () => {
    if (!selectedUser) return;

    // TODO: Implement API call for approval/rejection
    console.log(`${approvalAction} user:`, selectedUser.id, 'Note:', approvalNote);

    // Remove user from pending list
    setPendingUsers(prev => prev.filter(user => user.id !== selectedUser.id));
    setShowApprovalModal(false);
    setSelectedUser(null);
  };

  const getVerificationBadge = (status: string) => {
    const statusConfig = {
      email_pending: { class: 'badge-warning', text: 'Email chờ xác thực', icon: '📧⏳' },
      email_verified: { class: 'badge-success', text: 'Email đã xác thực', icon: '📧✅' },
      phone_pending: { class: 'badge-warning', text: 'SĐT chờ xác thực', icon: '📱⏳' },
      phone_verified: { class: 'badge-success', text: 'SĐT đã xác thực', icon: '📱✅' }
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
        <p>Đang tải danh sách tài khoản chờ duyệt...</p>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Tài khoản chờ duyệt</h1>
        <p className="page-subtitle">Phê duyệt các tài khoản đăng ký mới</p>
        <div className="breadcrumb">
          <span className="breadcrumb-item">🏠 Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">
            <a href="/users" className="breadcrumb-link">Quản lý User</a>
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">Chờ duyệt</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon warning">
            ⏳
          </div>
          <div className="stat-content">
            <h3>{pendingUsers.length}</h3>
            <p>Tài khoản chờ duyệt</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            📧✅
          </div>
          <div className="stat-content">
            <h3>{pendingUsers.filter(u => u.verification_status.includes('email_verified')).length}</h3>
            <p>Email đã xác thực</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon primary">
            📱✅
          </div>
          <div className="stat-content">
            <h3>{pendingUsers.filter(u => u.verification_status.includes('phone_verified')).length}</h3>
            <p>SĐT đã xác thực</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon danger">
            🕒
          </div>
          <div className="stat-content">
            <h3>{pendingUsers.filter(u => {
              const regDate = new Date(u.registration_date);
              const now = new Date();
              const diffHours = (now.getTime() - regDate.getTime()) / (1000 * 60 * 60);
              return diffHours > 24;
            }).length}</h3>
            <p>Quá 24h chưa duyệt</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card">
        <div className="card-body">
          <div className="pending-toolbar">
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
            </div>

            <div className="toolbar-right">
              {selectedUsers.length > 0 && (
                <div className="bulk-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleBulkApproval('approve')}
                  >
                    ✅ Duyệt tất cả ({selectedUsers.length})
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleBulkApproval('reject')}
                  >
                    ❌ Từ chối tất cả ({selectedUsers.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Users Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Danh sách tài khoản chờ duyệt ({filteredUsers.length})
          </h3>
        </div>
        <div className="card-body p-0">
          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎉</div>
              <h3>Không có tài khoản nào chờ duyệt</h3>
              <p>Tất cả tài khoản đăng ký mới đã được xử lý.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table pending-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Thông tin người dùng</th>
                    <th>Liên hệ</th>
                    <th>Trạng thái xác thực</th>
                    <th>Ngày đăng ký</th>
                    <th>IP đăng ký</th>
                    <th>Ghi chú</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="pending-row">
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                        />
                      </td>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar pending">
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
                      <td>{getVerificationBadge(user.verification_status)}</td>
                      <td>
                        <div className="registration-info">
                          <div className="reg-date">{formatDate(user.registration_date)}</div>
                          <div className="time-ago">
                            {(() => {
                              const regDate = new Date(user.registration_date);
                              const now = new Date();
                              const diffHours = Math.floor((now.getTime() - regDate.getTime()) / (1000 * 60 * 60));
                              if (diffHours < 1) return 'Vừa xong';
                              if (diffHours < 24) return `${diffHours} giờ trước`;
                              return `${Math.floor(diffHours / 24)} ngày trước`;
                            })()}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="ip-address">{user.registration_ip || 'N/A'}</span>
                      </td>
                      <td>
                        <span className="notes">{user.notes || '-'}</span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleApprovalAction(user, 'approve')}
                            title="Duyệt tài khoản"
                          >
                            ✅ Duyệt
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleApprovalAction(user, 'reject')}
                            title="Từ chối"
                          >
                            ❌ Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowApprovalModal(false)}>
          <div className="modal-content approval-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {approvalAction === 'approve' ? '✅ Duyệt tài khoản' : '❌ Từ chối tài khoản'}
              </h3>
              <button
                className="modal-close"
                onClick={() => setShowApprovalModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="approval-user-info">
                <div className="user-avatar-large pending">
                  {selectedUser.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="user-detail-content">
                  <h4>{selectedUser.full_name}</h4>
                  <p className="username">@{selectedUser.username}</p>
                  <div className="user-meta">
                    <span className="email">{selectedUser.email}</span>
                    {selectedUser.phone && <span className="phone">{selectedUser.phone}</span>}
                  </div>
                </div>
              </div>

              <div className="approval-form">
                <div className="form-group">
                  <label className="form-label">
                    {approvalAction === 'approve' ? 'Lý do duyệt:' : 'Lý do từ chối:'}
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    placeholder={
                      approvalAction === 'approve'
                        ? 'Nhập lý do duyệt tài khoản (tùy chọn)...'
                        : 'Nhập lý do từ chối tài khoản...'
                    }
                  />
                </div>

                {approvalAction === 'approve' && (
                  <div className="approval-options">
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        Gửi email chào mừng
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="checkbox-label">
                        <input type="checkbox" defaultChecked />
                        Kích hoạt tài khoản ngay lập tức
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowApprovalModal(false)}
              >
                Hủy
              </button>
              <button
                className={`btn ${approvalAction === 'approve' ? 'btn-success' : 'btn-danger'}`}
                onClick={handleConfirmApproval}
              >
                {approvalAction === 'approve' ? '✅ Xác nhận duyệt' : '❌ Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersPending;