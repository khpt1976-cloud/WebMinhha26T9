import React, { useState, useEffect } from 'react';
import ImageUpload from './ImageUpload';
import { Category } from '../services/productService';
import './CategoryModal.css';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSave: (category: Category) => void;
  categories: Category[];
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSave,
  categories
}) => {
  const [formData, setFormData] = useState<Category>({
    id: 0,
    name: '',
    slug: '',
    description: '',
    image_url: '',
    parent_id: 0,
    sort_order: 1,
    is_active: true,
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'seo'>('basic');

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          ...category,
          parent_id: category.parent_id || 0,
          meta_title: category.meta_title || '',
          meta_description: category.meta_description || '',
          meta_keywords: category.meta_keywords || ''
        });
      } else {
        setFormData({
          id: 0,
          name: '',
          slug: '',
          description: '',
          image_url: '',
          parent_id: 0,
          sort_order: Math.max(...categories.map(c => c.sort_order || 0), 0) + 1,
          is_active: true,
          meta_title: '',
          meta_description: '',
          meta_keywords: ''
        });
      }
      setErrors({});
      setActiveTab('basic');
    }
  }, [isOpen, category, categories]);

  // Auto-generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'parent_id' || name === 'sort_order') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));

      // Auto-generate slug when name changes
      if (name === 'name' && !category) {
        const slug = generateSlug(value);
        setFormData(prev => ({
          ...prev,
          slug
        }));
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle image changes
  const handleImageChange = (images: string[]) => {
    setFormData(prev => ({
      ...prev,
      image_url: images[0] || ''
    }));
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên danh mục là bắt buộc';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug là bắt buộc';
    } else {
      // Check if slug is unique (excluding current category)
      const existingCategory = categories.find(c => 
        c.slug === formData.slug && c.id !== category?.id
      );
      if (existingCategory) {
        newErrors.slug = 'Slug đã tồn tại';
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả danh mục là bắt buộc';
    }

    if (formData.sort_order < 1) {
      newErrors.sort_order = 'Thứ tự phải lớn hơn 0';
    }

    // Check for circular parent reference
    if (formData.parent_id && category?.id) {
      if (formData.parent_id === category.id) {
        newErrors.parent_id = 'Danh mục không thể là cha của chính nó';
      }
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
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get available parent categories (excluding current category and its children)
  const availableParents = categories.filter(c => 
    c.id !== category?.id && c.parent_id !== category?.id
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content category-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
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
                    <label htmlFor="name">Tên danh mục *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={errors.name ? 'error' : ''}
                      placeholder="Nhập tên danh mục"
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="slug">Slug *</label>
                    <input
                      type="text"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      className={errors.slug ? 'error' : ''}
                      placeholder="slug-danh-muc"
                    />
                    {errors.slug && <span className="error-message">{errors.slug}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Mô tả *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={errors.description ? 'error' : ''}
                    rows={4}
                    placeholder="Mô tả về danh mục sản phẩm"
                  />
                  {errors.description && <span className="error-message">{errors.description}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="parent_id">Danh mục cha</label>
                    <select
                      id="parent_id"
                      name="parent_id"
                      value={formData.parent_id}
                      onChange={handleInputChange}
                      className={errors.parent_id ? 'error' : ''}
                    >
                      <option value={0}>Không có (Danh mục gốc)</option>
                      {availableParents.map(parent => (
                        <option key={parent.id} value={parent.id}>
                          {parent.name}
                        </option>
                      ))}
                    </select>
                    {errors.parent_id && <span className="error-message">{errors.parent_id}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="sort_order">Thứ tự sắp xếp *</label>
                    <input
                      type="number"
                      id="sort_order"
                      name="sort_order"
                      value={formData.sort_order}
                      onChange={handleInputChange}
                      className={errors.sort_order ? 'error' : ''}
                      min="1"
                      placeholder="1"
                    />
                    {errors.sort_order && <span className="error-message">{errors.sort_order}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    <span>Kích hoạt danh mục</span>
                  </label>
                </div>

                {/* Image Upload */}
                <div className="form-group">
                  <label>Hình ảnh danh mục</label>
                  <ImageUpload
                    images={formData.image_url ? [formData.image_url] : []}
                    onChange={handleImageChange}
                    maxImages={1}
                    maxFileSize={2}
                  />
                </div>
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
                    placeholder="Tiêu đề SEO cho danh mục"
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
                    placeholder="Mô tả SEO cho danh mục"
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
              {loading ? 'Đang lưu...' : (category ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;