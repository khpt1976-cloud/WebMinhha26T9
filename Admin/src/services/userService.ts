import api from './api';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  status: 'active' | 'pending' | 'inactive';
  is_super_admin: boolean;
  role: {
    id: number;
    name: string;
    display_name: string;
    description: string;
  };
  permissions: string[];
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface PendingUser {
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

export interface Role {
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

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface UserFilters {
  search?: string;
  status?: string;
  role?: string;
  page?: number;
  per_page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
}

class UserService {
  // User Management
  async getUsers(filters: UserFilters = {}): Promise<ApiResponse<User[]>> {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);
      if (filters.role) params.append('role', filters.role);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/api/v1/users?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<ApiResponse<User>> {
    try {
      const response = await api.get(`/api/v1/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await api.post('/api/v1/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await api.put(`/api/v1/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/api/v1/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async updateUserStatus(id: number, status: 'active' | 'inactive'): Promise<ApiResponse<User>> {
    try {
      const response = await api.patch(`/api/v1/users/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  async bulkUpdateUserStatus(userIds: number[], status: 'active' | 'inactive'): Promise<ApiResponse<void>> {
    try {
      const response = await api.patch('/api/v1/users/bulk-status', { user_ids: userIds, status });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating user status:', error);
      throw error;
    }
  }

  // Pending Users Management
  async getPendingUsers(): Promise<ApiResponse<PendingUser[]>> {
    try {
      const response = await api.get('/api/v1/users/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending users:', error);
      throw error;
    }
  }

  async approveUser(id: number, note?: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.post(`/api/v1/users/${id}/approve`, { note });
      return response.data;
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  }

  async rejectUser(id: number, reason: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.post(`/api/v1/users/${id}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
  }

  async bulkApproveUsers(userIds: number[], note?: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.post('/api/v1/users/bulk-approve', { user_ids: userIds, note });
      return response.data;
    } catch (error) {
      console.error('Error bulk approving users:', error);
      throw error;
    }
  }

  async bulkRejectUsers(userIds: number[], reason: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.post('/api/v1/users/bulk-reject', { user_ids: userIds, reason });
      return response.data;
    } catch (error) {
      console.error('Error bulk rejecting users:', error);
      throw error;
    }
  }

  // Role Management
  async getRoles(): Promise<ApiResponse<Role[]>> {
    try {
      const response = await api.get('/api/v1/users/roles');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  }

  async getRoleById(id: number): Promise<ApiResponse<Role>> {
    try {
      const response = await api.get(`/api/v1/users/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role:', error);
      throw error;
    }
  }

  async createRole(roleData: Partial<Role>): Promise<ApiResponse<Role>> {
    try {
      const response = await api.post('/api/v1/users/roles', roleData);
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  async updateRole(id: number, roleData: Partial<Role>): Promise<ApiResponse<Role>> {
    try {
      const response = await api.put(`/api/v1/users/roles/${id}`, roleData);
      return response.data;
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async deleteRole(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/api/v1/users/roles/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }

  // Permission Management
  async getPermissions(): Promise<ApiResponse<Permission[]>> {
    try {
      const response = await api.get('/api/v1/users/permissions');
      return response.data;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      throw error;
    }
  }

  async assignRoleToUser(userId: number, roleId: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.post(`/api/v1/users/${userId}/assign-role`, { role_id: roleId });
      return response.data;
    } catch (error) {
      console.error('Error assigning role to user:', error);
      throw error;
    }
  }

  async removeRoleFromUser(userId: number, roleId: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/api/v1/users/${userId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      console.error('Error removing role from user:', error);
      throw error;
    }
  }

  // User Statistics
  async getUserStats(): Promise<ApiResponse<{
    total_users: number;
    active_users: number;
    pending_users: number;
    inactive_users: number;
    new_users_today: number;
    new_users_this_week: number;
    new_users_this_month: number;
  }>> {
    try {
      const response = await api.get('/api/v1/users/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }
}

export default new UserService();