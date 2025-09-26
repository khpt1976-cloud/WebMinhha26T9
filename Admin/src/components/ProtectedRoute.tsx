import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
  role?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  permission, 
  role 
}) => {
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
          Đang kiểm tra quyền truy cập...
        </div>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check permission if specified
  if (permission && !hasPermission(permission)) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚫</div>
        <h2 style={{ color: '#e74c3c', marginBottom: '10px' }}>Không có quyền truy cập</h2>
        <p style={{ color: '#666', textAlign: 'center', maxWidth: '400px' }}>
          Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên để được cấp quyền.
        </p>
        <button 
          onClick={() => window.history.back()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Check role if specified
  if (role && !hasRole(role)) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚫</div>
        <h2 style={{ color: '#e74c3c', marginBottom: '10px' }}>Không đủ quyền hạn</h2>
        <p style={{ color: '#666', textAlign: 'center', maxWidth: '400px' }}>
          Trang này yêu cầu vai trò "{role}". Bạn không có vai trò phù hợp để truy cập.
        </p>
        <button 
          onClick={() => window.history.back()}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;