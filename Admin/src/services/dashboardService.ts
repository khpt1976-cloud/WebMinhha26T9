import api from './api';

export interface DashboardOverview {
  user_stats: {
    total: number;
    active: number;
    pending: number;
    growth_rate: number;
  };
  product_stats: {
    total: number;
    active: number;
    out_of_stock: number;
    categories: number;
  };
  activity_stats: {
    recent_activities: number;
    recent_logins: number;
    failed_logins: number;
    system_errors: number;
  };
  system_health: {
    status: string;
    uptime: string;
    last_backup: string;
  };
}

export interface UserStats {
  total_users: number;
  active_users: number;
  pending_users: number;
  blocked_users: number;
  growth_rate: number;
  new_users_today: number;
  user_growth: Array<{
    date: string;
    count: number;
  }>;
  login_activity: Array<{
    date: string;
    total_attempts: number;
    successful_logins: number;
  }>;
}

export interface ProductStats {
  total_products: number;
  active_products: number;
  inactive_products: number;
  out_of_stock: number;
  total_categories: number;
  growth_rate: number;
  new_products_today: number;
  product_growth: Array<{
    date: string;
    count: number;
  }>;
  category_distribution: Array<{
    category: string;
    count: number;
  }>;
}

export interface RecentActivity {
  id: number;
  user_id: number;
  username: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  description: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface SystemHealth {
  overall_status: string;
  database_status: string;
  api_status: string;
  storage_status: string;
  uptime: string;
  memory_usage: number;
  cpu_usage: number;
  disk_usage: number;
  active_sessions: number;
  recent_errors: number;
  last_backup: string;
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

export interface TopCategory {
  id: number;
  name: string;
  slug: string;
  product_count: number;
  percentage: number;
}

export interface RecentUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  status: string;
  created_at: string;
  role: {
    name: string;
    display_name: string;
  };
}

class DashboardService {
  // Get dashboard overview
  async getOverview(): Promise<DashboardOverview> {
    try {
      const response = await api.get('/api/v1/dashboard/overview');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard overview');
    }
  }

  // Get user statistics
  async getUserStats(days: number = 30): Promise<UserStats> {
    try {
      const response = await api.get(`/api/v1/dashboard/users/stats?days=${days}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user statistics');
    }
  }

  // Get product statistics
  async getProductStats(days: number = 30): Promise<ProductStats> {
    try {
      const response = await api.get(`/api/v1/dashboard/products/stats?days=${days}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product statistics');
    }
  }

  // Get recent activities
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const response = await api.get(`/api/v1/dashboard/activity/recent?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recent activities');
    }
  }

  // Get system health
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const response = await api.get('/api/v1/dashboard/system/health');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch system health');
    }
  }

  // Get user growth chart data
  async getUserGrowthChart(days: number = 30): Promise<ChartData> {
    try {
      const response = await api.get(`/api/v1/dashboard/charts/user-growth?days=${days}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user growth chart');
    }
  }

  // Get product status chart data
  async getProductStatusChart(): Promise<ChartData> {
    try {
      const response = await api.get('/api/v1/dashboard/charts/product-status');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product status chart');
    }
  }

  // Get top categories
  async getTopCategories(limit: number = 5): Promise<TopCategory[]> {
    try {
      const response = await api.get(`/api/v1/dashboard/top-categories?limit=${limit}`);
      return response.data.categories;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch top categories');
    }
  }

  // Get recent users
  async getRecentUsers(limit: number = 5): Promise<RecentUser[]> {
    try {
      const response = await api.get(`/api/v1/dashboard/recent-users?limit=${limit}`);
      return response.data.users;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recent users');
    }
  }
}

export default new DashboardService();