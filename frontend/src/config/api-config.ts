/**
 * API Configuration Module
 * Tự động phát hiện và cấu hình API URL cho mọi môi trường
 */

interface ApiConfig {
  baseURL: string;
  imageBaseURL: string;
  timeout: number;
  retries: number;
}

/**
 * Tự động phát hiện API URL dựa trên môi trường hiện tại
 */
function detectApiUrl(): string {
  // 1. Kiểm tra environment variable trước
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 2. Phát hiện dựa trên hostname hiện tại
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  // Development environments
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Thử các port backend phổ biến
    const backendPorts = ['8000', '5000', '3001', '8080'];
    return `${protocol}//${hostname}:8000`; // Default backend port
  }

  // OpenHands runtime environment
  if (hostname.includes('prod-runtime.all-hands.dev')) {
    // Sử dụng work-2 cho backend (port 12001)
    return `${protocol}//${hostname.replace('work-1-', 'work-2-')}`;
  }

  // Production environment
  if (hostname.includes('minhha.com')) {
    return `${protocol}//api.${hostname}`;
  }

  // Default fallback
  return `${protocol}//${hostname}:8000`;
}

/**
 * Kiểm tra kết nối API
 */
async function testApiConnection(url: string): Promise<boolean> {
  try {
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      timeout: 5000,
    } as any);
    return response.ok;
  } catch (error) {
    console.warn(`API connection test failed for ${url}:`, error);
    return false;
  }
}

/**
 * Tìm API URL khả dụng
 */
async function findAvailableApiUrl(): Promise<string> {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Danh sách các URL có thể
  const possibleUrls = [
    process.env.REACT_APP_API_URL,
    `${protocol}//${hostname}:8000`,
    `${protocol}//${hostname}:5000`,
    `${protocol}//${hostname}:3001`,
    `${protocol}//${hostname}:8080`,
  ].filter(Boolean) as string[];

  // Thêm URLs cho OpenHands environment
  if (hostname.includes('prod-runtime.all-hands.dev')) {
    possibleUrls.push(
      `${protocol}//${hostname.replace('work-1-', 'work-2-')}`, // Backend on work-2
      `${protocol}//${hostname}:12001`, // Backend on same host different port
    );
  }

  // Test từng URL
  for (const url of possibleUrls) {
    console.log(`🔍 Testing API connection: ${url}`);
    if (await testApiConnection(url)) {
      console.log(`✅ API connection successful: ${url}`);
      return url;
    }
  }

  // Fallback to detected URL
  const fallbackUrl = detectApiUrl();
  console.warn(`⚠️ No API connection found, using fallback: ${fallbackUrl}`);
  return fallbackUrl;
}

/**
 * Tạo cấu hình API
 */
export async function createApiConfig(): Promise<ApiConfig> {
  const baseURL = await findAvailableApiUrl();
  
  return {
    baseURL,
    imageBaseURL: `${baseURL}/static`,
    timeout: 10000,
    retries: 3,
  };
}

/**
 * Cấu hình API mặc định (synchronous)
 */
export const defaultApiConfig: ApiConfig = {
  baseURL: detectApiUrl(),
  imageBaseURL: `${detectApiUrl()}/static`,
  timeout: 10000,
  retries: 3,
};

/**
 * Environment info
 */
export const environmentInfo = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'unknown',
  port: typeof window !== 'undefined' ? window.location.port : 'unknown',
  protocol: typeof window !== 'undefined' ? window.location.protocol : 'https:',
};

console.log('🔧 API Configuration:', {
  defaultBaseURL: defaultApiConfig.baseURL,
  environment: environmentInfo,
});