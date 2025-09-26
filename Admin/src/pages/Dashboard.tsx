import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import dashboardService, { DashboardOverview, RecentActivity } from '../services/dashboardService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Loading dashboard data...');
      console.log('🔑 Token in localStorage:', localStorage.getItem('admin_token') ? 'EXISTS' : 'MISSING');
      
      const [overviewData, activitiesData] = await Promise.all([
        dashboardService.getOverview(),
        dashboardService.getRecentActivity(5)
      ]);
      
      console.log('✅ Dashboard data loaded:', { overviewData, activitiesData });
      setOverview(overviewData);
      setRecentActivities(activitiesData);
    } catch (error: any) {
      console.error('❌ Dashboard load error:', error);
      console.error('❌ Error details:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      setError(error.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ color: '#e74c3c', marginBottom: '20px' }}>{error}</div>
        <button className="btn btn-primary" onClick={loadDashboardData}>
          Thử lại
        </button>
      </div>
    );
  }
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Tổng quan hệ thống Cửa Hàng Minh Hà - Chào mừng {user?.full_name || user?.username}</p>
        <div className="breadcrumb">
          <span className="breadcrumb-item">🏠 Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">Dashboard</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            🛍️
          </div>
          <div className="stat-content">
            <h3>{formatNumber(overview?.product_stats?.total || 0)}</h3>
            <p>Tổng sản phẩm</p>
            <small style={{ color: '#666' }}>
              {overview?.product_stats?.active || 0} đang hoạt động
            </small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon success">
            👥
          </div>
          <div className="stat-content">
            <h3>{formatNumber(overview?.user_stats?.total || 0)}</h3>
            <p>Người dùng</p>
            <small style={{ color: '#666' }}>
              {overview?.user_stats?.pending || 0} chờ duyệt
            </small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon warning">
            📊
          </div>
          <div className="stat-content">
            <h3>{formatNumber(overview?.activity_stats?.recent_activities || 0)}</h3>
            <p>Hoạt động gần đây</p>
            <small style={{ color: '#666' }}>
              {overview?.activity_stats?.recent_logins || 0} đăng nhập
            </small>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon danger">
            🏷️
          </div>
          <div className="stat-content">
            <h3>{formatNumber(overview?.product_stats?.categories || 0)}</h3>
            <p>Danh mục</p>
            <small style={{ color: '#666' }}>
              {overview?.product_stats?.out_of_stock || 0} hết hàng
            </small>
          </div>
        </div>
      </div>

      {/* Welcome Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Chào mừng đến với Admin Panel</h3>
        </div>
        <div className="card-body">
          <p>Đây là trang quản trị cho website <strong>Cửa Hàng Minh Hà</strong>. Bạn có thể quản lý sản phẩm, người dùng và cài đặt website từ đây.</p>
          
          <div style={{ marginTop: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary">
              ➕ Thêm sản phẩm mới
            </button>
            <button className="btn btn-success">
              👥 Quản lý người dùng
            </button>
            <button className="btn btn-warning">
              📊 Xem thống kê
            </button>
            <button className="btn btn-outline">
              ⚙️ Cài đặt hệ thống
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Hoạt động gần đây</h3>
          <button className="btn btn-outline" onClick={loadDashboardData}>
            🔄 Làm mới
          </button>
        </div>
        <div className="card-body">
          {recentActivities.length > 0 ? (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Hoạt động</th>
                    <th>Người thực hiện</th>
                    <th>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.map(activity => (
                    <tr key={activity.id}>
                      <td>{formatDate(activity.created_at)}</td>
                      <td>
                        <strong>{activity.action}</strong> {activity.resource_type}
                        {activity.description && (
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            {activity.description}
                          </div>
                        )}
                      </td>
                      <td>{activity.username}</td>
                      <td style={{ fontSize: '12px', color: '#666' }}>
                        {activity.ip_address}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p>Chưa có hoạt động nào gần đây</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Thao tác nhanh</h3>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '20px', border: '2px dashed #dee2e6', borderRadius: '8px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📦</div>
              <h4>Quản lý kho</h4>
              <p style={{ color: '#6c757d', fontSize: '14px' }}>Kiểm tra tồn kho sản phẩm</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '20px', border: '2px dashed #dee2e6', borderRadius: '8px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>📈</div>
              <h4>Báo cáo</h4>
              <p style={{ color: '#6c757d', fontSize: '14px' }}>Xem báo cáo doanh thu</p>
            </div>
            
            <div style={{ textAlign: 'center', padding: '20px', border: '2px dashed #dee2e6', borderRadius: '8px' }}>
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔧</div>
              <h4>Bảo trì</h4>
              <p style={{ color: '#6c757d', fontSize: '14px' }}>Công cụ bảo trì hệ thống</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;