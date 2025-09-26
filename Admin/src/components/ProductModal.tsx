import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import ImageUpload from './ImageUpload';
import { Product, Category } from '../services/productService';
import './ProductModal.css';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSave: (product: Product) => void;
  categories: Category[];
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onSave,
  categories
}) => {
  const [formData, setFormData] = useState<Product>({
    name: '',
    description: '',
    short_description: '',
    original_price: 0,
    sale_price: 0,
    current_price: 0,
    category_id: 0,
    images: [],
    stock_quantity: 0,
    status: 'active',
    is_featured: false,
    is_hot: false,
    is_new: false,
    sku: '',
    weight: 0,
    dimensions: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'seo' | 'images'>('basic');

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          ...product,
          sale_price: product.sale_price || 0,
          short_description: product.short_description || '',
          sku: product.sku || '',
          weight: product.weight || 0,
          dimensions: product.dimensions || '',
          meta_title: product.meta_title || '',
          meta_description: product.meta_description || '',
          meta_keywords: product.meta_keywords || ''
        });
      } else {
        setFormData({
          name: '',
          description: '',
          short_description: '',
          original_price: 0,
          sale_price: 0,
          current_price: 0,
          category_id: 0,
          images: [],
          stock_quantity: 0,
          status: 'active',
          is_featured: false,
          is_hot: false,
          is_new: false,
          sku: '',
          weight: 0,
          dimensions: '',
          meta_title: '',
          meta_description: '',
          meta_keywords: ''
        });
      }
      setErrors({});
      setActiveTab('basic');
    }
  }, [isOpen, product]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'category_id') {
      setFormData(prev => ({
        ...prev,
        category_id: parseInt(value) || 0
      }));
    } else if (['original_price', 'sale_price', 'current_price', 'stock_quantity', 'weight'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle rich text editor change
  const handleDescriptionChange = (data: string) => {
    setFormData(prev => ({
      ...prev,
      description: data
    }));
    
    if (errors.description) {
      setErrors(prev => ({
        ...prev,
        description: ''
      }));
    }
  };

  // Handle image changes
  const handleImagesChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      images
    }));
  };

  // Auto-calculate current price
  useEffect(() => {
    const salePrice = formData.sale_price || 0;
    const originalPrice = formData.original_price || 0;
    
    setFormData(prev => ({
      ...prev,
      current_price: salePrice > 0 ? salePrice : originalPrice
    }));
  }, [formData.sale_price, formData.original_price]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên sản phẩm là bắt buộc';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả sản phẩm là bắt buộc';
    }

    if (formData.original_price <= 0) {
      newErrors.original_price = 'Giá gốc phải lớn hơn 0';
    }

    if (formData.sale_price && formData.sale_price >= formData.original_price) {
      newErrors.sale_price = 'Giá sale phải nhỏ hơn giá gốc';
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Vui lòng chọn danh mục';
    }

    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = 'Số lượng kho không được âm';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Tab Navigation */}
        <div className="modal-tabs">
          <button 
            className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            Thông tin cơ bản
          </button>
          <button 
            className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Chi tiết
          </button>
          <button 
            className={`tab-btn ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => setActiveTab('images')}
          >
            Hình ảnh
          </button>
          <button 
            className={`tab-btn ${activeTab === 'seo' ? 'active' : ''}`}
            onClick={() => setActiveTab('seo')}
          >
            SEO
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            
            {/* Basic Information Tab */}
            {activeTab === 'basic' && (
              <div className="tab-content">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Tên sản phẩm *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={errors.name ? 'error' : ''}
                      placeholder="Nhập tên sản phẩm"
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="short_description">Mô tả ngắn</label>
                    <textarea
                      id="short_description"
                      name="short_description"
                      value={formData.short_description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Mô tả ngắn gọn về sản phẩm"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Mô tả chi tiết *</label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    placeholder="Nhập mô tả chi tiết sản phẩm..."
                  />
                  {errors.description && <span className="error-message">{errors.description}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category_id">Danh mục *</label>
                    <select
                      id="category_id"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className={errors.category_id ? 'error' : ''}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && <span className="error-message">{errors.category_id}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Trạng thái</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Hoạt động</option>
                      <option value="inactive">Không hoạt động</option>
                      <option value="draft">Nháp</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="original_price">Giá gốc (VNĐ) *</label>
                    <input
                      type="number"
                      id="original_price"
                      name="original_price"
                      value={formData.original_price}
                      onChange={handleInputChange}
                      className={errors.original_price ? 'error' : ''}
                      min="0"
                      step="1000"
                      placeholder="0"
                    />
                    {errors.original_price && <span className="error-message">{errors.original_price}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="sale_price">Giá sale (VNĐ)</label>
                    <input
                      type="number"
                      id="sale_price"
                      name="sale_price"
                      value={formData.sale_price}
                      onChange={handleInputChange}
                      className={errors.sale_price ? 'error' : ''}
                      min="0"
                      step="1000"
                      placeholder="0"
                    />
                    {errors.sale_price && <span className="error-message">{errors.sale_price}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="stock_quantity">Số lượng kho</label>
                    <input
                      type="number"
                      id="stock_quantity"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleInputChange}
                      className={errors.stock_quantity ? 'error' : ''}
                      min="0"
                      placeholder="0"
                    />
                    {errors.stock_quantity && <span className="error-message">{errors.stock_quantity}</span>}
                  </div>

                  <div className="form-group">
                    <label>Giá hiện tại</label>
                    <input
                      type="text"
                      value={formData.current_price.toLocaleString('vi-VN')}
                      disabled
                      className="readonly"
                    />
                  </div>
                </div>

                {/* Product Labels */}
                <div className="form-group">
                  <label>Nhãn sản phẩm</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_featured"
                        checked={formData.is_featured}
                        onChange={handleInputChange}
                      />
                      <span>Sản phẩm nổi bật</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_hot"
                        checked={formData.is_hot}
                        onChange={handleInputChange}
                      />
                      <span>Sản phẩm HOT</span>
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="is_new"
                        checked={formData.is_new}
                        onChange={handleInputChange}
                      />
                      <span>Sản phẩm mới</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="tab-content">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="sku">Mã SKU</label>
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="Mã sản phẩm"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="weight">Trọng lượng (kg)</label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="dimensions">Kích thước</label>
                  <input
                    type="text"
                    id="dimensions"
                    name="dimensions"
                    value={formData.dimensions}
                    onChange={handleInputChange}
                    placeholder="Dài x Rộng x Cao (cm)"
                  />
                </div>
              </div>
            )}

            {/* Images Tab */}
            {activeTab === 'images' && (
              <div className="tab-content">
                <ImageUpload
                  images={formData.images}
                  onChange={handleImagesChange}
                  maxImages={10}
                  maxFileSize={5}
                />
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="tab-content">
                <div className="form-group">
                  <label htmlFor="meta_title">Meta Title</label>
                  <input
                    type="text"
                    id="meta_title"
                    name="meta_title"
                    value={formData.meta_title}
                    onChange={handleInputChange}
                    placeholder="Tiêu đề SEO"
                    maxLength={60}
                  />
                  <small className="form-hint">
                    {formData.meta_title?.length || 0}/60 ký tự
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="meta_description">Meta Description</label>
                  <textarea
                    id="meta_description"
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Mô tả SEO"
                    maxLength={160}
                  />
                  <small className="form-hint">
                    {formData.meta_description?.length || 0}/160 ký tự
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="meta_keywords">Meta Keywords</label>
                  <input
                    type="text"
                    id="meta_keywords"
                    name="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={handleInputChange}
                    placeholder="từ khóa 1, từ khóa 2, từ khóa 3"
                  />
                  <small className="form-hint">
                    Phân cách bằng dấu phẩy
                  </small>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : (product ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;