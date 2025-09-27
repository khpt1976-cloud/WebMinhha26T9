import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductModal from '../components/ProductModal';
import BulkActions from '../components/BulkActions';
import productService, { Product, Category } from '../services/productService';
import { useAuth } from '../contexts/AuthContext';
import './Products.css';

interface ProductsProps {
  filter?: string;
}

const Products: React.FC<ProductsProps> = ({ filter: propFilter }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlFilter = queryParams.get('filter');
  const filter = propFilter || urlFilter;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { hasPermission } = useAuth();
  const itemsPerPage = 10;
  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [currentPage, searchTerm, selectedCategory, selectedStatus, filter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        category_id: selectedCategory ? parseInt(selectedCategory) : undefined,
        status: selectedStatus || undefined
      };

      const response = await productService.getProducts(params);
      let filteredProducts = response.data;
      
      // Filter for HOT products if filter prop is 'hot'
      if (filter === 'hot') {
        filteredProducts = response.data.filter(product => product.is_hot === true);
        setTotalProducts(filteredProducts.length);
      } else {
        setTotalProducts(response.pagination?.total || 0);
      }
      
      setProducts(filteredProducts);
    } catch (error: any) {
      setError(error.message || 'Không thể tải danh sách sản phẩm');
      console.error('Load products error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      console.log('Categories loaded:', response);
      setCategories(response.data || []);
    } catch (error: any) {
      console.error('Load categories error:', error);
      setCategories([]);
    }
  };

  // Handle product actions
  const handleDeleteProduct = async (productId: number) => {
    if (!hasPermission('manage_products')) {
      alert('Bạn không có quyền xóa sản phẩm');
      return;
    }

    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await productService.deleteProduct(productId);
        await loadProducts();
      } catch (error: any) {
        alert(error.message || 'Không thể xóa sản phẩm');
      }
    }
  };

  const handleStatusChange = async (productId: number, newStatus: 'active' | 'inactive') => {
    if (!hasPermission('manage_products')) {
      alert('Bạn không có quyền thay đổi trạng thái sản phẩm');
      return;
    }

    try {
      await productService.updateProduct(productId, { status: newStatus });
      await loadProducts();
    } catch (error: any) {
      alert(error.message || 'Không thể cập nhật trạng thái sản phẩm');
    }
  };

  // Pagination
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const paginatedProducts = products;

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(paginatedProducts.filter(p => p.id).map(p => p.id!));
    } else {
      setSelectedProducts([]);
    }
  };

  // Handle individual select
  const handleSelectProduct = (productId: number, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  // Handle bulk actions
  const handleBulkDelete = async (ids: number[]) => {
    try {
      console.log('Bulk delete products:', ids);
      // await Promise.all(ids.map(id => productService.deleteProduct(id)));
      await loadProducts();
      setSelectedProducts([]);
    } catch (error: any) {
      alert(error.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleBulkStatusChange = async (ids: number[], status: 'active' | 'inactive' | 'draft') => {
    try {
      console.log('Bulk status change:', ids, status);
      // await Promise.all(ids.map(id => productService.updateProduct(id, { status })));
      await loadProducts();
      setSelectedProducts([]);
    } catch (error: any) {
      alert(error.message || 'Không thể cập nhật trạng thái');
    }
  };

  const handleBulkCategoryChange = async (ids: number[], categoryId: number) => {
    try {
      console.log('Bulk category change:', ids, categoryId);
      // await Promise.all(ids.map(id => productService.updateProduct(id, { category_id: categoryId })));
      await loadProducts();
      setSelectedProducts([]);
    } catch (error: any) {
      alert(error.message || 'Không thể cập nhật danh mục');
    }
  };

  const handleBulkLabelChange = async (ids: number[], labels: { is_hot?: boolean; is_new?: boolean; is_featured?: boolean }) => {
    try {
      console.log('Bulk label change:', ids, labels);
      // await Promise.all(ids.map(id => productService.updateProduct(id, labels)));
      await loadProducts();
      setSelectedProducts([]);
    } catch (error: any) {
      alert(error.message || 'Không thể cập nhật nhãn');
    }
  };

  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  // Handle add new product
  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges = {
      active: { text: 'Hoạt động', class: 'status-active' },
      inactive: { text: 'Tạm dừng', class: 'status-inactive' },
      out_of_stock: { text: 'Hết hàng', class: 'status-out-of-stock' }
    };
    const badge = badges[status as keyof typeof badges];
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải danh sách sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1>{filter === 'hot' ? 'Sản Phẩm HOT 🔥' : 'Quản Lý Sản Phẩm'}</h1>
          <p>{filter === 'hot' ? 'Danh sách các sản phẩm HOT đang bán chạy' : 'Quản lý toàn bộ sản phẩm của cửa hàng'}</p>
        </div>
        <div className="header-right">
          <button className="btn btn-primary" onClick={handleAddProduct}>
            <i className="icon-plus"></i>
            Thêm Sản Phẩm
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{products.length}</h3>
            <p>Tổng sản phẩm</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{products.filter(p => p.status === 'active').length}</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <h3>{products.filter(p => p.is_hot).length}</h3>
            <p>Sản phẩm HOT</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <h3>{products.filter(p => p.stock_quantity < 10).length}</h3>
            <p>Sắp hết hàng</p>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      <BulkActions
        selectedItems={selectedProducts}
        onClearSelection={() => setSelectedProducts([])}
        onBulkDelete={handleBulkDelete}
        onBulkStatusChange={handleBulkStatusChange}
        onBulkCategoryChange={handleBulkCategoryChange}
        onBulkLabelChange={handleBulkLabelChange}
        categories={categories.map(c => ({ id: c.id!, name: c.name }))}
      />

      {/* Filters */}
      <div className="filters-section">
        <div className="filters-row">
          <div className="search-box">
            <i className="icon-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(category => (
              <option key={category.id} value={category.id!.toString()}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Tạm dừng</option>
            <option value="out_of_stock">Hết hàng</option>
          </select>
        </div>


      </div>

      {/* Products Table */}
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>Sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Kho</th>
              <th>Trạng thái</th>
              <th>Cập nhật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map(product => (
              <tr key={product.id || `product-${Math.random()}`}>
                <td>
                  <input
                    type="checkbox"
                    checked={product.id ? selectedProducts.includes(product.id) : false}
                    onChange={(e) => product.id && handleSelectProduct(product.id, e.target.checked)}
                  />
                </td>
                <td>
                  <div className="product-info">
                    <div className="product-image">
                      <img src={product.images[0] || '/images/placeholder.jpg'} alt={product.name} />
                      {product.is_hot && <span className="hot-badge">HOT</span>}
                    </div>
                    <div className="product-details">
                      <h4>{product.name}</h4>
                      <p>{product.description.substring(0, 60)}...</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-tag">{product.category_name}</span>
                </td>
                <td>
                  <div className="price-info">
                    <span className="current-price">{formatPrice(product.current_price)}</span>
                    {product.original_price && product.original_price > product.current_price && (
                      <span className="original-price">{formatPrice(product.original_price)}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`stock-info ${product.stock_quantity < 10 ? 'low-stock' : ''}`}>
                    {product.stock_quantity}
                  </span>
                </td>
                <td>
                  {getStatusBadge(product.status)}
                </td>
                <td>
                  <span className="date-info">
                    {product.updated_at ? new Date(product.updated_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-icon btn-edit"
                      onClick={() => handleEditProduct(product)}
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-icon btn-view"
                      title="Xem chi tiết"
                    >
                      👁️
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      title="Xóa"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>Không tìm thấy sản phẩm</h3>
            <p>Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
            <button className="btn btn-primary" onClick={handleAddProduct}>
              Thêm Sản Phẩm Đầu Tiên
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Trước
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button 
            className="btn btn-outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Sau
          </button>
        </div>
      )}

      {/* Product Modal */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        product={editingProduct}
        categories={categories}
        onSave={async (product) => {
          try {
            if (editingProduct) {
              // Update existing product
              console.log('Updating product:', editingProduct.id, product);
              // await productService.updateProduct(editingProduct.id!, product);
              await loadProducts(); // Reload products from API
            } else {
              // Create new product
              console.log('Creating new product:', product);
              // await productService.createProduct(product);
              await loadProducts(); // Reload products from API
            }
          } catch (error: any) {
            console.error('Error saving product:', error);
            alert(error.message || 'Không thể lưu sản phẩm');
            throw error; // Re-throw to prevent modal from closing
          }
        }}
      />
    </div>
  );
};

export default Products;