import React, { useState, useEffect } from 'react';
import CategoryModal from '../components/CategoryModal';
import { productService, Category } from '../services/productService';
import './Categories.css';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // Load categories from API
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await productService.getCategories();
      console.log('Categories loaded from API:', response);
      setCategories(response.data || []);
    } catch (error: any) {
      console.error('Load categories error:', error);
      setError('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === '' || 
                         (selectedStatus === 'active' && category.is_active) ||
                         (selectedStatus === 'inactive' && !category.is_active);
    return matchesSearch && matchesStatus;
  });

  // Sort categories by sort_order
  const sortedCategories = [...filteredCategories].sort((a, b) => a.sort_order - b.sort_order);

  // Handle category actions
  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    if (category.product_count && category.product_count > 0) {
      alert(`Không thể xóa danh mục "${category.name}" vì còn ${category.product_count} sản phẩm`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      try {
        // await productService.deleteCategory(categoryId);
        setCategories(categories.filter(c => c.id !== categoryId));
        console.log('Deleted category:', categoryId);
      } catch (error: any) {
        alert(error.message || 'Không thể xóa danh mục');
      }
    }
  };

  const handleStatusChange = async (categoryId: number, newStatus: boolean) => {
    try {
      // await productService.updateCategory(categoryId, { is_active: newStatus });
      setCategories(categories.map(c =>
        c.id === categoryId ? { ...c, is_active: newStatus } : c
      ));
      console.log('Updated category status:', categoryId, newStatus);
    } catch (error: any) {
      alert(error.message || 'Không thể cập nhật trạng thái danh mục');
    }
  };

  const handleSaveCategory = async (categoryData: Category) => {
    try {
      if (editingCategory) {
        // Update existing category
        // const updatedCategory = await productService.updateCategory(editingCategory.id!, categoryData);
        const updatedCategory = { 
          ...categoryData, 
          id: editingCategory.id,
          created_at: editingCategory.created_at,
          updated_at: new Date().toISOString()
        };
        setCategories(categories.map(c => c.id === editingCategory.id ? updatedCategory : c));
        console.log('Updated category:', updatedCategory);
      } else {
        // Create new category
        // const newCategory = await productService.createCategory(categoryData);
        const newCategory = { 
          ...categoryData, 
          id: Math.max(...categories.map(c => c.id || 0), 0) + 1,
          product_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setCategories([...categories, newCategory]);
        console.log('Created category:', newCategory);
      }
      await loadCategories(); // Reload to get fresh data
    } catch (error: any) {
      alert(error.message || 'Không thể lưu danh mục');
      throw error;
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, categoryId: number) => {
    setDraggedItem(categoryId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === targetId) return;

    const draggedCategory = categories.find(c => c.id === draggedItem);
    const targetCategory = categories.find(c => c.id === targetId);
    
    if (!draggedCategory || !targetCategory) return;

    // Swap sort orders
    const newCategories = categories.map(category => {
      if (category.id === draggedItem) {
        return { ...category, sort_order: targetCategory.sort_order };
      } else if (category.id === targetId) {
        return { ...category, sort_order: draggedCategory.sort_order };
      }
      return category;
    });

    setCategories(newCategories);
    setDraggedItem(null);
    
    console.log('Reordered categories:', draggedItem, targetId);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="categories-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh mục...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Quản lý danh mục</h1>
          <p>Quản lý danh mục sản phẩm và phân cấp</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddCategory}>
          <i className="fas fa-plus"></i>
          Thêm danh mục
        </button>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
          <button onClick={loadCategories} className="btn btn-sm btn-outline">
            Thử lại
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Categories Table */}
      <div className="table-container">
        <table className="categories-table">
          <thead>
            <tr>
              <th>Thứ tự</th>
              <th>Danh mục</th>
              <th>Slug</th>
              <th>Sản phẩm</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories.map((category) => (
              <tr
                key={category.id}
                draggable
                onDragStart={(e) => handleDragStart(e, category.id!)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, category.id!)}
                className={draggedItem === category.id ? 'dragging' : ''}
              >
                <td>
                  <div className="drag-handle">
                    <i className="fas fa-grip-vertical"></i>
                    <span>{category.sort_order}</span>
                  </div>
                </td>
                <td>
                  <div className="category-info">
                    {category.image_url && (
                      <img 
                        src={category.image_url} 
                        alt={category.name}
                        className="category-image"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <div className="category-name">{category.name}</div>
                      <div className="category-description">{category.description}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <code className="slug">{category.slug}</code>
                </td>
                <td>
                  <span className="product-count">
                    {category.product_count || 0} sản phẩm
                  </span>
                </td>
                <td>
                  <label className="status-toggle">
                    <input
                      type="checkbox"
                      checked={category.is_active}
                      onChange={(e) => handleStatusChange(category.id!, e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    <span className="status-text">
                      {category.is_active ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </label>
                </td>
                <td>{formatDate(category.created_at)}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleEditCategory(category)}
                      title="Chỉnh sửa"
                    >
                      ✏️ Sửa
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteCategory(category.id!)}
                      title="Xóa"
                      disabled={!!(category.product_count && category.product_count > 0)}
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedCategories.length === 0 && (
          <div className="empty-state">
            <i className="fas fa-folder-open"></i>
            <h3>Không có danh mục nào</h3>
            <p>
              {searchTerm || selectedStatus 
                ? 'Không tìm thấy danh mục phù hợp với bộ lọc'
                : 'Chưa có danh mục nào được tạo'
              }
            </p>
            {!searchTerm && !selectedStatus && (
              <button className="btn btn-primary" onClick={handleAddCategory}>
                <i className="fas fa-plus"></i>
                Thêm danh mục đầu tiên
              </button>
            )}
          </div>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        category={editingCategory}
        categories={categories}
        onSave={handleSaveCategory}
      />
    </div>
  );
};

export default Categories;