// User types
export interface User {
  id: number;
  username: string;
  email: string;
  role_id: number;
  status: 'active' | 'pending' | 'inactive';
  created_at: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: string[];
}

// Product types
export interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  original_price: string;
  image: string;
  category: string;
  rating: number;
  is_hot: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}