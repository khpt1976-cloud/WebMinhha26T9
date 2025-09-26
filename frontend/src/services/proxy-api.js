/**
 * 🔄 Proxy API Service - Bypass CORS issues
 * Uses same-origin proxy endpoints to avoid CORS problems
 */

import { findWorkingApiUrl } from '../config/environment-detector';

class ProxyApiService {
    constructor() {
        this.baseUrl = null;
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            // Find working API URL
            const apiUrl = await findWorkingApiUrl();
            this.baseUrl = apiUrl;
            this.initialized = true;
            console.log('🔄 Proxy API initialized:', this.baseUrl);
        } catch (error) {
            console.error('❌ Failed to initialize Proxy API:', error);
            // Fallback to localhost
            this.baseUrl = 'http://localhost:12000';
            this.initialized = true;
        }
    }

    async request(endpoint, options = {}) {
        await this.initialize();
        
        const url = `${this.baseUrl}/proxy${endpoint}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`❌ Proxy API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    // Health check
    async getHealth() {
        return this.request('/health');
    }

    // Get all products
    async getProducts() {
        return this.request('/products');
    }

    // Get categories
    async getCategories() {
        return this.request('/categories');
    }

    // Get stats
    async getStats() {
        return this.request('/stats');
    }
}

// Create singleton instance
const proxyApi = new ProxyApiService();

export default proxyApi;

// Named exports for convenience
export const getProducts = () => proxyApi.getProducts();
export const getCategories = () => proxyApi.getCategories();
export const getStats = () => proxyApi.getStats();
export const getHealth = () => proxyApi.getHealth();