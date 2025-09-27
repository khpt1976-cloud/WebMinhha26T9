import React, { useState, useRef } from 'react';
import './ImageUploadNew.css';

interface ImageUploadNewProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxFileSize?: number; // MB
}

const ImageUploadNew: React.FC<ImageUploadNewProps> = ({
  images,
  onChange,
  maxImages = 1,
  maxFileSize = 2
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Chỉ chấp nhận file ảnh!');
      return;
    }

    // Validate file size
    if (file.size > maxFileSize * 1024 * 1024) {
      alert(`File quá lớn! Tối đa ${maxFileSize}MB`);
      return;
    }

    setUploading(true);
    
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      onChange([previewUrl]);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Lỗi upload ảnh!');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-new">
      {/* Image Preview */}
      {images.length > 0 && (
        <div className="image-preview-container">
          <div className="image-preview">
            <img src={images[0]} alt="Category preview" />
            <button 
              type="button"
              className="remove-image"
              onClick={() => removeImage(0)}
              title="Xóa ảnh"
            >
              ×
            </button>
          </div>
          <div className="image-info">
            <p><strong>Preview ảnh danh mục</strong></p>
            <small>Ảnh này sẽ hiển thị trên trang chủ, menu và trang danh mục</small>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {images.length === 0 && (
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <div className="upload-content">
            {uploading ? (
              <>
                <div className="upload-spinner"></div>
                <p>Đang tải ảnh...</p>
              </>
            ) : (
              <>
                <div className="upload-icon">📷</div>
                <h4>Thêm ảnh danh mục</h4>
                <p>Kéo thả ảnh vào đây hoặc <span className="click-text">nhấn để chọn</span></p>
                <div className="upload-specs">
                  <span>JPG, PNG, WebP</span>
                  <span>Tối đa {maxFileSize}MB</span>
                  <span>Khuyến nghị: 400x300px</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {/* Usage Info */}
      <div className="usage-info">
        <h5>📍 Ảnh sẽ hiển thị ở:</h5>
        <ul>
          <li><strong>Trang chủ:</strong> Grid danh mục (300x200px)</li>
          <li><strong>Menu:</strong> Icon bên cạnh tên (32x32px)</li>
          <li><strong>Trang danh mục:</strong> Banner header (1200x400px)</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUploadNew;
