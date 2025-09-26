import api from './api';

export interface LoginRequest {
  username: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    phone: string;
    avatar_url: string | null;
    status: string;
    is_super_admin: boolean;
    role: {
      id: number;
      name: string;
      display_name: string;
      description: string;
    };
    permissions: string[];
    last_login: string;
    created_at: string;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  status: string;
  is_super_admin: boolean;
  role: {
    id: number;
    name: string;
    display_name: string;
    description: string;
  };
  permissions: string[];
  last_login: string;
  created_at: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

class AuthService {
  private tokenKey = 'admin_token';
  private refreshTokenKey = 'admin_refresh_token';
  private userKey = 'admin_user';

  // Login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('🔐 Attempting login with:', { username: credentials.username });
      console.log('🌐 API Base URL:', api.defaults.baseURL);
      
      const response = await api.post('/api/v1/auth/login', credentials);
      console.log('✅ Login response:', response.status, response.data);
      
      const data = response.data;
      
      // Store tokens and user info
      localStorage.setItem(this.tokenKey, data.access_token);
      localStorage.setItem(this.refreshTokenKey, data.refresh_token);
      localStorage.setItem(this.userKey, JSON.stringify(data.user));
      
      return data;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      this.clearAuthData();
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get('/api/v1/auth/me');
      const user = response.data.user;
      localStorage.setItem(this.userKey, JSON.stringify(user));
      return user;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user info');
    }
  }

  // Refresh token
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem(this.refreshTokenKey);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/api/v1/auth/refresh', {
        refresh_token: refreshToken
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;
      
      localStorage.setItem(this.tokenKey, access_token);
      if (newRefreshToken) {
        localStorage.setItem(this.refreshTokenKey, newRefreshToken);
      }

      return access_token;
    } catch (error: any) {
      this.clearAuthData();
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  // Change password
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      await api.post('/api/v1/auth/change-password', data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  }

  // Check auth status
  async checkAuthStatus(): Promise<boolean> {
    try {
      const response = await api.get('/api/v1/auth/status');
      return response.data.authenticated;
    } catch (error) {
      return false;
    }
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Get stored user
  getUser(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Check if user has permission
  hasPermission(permission: string): boolean {
    const user = this.getUser();
    return user?.permissions?.includes(permission) || user?.is_super_admin || false;
  }

  // Check if user has role
  hasRole(roleName: string): boolean {
    const user = this.getUser();
    return user?.role?.name === roleName || user?.is_super_admin || false;
  }

  // Clear auth data
  clearAuthData(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }
}

export default new AuthService();