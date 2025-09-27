import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import settingsService from '../services/settingsService';
import './Settings.css';

const Settings: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('general');

  // Xác định tab dựa trên URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/header')) setActiveTab('header');
    else if (path.includes('/social')) setActiveTab('social');
    else if (path.includes('/contact')) setActiveTab('contact');
    else setActiveTab('general');
  }, [location]);

  // Load settings từ database khi component mount
  useEffect(() => {
    loadSettingsFromDatabase();
  }, []);

  // Mapping giữa frontend keys (camelCase) và database keys (snake_case)
  const keyMapping: { [key: string]: string } = {
    siteName: 'site_name',
    siteDescription: 'site_description',
    contactPhone: 'contact_phone',
    contactEmail: 'contact_email',
    contactAddress: 'contact_address',
    workingHours: 'business_hours',
    facebook: 'facebook_url',
    zalo: 'zalo_phone',
    headerPhone: 'header_phone',
    footerText: 'footer_copyright',
    footerDescription: 'site_description'
  };

  // Reverse mapping từ database keys về frontend keys
  const reverseKeyMapping: { [key: string]: string } = {};
  Object.entries(keyMapping).forEach(([frontendKey, dbKey]) => {
    reverseKeyMapping[dbKey] = frontendKey;
  });

  const loadSettingsFromDatabase = async () => {
    try {
      const websiteSettings = await settingsService.getWebsiteSettings();
      
      // Convert API response to settings object
      const loadedSettings = { ...settings };
      
      websiteSettings.forEach((setting: any) => {
        const frontendKey = reverseKeyMapping[setting.key];
        if (frontendKey && loadedSettings.hasOwnProperty(frontendKey)) {
          loadedSettings[frontendKey as keyof typeof settings] = setting.value;
        }
      });
      
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Load settings error:', error);
      // Sử dụng settings mặc định nếu không load được
    }
  };
  const [settings, setSettings] = useState({
    // Header Settings
    siteName: 'Cửa Hàng Minh Hà',
    siteDescription: 'Chuyên bán võng xếp, rèm màn chất lượng cao',
    headerLogo: '/static/images/logo.png',
    headerPhone: '0974.876.168',
    
    // Contact Info (hiển thị trên trang chủ)
    contactPhone: '0974.876.168',
    contactEmail: 'Khpt1976@gmail.com',
    contactAddress: 'Địa chỉ cửa hàng Minh Hà',
    workingHours: 'Thứ 2 - Chủ nhật: 8:00 - 20:00',
    
    // Social Media (hiển thị trên website)
    facebook: 'https://facebook.com/cuahangminhha',
    zalo: '0974876168',
    youtube: 'https://youtube.com/@cuahangminhha',
    
    // Footer Settings
    footerText: '© 2024 Cửa Hàng Minh Hà. Chuyên võng xếp chất lượng cao.',
    footerAddress: 'Địa chỉ: [Nhập địa chỉ cửa hàng]',
    footerDescription: 'Cửa hàng Minh Hà - Địa chỉ tin cậy cho các sản phẩm võng xếp, rèm màn chất lượng cao với giá cả hợp lý.'
  });

  const handleInputChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Convert settings object to API format with database keys
      const settingsArray = Object.entries(settings).map(([frontendKey, value]) => ({
        key: keyMapping[frontendKey] || frontendKey, // Use mapped key or original if no mapping
        value: value as string
      }));

      await settingsService.updateWebsiteSettings({ settings: settingsArray });
      
      alert('✅ Cài đặt đã được lưu thành công! Thay đổi sẽ hiển thị trên website.');
      
      // Cập nhật localStorage để frontend có thể sử dụng
      localStorage.setItem('site_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Save settings error:', error);
      alert('❌ Có lỗi xảy ra khi lưu cài đặt. Vui lòng thử lại.');
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn khôi phục tất cả cài đặt về mặc định?')) {
      return;
    }

    try {
      await settingsService.resetSettings('website');
      
      alert('✅ Đã khôi phục tất cả cài đặt về mặc định!');
      
      // Reload settings from database
      await loadSettingsFromDatabase();
    } catch (error) {
      console.error('Reset settings error:', error);
      alert('❌ Có lỗi xảy ra khi khôi phục cài đặt.');
    }
  };

  const handleSaveAsDefault = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn lưu các cài đặt hiện tại làm mặc định? Điều này sẽ thay đổi giá trị mặc định cho tất cả cài đặt.')) {
      return;
    }

    try {
      // Convert settings object to API format with database keys
      const settingsArray = Object.entries(settings).map(([frontendKey, value]) => ({
        key: keyMapping[frontendKey] || frontendKey, // Use mapped key or original if no mapping
        value: value as string
      }));

      await settingsService.saveCurrentSettingsAsDefault({ settings: settingsArray });
      
      alert('✅ Đã lưu các cài đặt hiện tại làm mặc định thành công!');
    } catch (error) {
      console.error('Save as default error:', error);
      alert('❌ Có lỗi xảy ra khi lưu cài đặt làm mặc định.');
    }
  };

  const tabs = [
    { id: 'general', title: 'Cài đặt chung', icon: '🔧' },
    { id: 'header', title: 'Header/Footer', icon: '🎨' },
    { id: 'contact', title: 'Thông tin liên hệ', icon: '📞' },
    { id: 'social', title: 'Mạng xã hội', icon: '📱' }
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1 className="page-title">Cài đặt hệ thống</h1>
        <p className="page-subtitle">Cấu hình thông tin website và cửa hàng</p>
        <div className="breadcrumb">
          <span className="breadcrumb-item">🏠 Trang chủ</span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item">Cài đặt chung</span>
        </div>
      </div>

      <div className="settings-container">
        {/* Content */}
        <div className="settings-content-full">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                {activeTab === 'general' && '🔧 Cài đặt hệ thống'}
                {activeTab === 'header' && '🎨 Header & Footer'}
                {activeTab === 'contact' && '📞 Thông tin liên hệ'}
                {activeTab === 'social' && '📱 Mạng xã hội'}
              </h3>
            </div>
            <div className="card-body">
              {activeTab === 'general' && (
                <div className="settings-form">
                  <div className="form-group">
                    <label>Tên website</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settings.siteName}
                      onChange={(e) => handleInputChange('siteName', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Mô tả website</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={settings.siteDescription}
                      onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Địa chỉ cửa hàng</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={settings.contactAddress}
                      onChange={(e) => handleInputChange('contactAddress', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'contact' && (
                <div className="settings-form">
                  <h4>📞 Thông tin liên hệ</h4>
                  <p>Cập nhật thông tin liên hệ hiển thị trên website</p>
                  
                  <div className="form-group">
                    <label>Số điện thoại chính</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0974.876.168"
                      value={settings.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email liên hệ</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Khpt1976@gmail.com"
                      value={settings.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Địa chỉ cửa hàng</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Nhập địa chỉ cửa hàng..."
                      value={settings.contactAddress}
                      onChange={(e) => handleInputChange('contactAddress', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Giờ làm việc</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Thứ 2 - Chủ nhật: 8:00 - 20:00"
                      value={settings.workingHours}
                      onChange={(e) => handleInputChange('workingHours', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="settings-form">
                  <h4>📱 Mạng xã hội</h4>
                  <p>Cập nhật các liên kết mạng xã hội hiển thị trên website</p>
                  
                  <div className="form-group">
                    <label>Facebook Page</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://facebook.com/cuahangminhha"
                      value={settings.facebook}
                      onChange={(e) => handleInputChange('facebook', e.target.value)}
                    />
                    <small className="form-text">Link trang Facebook của cửa hàng</small>
                  </div>
                  
                  <div className="form-group">
                    <label>Zalo</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0974876168"
                      value={settings.zalo}
                      onChange={(e) => handleInputChange('zalo', e.target.value)}
                    />
                    <small className="form-text">Số Zalo để khách hàng liên hệ</small>
                  </div>
                  
                  <div className="form-group">
                    <label>YouTube Channel</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://youtube.com/@cuahangminhha"
                      value={settings.youtube}
                      onChange={(e) => handleInputChange('youtube', e.target.value)}
                    />
                    <small className="form-text">Kênh YouTube giới thiệu sản phẩm</small>
                  </div>
                </div>
              )}

              {activeTab === 'header' && (
                <div className="settings-form">
                  <h4>🎨 Cài đặt Header & Footer</h4>
                  <p>Quản lý thông tin hiển thị ở đầu và cuối trang website</p>
                  
                  <div className="form-group">
                    <label>Logo header</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="URL logo hoặc upload file"
                      value={settings.headerLogo}
                      onChange={(e) => handleInputChange('headerLogo', e.target.value)}
                    />
                    <small className="form-text">Kích thước khuyến nghị: 200x60px</small>
                  </div>
                  
                  <div className="form-group">
                    <label>Số điện thoại header</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="0974.876.168"
                      value={settings.headerPhone}
                      onChange={(e) => handleInputChange('headerPhone', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Text footer</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="© 2024 Cửa Hàng Minh Hà..."
                      value={settings.footerText}
                      onChange={(e) => handleInputChange('footerText', e.target.value)}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Mô tả footer</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Mô tả ngắn về cửa hàng..."
                      value={settings.footerDescription}
                      onChange={(e) => handleInputChange('footerDescription', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleSave}>
                  💾 Lưu cài đặt
                </button>
                <button className="btn btn-success" onClick={handleSaveAsDefault}>
                  ⭐ Lưu làm mặc định
                </button>
                <button className="btn btn-outline" onClick={handleResetToDefault}>
                  🔄 Khôi phục mặc định
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
