import React, { useState } from 'react';
import './BulkActions.css';

interface BulkActionsProps {
  selectedItems: number[];
  onClearSelection: () => void;
  onBulkDelete: (ids: number[]) => void;
  onBulkStatusChange: (ids: number[], status: 'active' | 'inactive' | 'draft') => void;
  onBulkCategoryChange: (ids: number[], categoryId: number) => void;
  onBulkLabelChange: (ids: number[], labels: { is_hot?: boolean; is_new?: boolean; is_featured?: boolean }) => void;
  categories: Array<{ id: number; name: string }>;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedItems,
  onClearSelection,
  onBulkDelete,
  onBulkStatusChange,
  onBulkCategoryChange,
  onBulkLabelChange,
  categories
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showLabelMenu, setShowLabelMenu] = useState(false);

  if (selectedItems.length === 0) return null;

  const handleBulkDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedItems.length} sản phẩm đã chọn?`)) {
      onBulkDelete(selectedItems);
    }
  };

  const handleStatusChange = (status: 'active' | 'inactive' | 'draft') => {
    onBulkStatusChange(selectedItems, status);
    setShowStatusMenu(false);
  };

  const handleCategoryChange = (categoryId: number) => {
    onBulkCategoryChange(selectedItems, categoryId);
    setShowCategoryMenu(false);
  };

  const handleLabelChange = (labels: { is_hot?: boolean; is_new?: boolean; is_featured?: boolean }) => {
    onBulkLabelChange(selectedItems, labels);
    setShowLabelMenu(false);
  };

  return (
    <div className="bulk-actions-bar">
      <div className="bulk-info">
        <span className="selected-count">
          Đã chọn {selectedItems.length} sản phẩm
        </span>
        <button 
          className="btn btn-sm btn-outline"
          onClick={onClearSelection}
        >
          Bỏ chọn tất cả
        </button>
      </div>

      <div className="bulk-actions">
        {/* Status Actions */}
        <div className="action-dropdown">
          <button 
            className="btn btn-sm btn-outline dropdown-toggle"
            onClick={() => setShowStatusMenu(!showStatusMenu)}
          >
            <i className="fas fa-toggle-on"></i>
            Trạng thái
          </button>
          {showStatusMenu && (
            <div className="dropdown-menu">
              <button onClick={() => handleStatusChange('active')}>
                <i className="fas fa-check-circle text-success"></i>
                Kích hoạt
              </button>
              <button onClick={() => handleStatusChange('inactive')}>
                <i className="fas fa-times-circle text-danger"></i>
                Vô hiệu hóa
              </button>
              <button onClick={() => handleStatusChange('draft')}>
                <i className="fas fa-edit text-warning"></i>
                Chuyển thành nháp
              </button>
            </div>
          )}
        </div>

        {/* Category Actions */}
        <div className="action-dropdown">
          <button 
            className="btn btn-sm btn-outline dropdown-toggle"
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
          >
            <i className="fas fa-folder"></i>
            Danh mục
          </button>
          {showCategoryMenu && (
            <div className="dropdown-menu">
              {categories.map(category => (
                <button 
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  <i className="fas fa-folder"></i>
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Label Actions */}
        <div className="action-dropdown">
          <button 
            className="btn btn-sm btn-outline dropdown-toggle"
            onClick={() => setShowLabelMenu(!showLabelMenu)}
          >
            <i className="fas fa-tags"></i>
            Nhãn
          </button>
          {showLabelMenu && (
            <div className="dropdown-menu">
              <div className="dropdown-section">
                <h6>Thêm nhãn</h6>
                <button onClick={() => handleLabelChange({ is_hot: true })}>
                  <i className="fas fa-fire text-danger"></i>
                  Thêm HOT
                </button>
                <button onClick={() => handleLabelChange({ is_new: true })}>
                  <i className="fas fa-star text-warning"></i>
                  Thêm NEW
                </button>
                <button onClick={() => handleLabelChange({ is_featured: true })}>
                  <i className="fas fa-crown text-primary"></i>
                  Thêm FEATURED
                </button>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-section">
                <h6>Xóa nhãn</h6>
                <button onClick={() => handleLabelChange({ is_hot: false })}>
                  <i className="fas fa-fire-extinguisher"></i>
                  Xóa HOT
                </button>
                <button onClick={() => handleLabelChange({ is_new: false })}>
                  <i className="fas fa-star-half-alt"></i>
                  Xóa NEW
                </button>
                <button onClick={() => handleLabelChange({ is_featured: false })}>
                  <i className="fas fa-crown"></i>
                  Xóa FEATURED
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Action */}
        <button 
          className="btn btn-sm btn-danger"
          onClick={handleBulkDelete}
        >
          <i className="fas fa-trash"></i>
          Xóa ({selectedItems.length})
        </button>
      </div>
    </div>
  );
};

export default BulkActions;