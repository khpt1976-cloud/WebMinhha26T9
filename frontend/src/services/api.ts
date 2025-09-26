import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Utility function to get full image URL
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) {
    return '';
  }
  if (imagePath.startsWith('http')) {
    return imagePath; // Already a full URL
  }
  if (imagePath.startsWith('/static/')) {
    return `${API_BASE_URL}${imagePath}`;
  }
  if (imagePath.startsWith('static/')) {
    return `${API_BASE_URL}/${imagePath}`;
  }
  return imagePath; // Local import or other format
};

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  original_price: number;
  sale_price: number;
  current_price: number;
  category_id: number;
  category_name: string;
  status: string;
  is_featured: boolean;
  is_hot: boolean;
  is_new: boolean;
  stock_quantity: number;
  rating_average: number;
  rating_count: number;
  main_image_url?: string;
  created_at: string;
  updated_at: string;
  
  // Legacy compatibility fields
  title: string;
  image: string;
  price: string;
  rating: number;
  category: string;
}

export interface ProductDetail {
  id: number;
  name: string;
  image: string;
  price?: string;
  originalPrice?: string;
  rating: number;
  category: string;
  description: string;
  features: string[];
  specifications: {
    material?: string;
    size?: string;
    weight?: string;
    color?: string;
    warranty?: string;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  products: Product[];
}

export const apiService = {
  // Lấy tất cả sản phẩm
  async getProducts(): Promise<Product[]> {
    const response = await api.get('/api/v1/public/products/');
    const products = response.data.products || response.data.data || response.data;
    
    // Add legacy compatibility fields
    return products.map((product: Product) => ({
      ...product,
      title: product.name || '',
      image: product.main_image_url || '',
      price: product.current_price?.toString() || product.sale_price?.toString() || product.original_price?.toString() || '0',
      rating: product.rating_average || 0,
      category: product.category_name || ''
    }));
  },

  // Lấy sản phẩm theo ID
  async getProduct(id: number): Promise<Product> {
    const response = await api.get(`/api/v1/public/products/${id}/`);
    const product = response.data.data || response.data;
    
    // Add legacy compatibility fields
    return {
      ...product,
      title: product.name || '',
      image: product.main_image_url || '',
      price: product.current_price?.toString() || product.sale_price?.toString() || product.original_price?.toString() || '0',
      rating: product.rating_average || 0,
      category: product.category_name || ''
    };
  },

  // Lấy chi tiết sản phẩm theo ID
  async getProductById(id: number): Promise<ProductDetail> {
    const response = await api.get(`/api/v1/public/products/${id}/`);
    const product = response.data.data || response.data;
    
    return {
      id: product.id,
      name: product.name,
      image: product.main_image_url || '',
      price: product.current_price?.toString() || product.sale_price?.toString() || product.original_price?.toString() || '0',
      originalPrice: product.original_price?.toString() || '0',
      rating: product.rating_average || 0,
      category: product.category_name || '',
      description: product.description || '',
      features: [], // Default empty array
      specifications: {
        material: product.material || '',
        size: product.dimensions ? JSON.stringify(product.dimensions) : '',
        weight: product.weight?.toString() || '',
        color: product.color || '',
        warranty: '12 tháng' // Default warranty
      }
    };
  },

  // Lấy tất cả danh mục
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/api/v1/public/categories/');
    const categories = response.data.categories || response.data.data || response.data;
    return categories;
  },

  // Lấy danh mục theo slug
  async getCategory(slug: string): Promise<Category> {
    const response = await api.get(`/api/v1/public/categories/${slug}/`);
    const category = response.data.data || response.data;
    return category;
  },

  // Tìm kiếm sản phẩm
  async searchProducts(query: string): Promise<{query: string, results: Product[], total: number}> {
    const response = await api.get(`/api/v1/public/products/?search=${encodeURIComponent(query)}`);
    const products = response.data.products || response.data.data || response.data;
    
    // Add legacy compatibility fields
    const results = products.map((product: Product) => ({
      ...product,
      title: product.name || '',
      image: product.main_image_url || '',
      price: product.current_price?.toString() || product.sale_price?.toString() || product.original_price?.toString() || '0',
      rating: product.rating_average || 0,
      category: product.category_name || ''
    }));
    
    return {
      query,
      results,
      total: results.length
    };
  },
};

// Export individual functions for easier import
export const { getProducts, getProduct, getProductById, getCategories, getCategory, searchProducts } = apiService;

export default apiService;