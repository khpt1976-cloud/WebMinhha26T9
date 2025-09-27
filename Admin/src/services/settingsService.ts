import api from './api';

export interface WebsiteSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  category: string;
  data_type: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactInfo {
  id: number;
  type: string;
  label: string;
  value: string;
  icon: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SeoSetting {
  id: number;
  page: string;
  title: string;
  description: string;
  keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
  robots: string;
  created_at: string;
  updated_at: string;
}

export interface AppearanceSetting {
  id: number;
  key: string;
  value: string;
  description: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface SettingsUpdateRequest {
  settings: Array<{
    key: string;
    value: string;
  }>;
}

class SettingsService {
  // Website Settings
  async getWebsiteSettings(): Promise<WebsiteSetting[]> {
    try {
      const response = await api.get('/api/v1/settings/website');
      return response.data.settings;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch website settings');
    }
  }

  async updateWebsiteSettings(settings: SettingsUpdateRequest): Promise<void> {
    try {
      // Convert settings array to object format expected by API
      const settingsObject: { [key: string]: string } = {};
      settings.settings.forEach(setting => {
        settingsObject[setting.key] = setting.value;
      });
      
      await api.put('/api/v1/settings/website/bulk', settingsObject);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update website settings');
    }
  }

  async getWebsiteSettingByKey(key: string): Promise<WebsiteSetting> {
    try {
      const response = await api.get(`/api/v1/settings/website/${key}`);
      return response.data.setting;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch website setting');
    }
  }

  async updateWebsiteSettingByKey(key: string, value: string): Promise<void> {
    try {
      await api.put(`/api/v1/settings/website/${key}`, { value });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update website setting');
    }
  }

  // Contact Information
  async getContactInfo(): Promise<ContactInfo[]> {
    try {
      const response = await api.get('/api/v1/settings/contact');
      return response.data.contacts;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch contact information');
    }
  }

  async createContactInfo(contactData: Partial<ContactInfo>): Promise<ContactInfo> {
    try {
      const response = await api.post('/api/v1/settings/contact', contactData);
      return response.data.contact;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create contact information');
    }
  }

  async updateContactInfo(id: number, contactData: Partial<ContactInfo>): Promise<ContactInfo> {
    try {
      const response = await api.put(`/api/v1/settings/contact/${id}`, contactData);
      return response.data.contact;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update contact information');
    }
  }

  async deleteContactInfo(id: number): Promise<void> {
    try {
      await api.delete(`/api/v1/settings/contact/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete contact information');
    }
  }

  async reorderContactInfo(contactIds: number[]): Promise<void> {
    try {
      await api.put('/api/v1/settings/contact/reorder', { contact_ids: contactIds });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reorder contact information');
    }
  }

  // SEO Settings
  async getSeoSettings(): Promise<SeoSetting[]> {
    try {
      const response = await api.get('/api/v1/settings/seo');
      return response.data.seo_settings;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch SEO settings');
    }
  }

  async getSeoSettingByPage(page: string): Promise<SeoSetting> {
    try {
      const response = await api.get(`/api/v1/settings/seo/${page}`);
      return response.data.seo_setting;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch SEO setting');
    }
  }

  async updateSeoSetting(page: string, seoData: Partial<SeoSetting>): Promise<SeoSetting> {
    try {
      const response = await api.put(`/api/v1/settings/seo/${page}`, seoData);
      return response.data.seo_setting;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update SEO setting');
    }
  }

  async createSeoSetting(seoData: Partial<SeoSetting>): Promise<SeoSetting> {
    try {
      const response = await api.post('/api/v1/settings/seo', seoData);
      return response.data.seo_setting;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create SEO setting');
    }
  }

  async deleteSeoSetting(page: string): Promise<void> {
    try {
      await api.delete(`/api/v1/settings/seo/${page}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete SEO setting');
    }
  }

  // Appearance Settings
  async getAppearanceSettings(): Promise<AppearanceSetting[]> {
    try {
      const response = await api.get('/api/v1/settings/appearance');
      return response.data.settings;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appearance settings');
    }
  }

  async updateAppearanceSettings(settings: SettingsUpdateRequest): Promise<void> {
    try {
      await api.put('/api/v1/settings/appearance', settings);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update appearance settings');
    }
  }

  async getAppearanceSettingByKey(key: string): Promise<AppearanceSetting> {
    try {
      const response = await api.get(`/api/v1/settings/appearance/${key}`);
      return response.data.setting;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appearance setting');
    }
  }

  async updateAppearanceSettingByKey(key: string, value: string): Promise<void> {
    try {
      await api.put(`/api/v1/settings/appearance/${key}`, { value });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update appearance setting');
    }
  }

  // Bulk operations
  async exportSettings(): Promise<Blob> {
    try {
      const response = await api.get('/api/v1/settings/export', {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to export settings');
    }
  }

  async importSettings(file: File): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await api.post('/api/v1/settings/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to import settings');
    }
  }

  async resetSettings(category?: string): Promise<void> {
    try {
      const params = category ? `?category=${category}` : '';
      await api.post(`/api/v1/settings/reset${params}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset settings');
    }
  }

  async saveCurrentSettingsAsDefault(settings: SettingsUpdateRequest): Promise<void> {
    try {
      // Convert settings array to object format expected by API
      const settingsObject: { [key: string]: string } = {};
      settings.settings.forEach(setting => {
        settingsObject[setting.key] = setting.value;
      });
      
      await api.post('/api/v1/settings/save-as-default', settingsObject);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to save settings as default');
    }
  }
}

export default new SettingsService();