import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  path: string;
  badge?: number;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard']);

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: '📊',
      path: '/dashboard'
    },
    {
      id: 'users',
      title: 'Quản lý User',
      icon: '👥',
      path: '/users',
      badge: 3,
      children: [
        { id: 'users-list', title: 'Danh sách User', icon: '📋', path: '/users' },
        { id: 'users-pending', title: 'Chờ duyệt', icon: '⏳', path: '/users/pending', badge: 3 },
        { id: 'users-roles', title: 'Phân quyền', icon: '🔐', path: '/roles' }
      ]
    },
    {
      id: 'products',
      title: 'Quản lý Sản phẩm',
      icon: '🛍️',
      path: '/products',
      children: [
        { id: 'products-list', title: 'Danh sách SP', icon: '📦', path: '/products' },
        { id: 'categories', title: 'Danh mục', icon: '📂', path: '/categories' },
        { id: 'inventory', title: 'Quản lý Kho', icon: '📊', path: '/inventory' },
        { id: 'products-hot', title: 'Sản phẩm HOT', icon: '🔥', path: '/products/hot' }
      ]
    },
    {
      id: 'orders',
      title: 'Đơn hàng',
      icon: '🛒',
      path: '/orders',
      children: [
        { id: 'orders-list', title: 'Tất cả đơn hàng', icon: '📋', path: '/orders' },
        { id: 'orders-pending', title: 'Chờ xử lý', icon: '⏳', path: '/orders/pending' },
        { id: 'orders-completed', title: 'Hoàn thành', icon: '✅', path: '/orders/completed' }
      ]
    },
    {
      id: 'settings',
      title: 'Cài đặt chung',
      icon: '⚙️',
      path: '/settings',
      children: [
        { id: 'settings-general', title: 'Cài đặt chung', icon: '🔧', path: '/settings/general' },
        { id: 'settings-header', title: 'Header/Footer', icon: '🎨', path: '/settings/header' },
        { id: 'settings-social', title: 'Mạng xã hội', icon: '📱', path: '/settings/social' },
        { id: 'settings-contact', title: 'Thông tin LH', icon: '📞', path: '/settings/contact' }
      ]
    },
    {
      id: 'analytics',
      title: 'Thống kê',
      icon: '📈',
      path: '/analytics',
      children: [
        { id: 'analytics-overview', title: 'Tổng quan', icon: '📊', path: '/analytics' },
        { id: 'analytics-sales', title: 'Doanh thu', icon: '💰', path: '/analytics/sales' },
        { id: 'analytics-products', title: 'Sản phẩm', icon: '📦', path: '/analytics/products' }
      ]
    },
    {
      id: 'system',
      title: 'Hệ thống',
      icon: '🔧',
      path: '/system',
      children: [
        { id: 'system-logs', title: 'Nhật ký', icon: '📝', path: '/system/logs' },
        { id: 'system-backup', title: 'Sao lưu', icon: '💾', path: '/system/backup' },
        { id: 'system-maintenance', title: 'Bảo trì', icon: '🛠️', path: '/system/maintenance' }
      ]
    }
  ];

  const toggleMenu = (menuId: string) => {
    if (expandedMenus.includes(menuId)) {
      setExpandedMenus(expandedMenus.filter(id => id !== menuId));
    } else {
      setExpandedMenus([...expandedMenus, menuId]);
    }
  };

  const handleMenuClick = (item: MenuItem) => {
    if (item.children) {
      toggleMenu(item.id);
    } else {
      navigate(item.path);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">🏪</span>
          {!isCollapsed && (
            <div className="logo-text">
              <h3>Minh Hà</h3>
              <span>Admin Panel</span>
            </div>
          )}
        </div>
        <button className="sidebar-collapse-btn" onClick={onToggle}>
          {isCollapsed ? '▶️' : '◀️'}
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-link ${isActive(item.path) ? 'active' : ''} ${
                  item.children ? 'has-children' : ''
                }`}
                onClick={() => handleMenuClick(item)}
                title={isCollapsed ? item.title : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span className="nav-text">{item.title}</span>
                    {item.badge && (
                      <span className="nav-badge">{item.badge}</span>
                    )}
                    {item.children && (
                      <span className={`nav-arrow ${expandedMenus.includes(item.id) ? 'expanded' : ''}`}>
                        ▼
                      </span>
                    )}
                  </>
                )}
              </button>

              {item.children && !isCollapsed && expandedMenus.includes(item.id) && (
                <ul className="nav-submenu">
                  {item.children.map((child) => (
                    <li key={child.id} className="nav-subitem">
                      <button
                        className={`nav-sublink ${isActive(child.path) ? 'active' : ''}`}
                        onClick={() => navigate(child.path)}
                      >
                        <span className="nav-subicon">{child.icon}</span>
                        <span className="nav-subtext">{child.title}</span>
                        {child.badge && (
                          <span className="nav-subbadge">{child.badge}</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="sidebar-info">
            <div className="info-item">
              <span className="info-label">Phiên bản:</span>
              <span className="info-value">v1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Trạng thái:</span>
              <span className="info-value online">🟢 Online</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;