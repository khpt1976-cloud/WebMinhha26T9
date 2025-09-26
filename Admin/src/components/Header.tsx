import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

interface HeaderProps {
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, message: "Có 3 tài khoản mới chờ duyệt", time: "5 phút trước", type: "info" },
    { id: 2, message: "Sản phẩm mới được thêm", time: "10 phút trước", type: "success" },
    { id: 3, message: "Cập nhật hệ thống hoàn tất", time: "1 giờ trước", type: "success" }
  ];

  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>
        <div className="header-logo">
          <h2>Admin Panel</h2>
          <span className="header-subtitle">Cửa Hàng Minh Hà</span>
        </div>
      </div>

      <div className="header-right">
        {/* Search Bar */}
        <div className="header-search">
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>

        {/* Notifications */}
        <div className="header-notifications">
          <button 
            className="notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
            <span className="notification-badge">{notifications.length}</span>
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Thông báo</h4>
                <button onClick={() => setShowNotifications(false)}>✕</button>
              </div>
              <div className="notification-list">
                {notifications.map(notif => (
                  <div key={notif.id} className={`notification-item ${notif.type}`}>
                    <p>{notif.message}</p>
                    <small>{notif.time}</small>
                  </div>
                ))}
              </div>
              <div className="notification-footer">
                <button>Xem tất cả</button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="header-user">
          <button 
            className="user-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-info">
              <span className="user-name">{user?.username || 'Admin'}</span>
              <span className="user-role">{user?.role?.display_name || 'Super Admin'}</span>
            </div>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-dropdown-header">
                <div className="user-avatar-large">
                  {user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="user-name-large">{user?.username || 'Admin'}</p>
                  <p className="user-email">{user?.email || 'admin@example.com'}</p>
                </div>
              </div>
              <div className="user-dropdown-menu">
                <button className="dropdown-item">
                  👤 Hồ sơ cá nhân
                </button>
                <button className="dropdown-item">
                  ⚙️ Cài đặt
                </button>
                <button className="dropdown-item">
                  🔒 Đổi mật khẩu
                </button>
                <hr />
                <button className="dropdown-item logout-btn" onClick={logout}>
                  🚪 Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;