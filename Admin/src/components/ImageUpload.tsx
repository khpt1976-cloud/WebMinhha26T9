import React, { useState, useRef, useCallback } from 'react';
import './ImageUpload.css';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxImages = 10,
  maxFileSize = 5,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${acceptedTypes.join(', ')}`;
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File quá lớn. Kích thước tối đa: ${maxFileSize}MB`;
    }
    return null;
  };

  const processFiles = async (files: FileList) => {
    setError('');
    setUploading(true);

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;

    if (fileArray.length > remainingSlots) {
      setError(`Chỉ có thể tải lên tối đa ${remainingSlots} ảnh nữa`);
      setUploading(false);
      return;
    }

    const newImages: string[] = [];

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setUploading(false);
        return;
      }

      try {
        // Convert to base64 for preview (in real app, upload to server)
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      } catch (err) {
        setError('Lỗi khi xử lý file');
        setUploading(false);
        return;
      }
    }

    onChange([...images, ...newImages]);
    setUploading(false);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFiles(e.dataTransfer.files);
    }
  }, [images, maxImages, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-upload-container">
      <div className="image-upload-header">
        <h4>Hình ảnh sản phẩm ({images.length}/{maxImages})</h4>
        <p className="image-upload-note">
          Kéo thả hoặc click để tải ảnh. Tối đa {maxFileSize}MB mỗi file.
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`image-upload-area ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        
        {uploading ? (
          <div className="upload-loading">
            <div className="spinner"></div>
            <p>Đang tải ảnh...</p>
          </div>
        ) : (
          <div className="upload-content">
            <div className="upload-icon">📷</div>
            <p className="upload-text">
              <strong>Kéo thả ảnh vào đây</strong> hoặc <span className="upload-link">click để chọn</span>
            </p>
            <p className="upload-formats">
              Hỗ trợ: JPG, PNG, WebP (tối đa {maxFileSize}MB)
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="image-upload-error">
          ⚠️ {error}
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((image, index) => (
            <div key={index} className="image-preview-item">
              <div className="image-preview-wrapper">
                <img src={image} alt={`Preview ${index + 1}`} />
                <div className="image-preview-overlay">
                  <button
                    type="button"
                    className="image-action-btn move-left"
                    onClick={() => moveImage(index, Math.max(0, index - 1))}
                    disabled={index === 0}
                    title="Di chuyển trái"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="image-action-btn remove"
                    onClick={() => removeImage(index)}
                    title="Xóa ảnh"
                  >
                    ×
                  </button>
                  <button
                    type="button"
                    className="image-action-btn move-right"
                    onClick={() => moveImage(index, Math.min(images.length - 1, index + 1))}
                    disabled={index === images.length - 1}
                    title="Di chuyển phải"
                  >
                    →
                  </button>
                </div>
              </div>
              <div className="image-preview-info">
                <span className="image-index">#{index + 1}</span>
                {index === 0 && <span className="main-image-badge">Ảnh chính</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;