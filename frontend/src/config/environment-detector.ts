/**
 * Environment Detection Module
 * Tự động phát hiện môi trường và cấu hình API URL
 */

export interface EnvironmentConfig {
  apiUrl: string;
  environment: 'development' | 'production' | 'openhands';
  hostname: string;
  port: string;
  protocol: string;
}

/**
 * Phát hiện môi trường hiện tại
 */
export function detectEnvironment(): EnvironmentConfig['environment'] {
  const hostname = window.location.hostname;
  
  if (hostname.includes('prod-runtime.all-hands.dev')) {
    return 'openhands';
  }
  
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return 'development';
  }
  
  return 'production';
}

/**
 * Lấy danh sách các API URL có thể
 */
export function getPossibleApiUrls(): string[] {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const environment = detectEnvironment();
  
  const urls: string[] = [];
  
  // 1. Environment variable (highest priority)
  if (process.env.REACT_APP_API_URL) {
    urls.push(process.env.REACT_APP_API_URL);
  }
  
  switch (environment) {
    case 'development':
      // Local development URLs
      urls.push(
        `${protocol}//${hostname}:8000`,    // FastAPI default
        `${protocol}//${hostname}:12000`,   // Custom backend port
        `${protocol}//${hostname}:5000`,    // Flask default
        `${protocol}//${hostname}:3001`,    // Express default
        `${protocol}//${hostname}:8080`,    // Alternative port
        `http://localhost:8000`,
        `http://localhost:12000`,
        `http://localhost:5000`,
        `http://127.0.0.1:8000`,
        `http://127.0.0.1:12000`,
        `http://127.0.0.1:5000`
      );
      break;
      
    case 'openhands':
      // OpenHands environment URLs - Try same host first, then alternatives
      const baseUrl = hostname.replace(/^work-\d+-/, '');
      urls.push(
        `${protocol}//${hostname}:12000`,   // Same host, backend port (PRIORITY)
        `${protocol}//${hostname}:8000`,    // Same host, alternative port
        `${protocol}//work-1-${baseUrl}:12000`,   // work-1 backend
        `${protocol}//work-2-${baseUrl}:12000`,   // work-2 backend
        `${protocol}//work-1-${baseUrl}`,   // work-1 default
        `${protocol}//work-2-${baseUrl}`,   // work-2 default
      );
      break;
      
    case 'production':
      // Production URLs
      urls.push(
        `${protocol}//api.${hostname}`,
        `${protocol}//${hostname}/api`,
        `${protocol}//${hostname}:8000`,
        `${protocol}//${hostname}:80`,
        `${protocol}//${hostname}:443`
      );
      break;
  }
  
  return [...new Set(urls)]; // Remove duplicates
}

/**
 * Test API connection
 */
export async function testApiConnection(url: string, timeout: number = 5000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn(`❌ API connection test failed for ${url}:`, error);
    return false;
  }
}

/**
 * Tìm API URL khả dụng
 */
export async function findWorkingApiUrl(): Promise<string> {
  const possibleUrls = getPossibleApiUrls();
  
  console.log('🔍 Testing API connections:', possibleUrls);
  
  // Test parallel để tăng tốc độ
  const testPromises = possibleUrls.map(async (url) => {
    const isWorking = await testApiConnection(url);
    return { url, isWorking };
  });
  
  const results = await Promise.all(testPromises);
  
  // Tìm URL đầu tiên hoạt động
  for (const result of results) {
    if (result.isWorking) {
      console.log(`✅ Found working API URL: ${result.url}`);
      return result.url;
    }
  }
  
  // Fallback to first URL if none work
  const fallbackUrl = possibleUrls[0] || 'http://localhost:8000';
  console.warn(`⚠️ No working API found, using fallback: ${fallbackUrl}`);
  return fallbackUrl;
}

/**
 * Lấy cấu hình môi trường
 */
export async function getEnvironmentConfig(): Promise<EnvironmentConfig> {
  const apiUrl = await findWorkingApiUrl();
  
  return {
    apiUrl,
    environment: detectEnvironment(),
    hostname: window.location.hostname,
    port: window.location.port,
    protocol: window.location.protocol,
  };
}