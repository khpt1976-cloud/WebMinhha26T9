// Product Service - API integration for Product Management
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Response interfaces (from backend actual response)
export interface ApiProduct {
  id: number;
  title: string;
  image: string;
  price: string;
  original_price: string;
  rating: number;
  category: string;
}

// Admin Panel Product interface
export interface Product {
  id?: number;
  name: string;
  slug?: string;
  description: string;
  short_description?: string;
  original_price: number;
  sale_price?: number;
  current_price: number;
  category_id: number;
  category_name?: string;
  images: string[];
  stock_quantity: number;
  status: 'active' | 'inactive' | 'draft';
  is_featured: boolean;
  is_hot: boolean;
  is_new: boolean;
  sku?: string;
  weight?: number;
  dimensions?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper function to parse price string to number
const parsePrice = (priceStr: string): number => {
  return parseInt(priceStr.replace(/[^\d]/g, '')) || 0;
};

// Adapter function to convert API response to Product
const adaptApiProductToProduct = (apiProduct: ApiProduct): Product => {
  const originalPrice = parsePrice(apiProduct.original_price);
  const currentPrice = parsePrice(apiProduct.price);
  
  return {
    id: apiProduct.id,
    name: apiProduct.title,
    slug: apiProduct.category,
    description: `Mô tả chi tiết cho ${apiProduct.title}`,
    short_description: `${apiProduct.title} - Sản phẩm chất lượng cao`,
    original_price: originalPrice,
    sale_price: currentPrice < originalPrice ? currentPrice : 0,
    current_price: currentPrice,
    category_id: 1, // Default category
    category_name: apiProduct.category,
    images: apiProduct.image ? [apiProduct.image] : [],
    stock_quantity: Math.floor(Math.random() * 100) + 10, // Mock stock
    status: 'active' as 'active' | 'inactive' | 'draft',
    is_featured: Math.random() > 0.7,
    is_hot: Math.random() > 0.8,
    is_new: Math.random() > 0.6,
    sku: `SKU-${apiProduct.id}`,
    weight: Math.random() * 5 + 0.5,
    dimensions: '30x20x10 cm',
    meta_title: apiProduct.title,
    meta_description: `Mua ${apiProduct.title} chất lượng cao, giá tốt`,
    meta_keywords: `${apiProduct.title}, ${apiProduct.category}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

// API Category interface (from backend)
export interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  products: ApiProduct[];
}

// Admin Panel Category interface
export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url?: string;
  parent_id?: number;
  sort_order: number;
  is_active: boolean;
  product_count?: number;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at?: string;
  updated_at?: string;
}

// Adapter function for categories
const adaptApiCategoryToCategory = (apiCategory: ApiCategory): Category => {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    slug: apiCategory.slug,
    description: `Danh mục ${apiCategory.name}`,
    sort_order: apiCategory.id,
    is_active: true,
    product_count: apiCategory.products?.length || 0,
    meta_title: apiCategory.name,
    meta_description: `Danh mục ${apiCategory.name} - Sản phẩm chất lượng`,
    meta_keywords: apiCategory.name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  reservedStock: number;
  availableStock: number;
  lastRestocked: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked';
  price: number;
  totalValue: number;
}

export interface StockHistory {
  id: number;
  productId: number;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  date: string;
  user: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Product Service Class
class ProductService {
  // ==================== PRODUCTS ====================
  
  /**
   * Get all products with filters
   */
  async getProducts(filters: ProductFilters = {}): Promise<ApiResponse<Product[]>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/api/products?${params.toString()}`);
      
      // Convert API response to expected format
      const apiProducts: ApiProduct[] = Array.isArray(response.data) ? response.data : [];
      const products: Product[] = apiProducts.map(adaptApiProductToProduct);
      
      return {
        data: products,
        message: 'Products fetched successfully',
        success: true,
        pagination: {
          page: filters.page || 1,
          limit: filters.limit || 10,
          total: products.length,
          totalPages: Math.ceil(products.length / (filters.limit || 10))
        }
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get product by ID
   */
  async getProduct(id: number): Promise<ApiResponse<Product>> {
    try {
      const response = await api.get(`/api/v1/public/products/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create new product
   */
  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    try {
      const response = await api.post('/api/v1/products/', product);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update product
   */
  async updateProduct(id: number, product: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      const response = await api.put(`/api/v1/products/${id}/`, product);
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete product
   */
  async deleteProduct(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`/api/v1/products/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Bulk update products
   */
  async bulkUpdateProducts(productIds: number[], updates: Partial<Product>): Promise<ApiResponse<Product[]>> {
    try {
      const response = await api.patch('/api/v1/products/bulk/', {
        productIds,
        updates
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating products:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Bulk delete products
   */
  async bulkDeleteProducts(productIds: number[]): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete('/api/v1/products/bulk/', {
        data: { productIds }
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      throw this.handleError(error);
    }
  }

  // ==================== CATEGORIES ====================

  /**
   * Get all categories
   */
  async getCategories(): Promise<ApiResponse<Category[]>> {
    try {
      const response = await api.get('/api/categories');
      
      // Convert API response to expected format
      const apiCategories: ApiCategory[] = Array.isArray(response.data) ? response.data : [];
      const categories: Category[] = apiCategories.map(adaptApiCategoryToCategory);
      
      return {
        data: categories,
        message: 'Categories fetched successfully',
        success: true
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get category by ID
   */
  async getCategory(id: number): Promise<ApiResponse<Category>> {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Create new category
   */
  async createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'productCount'>): Promise<ApiResponse<Category>> {
    try {
      // Only send fields that backend expects
      const createData = {
        name: category.name,
        slug: category.slug,
        description: category.description,
        parent_id: category.parent_id,
        sort_order: category.sort_order,
        meta_title: category.meta_title,
        meta_description: category.meta_description,
        meta_keywords: category.meta_keywords,
        image_url: category.image_url,
        is_active: category.is_active
      };
      
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(createData).filter(([_, value]) => value !== undefined)
      );
      
      const response = await api.post('/api/v1/products/categories', cleanData);
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update category
   */
  async updateCategory(id: number, category: Partial<Category>): Promise<ApiResponse<Category>> {
    try {
      // Only send fields that backend expects
      const updateData = {
        name: category.name,
        slug: category.slug,
        description: category.description,
        parent_id: category.parent_id,
        sort_order: category.sort_order,
        meta_title: category.meta_title,
        meta_description: category.meta_description,
        meta_keywords: category.meta_keywords,
        image_url: category.image_url,
        is_active: category.is_active
      };
      
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined)
      );
      
      const response = await api.put(`/api/v1/products/categories/${id}`, cleanData);
      return response.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete category
   */
  async deleteCategory(id: number): Promise<ApiResponse<null>> {
    try {
      console.log('🔗 DELETE URL:', `/api/v1/products/categories/${id}`);
      const response = await api.delete(`/api/v1/products/categories/${id}`);
      console.log('🔗 DELETE Response:', response);
      return response.data;
    } catch (error) {
      console.error('🔗 DELETE Error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update category order
   */
  async updateCategoryOrder(categoryOrders: { id: number; order: number }[]): Promise<ApiResponse<Category[]>> {
    try {
      const response = await api.patch('/categories/order', { categoryOrders });
      return response.data;
    } catch (error) {
      console.error('Error updating category order:', error);
      throw this.handleError(error);
    }
  }

  // ==================== INVENTORY ====================

  /**
   * Get inventory items
   */
  async getInventory(filters: ProductFilters = {}): Promise<ApiResponse<InventoryItem[]>> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await api.get(`/inventory?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update stock
   */
  async updateStock(productId: number, stockData: {
    quantity: number;
    type: 'in' | 'out' | 'adjustment';
    reason: string;
  }): Promise<ApiResponse<InventoryItem>> {
    try {
      const response = await api.patch(`/inventory/${productId}/stock`, stockData);
      return response.data;
    } catch (error) {
      console.error('Error updating stock:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get stock history
   */
  async getStockHistory(productId: number): Promise<ApiResponse<StockHistory[]>> {
    try {
      const response = await api.get(`/inventory/${productId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching stock history:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update stock settings
   */
  async updateStockSettings(productId: number, settings: {
    minStock: number;
    maxStock: number;
  }): Promise<ApiResponse<InventoryItem>> {
    try {
      const response = await api.patch(`/inventory/${productId}/settings`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating stock settings:', error);
      throw this.handleError(error);
    }
  }

  // ==================== IMAGE UPLOAD ====================

  /**
   * Upload single image
   */
  async uploadImage(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Upload multiple images
   */
  async uploadImages(files: File[]): Promise<ApiResponse<{ urls: string[] }>> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`images`, file);
      });

      const response = await api.post('/upload/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading images:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete image
   */
  async deleteImage(imageUrl: string): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete('/upload/image', {
        data: { imageUrl }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting image:', error);
      throw this.handleError(error);
    }
  }

  // ==================== STATISTICS ====================

  /**
   * Get product statistics
   */
  async getProductStats(): Promise<ApiResponse<{
    totalProducts: number;
    activeProducts: number;
    hotProducts: number;
    lowStockProducts: number;
    totalValue: number;
    topCategories: Array<{ name: string; count: number }>;
  }>> {
    try {
      const response = await api.get('/products/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats(): Promise<ApiResponse<{
    totalItems: number;
    totalValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    overstockedCount: number;
  }>> {
    try {
      const response = await api.get('/inventory/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      throw this.handleError(error);
    }
  }

  // ==================== EXPORT/IMPORT ====================

  /**
   * Export products to CSV
   */
  async exportProducts(filters: ProductFilters = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/products/export?${params.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting products:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Import products from CSV
   */
  async importProducts(file: File): Promise<ApiResponse<{
    imported: number;
    errors: Array<{ row: number; error: string }>;
  }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/products/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing products:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Export inventory report
   */
  async exportInventoryReport(): Promise<Blob> {
    try {
      const response = await api.get('/inventory/export', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting inventory report:', error);
      throw this.handleError(error);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      return new Error(message);
    }
    return error;
  }

  /**
   * Format price for display
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  /**
   * Generate product slug
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Validate product data
   */
  validateProduct(product: Partial<Product>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!product.name?.trim()) {
      errors.push('Tên sản phẩm là bắt buộc');
    }

    if (!product.description?.trim()) {
      errors.push('Mô tả sản phẩm là bắt buộc');
    }

    if (!product.current_price || product.current_price <= 0) {
      errors.push('Giá sản phẩm phải lớn hơn 0');
    }

    if (product.original_price && product.original_price <= (product.current_price || 0)) {
      errors.push('Giá gốc phải lớn hơn giá bán');
    }

    if (!product.category_id) {
      errors.push('Vui lòng chọn danh mục');
    }

    if (product.stock_quantity !== undefined && product.stock_quantity < 0) {
      errors.push('Số lượng kho không được âm');
    }

    if (!product.images || product.images.length === 0) {
      errors.push('Vui lòng thêm ít nhất 1 hình ảnh');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const productService = new ProductService();
export default productService;