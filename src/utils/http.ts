import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosRequestHeaders,
} from 'axios';
import type { ApiResponse, ErrorResponse } from '@/types/api';

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // 允许重定向，但确保 HTTPS
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 400; // 接受重定向状态码
  },
});

// 确保 baseURL 使用 HTTPS（仅生产环境，如果不是代理路径）
const baseURL = http.defaults.baseURL;
if (!import.meta.env.DEV && baseURL && baseURL.startsWith('http://') && !baseURL.startsWith('/')) {
  http.defaults.baseURL = baseURL.replace('http://', 'https://');
  console.warn('HTTP baseURL detected and converted to HTTPS:', http.defaults.baseURL);
}

// 在生产模式下检查配置
if (!import.meta.env.DEV) {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (apiUrl && apiUrl.startsWith('http://')) {
    console.error('⚠️  WARNING: VITE_API_BASE_URL is configured with HTTP in production!');
    console.error('   This should use HTTPS for security.');
  }
}

// 请求拦截器
http.interceptors.request.use(
  config => {
    // 在开发环境中允许 HTTP（用于代理），生产环境强制 HTTPS
    if (!import.meta.env.DEV) {
      // 确保所有请求都使用 HTTPS（仅生产环境）
      if (config.url && config.url.startsWith('http://')) {
        config.url = config.url.replace('http://', 'https://');
        console.warn('HTTP URL detected and converted to HTTPS:', config.url);
      }
    }

    // 从localStorage获取token
    // The app stores token as 'auth_token' (auth store). Keep backwards compatibility with 'token'.
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      // ensure headers object exists and set Authorization
      if (!config.headers) config.headers = {} as AxiosRequestHeaders;
      (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 检查响应头中的重定向 URL
    const location = response.headers?.location;
    if (location && location.startsWith('http://')) {
      console.warn('HTTP redirect detected in response headers:', location);
      // 注意：这里我们只是记录警告，实际的重定向应该由 Axios 处理
    }
    return response;
  },
  error => {
    // 处理401未授权错误
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || '请求失败';

    if (status === 401) {
      // 清除 known token keys
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      // 跳转到登录页面
      // window.location.href = '/auth/login';
      return Promise.reject(error);
    }

    // 在开发模式下，把错误打印到控制台
    // if (import.meta.env.DEV) {
    //   // eslint-disable-next-line no-console
    //   console.error('[HTTP Error]', { status, message, details: error.response?.data });
    // }

    // 处理其他错误，返回统一格式
    const errorResponse: ErrorResponse = {
      success: false,
      message,
      timestamp: new Date().toISOString(),
      error: error.response?.data?.error,
    };

    return Promise.reject(errorResponse);
  },
);

// 封装请求方法
export class HttpClient {
  static async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await http.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  static async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    console.log('[HttpClient.post] 发送POST请求:');
    console.log('  - URL:', url);
    console.log('  - 数据:', data);
    console.log('  - 配置:', config);

    const response = await http.post<ApiResponse<T>>(url, data as unknown, config);

    console.log('[HttpClient.post] 收到响应:');
    console.log('  - 状态码:', response.status);
    console.log('  - 响应数据:', response.data);

    return response.data;
  }

  static async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await http.put<ApiResponse<T>>(url, data as unknown, config);
    return response.data;
  }

  static async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await http.patch<ApiResponse<T>>(url, data as unknown, config);
    return response.data;
  }

  static async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await http.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Direct response methods for APIs that return data directly (not wrapped in ApiResponse)
  static async getDirect<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await http.get<T>(url, config);
    return response.data;
  }

  static async postDirect<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await http.post<T>(url, data as unknown, config);
    return response.data;
  }

  static async putDirect<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await http.put<T>(url, data as unknown, config);
    return response.data;
  }

  static async patchDirect<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await http.patch<T>(url, data as unknown, config);
    return response.data;
  }

  static async deleteDirect<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await http.delete<T>(url, config);
    return response.data;
  }
}

export default http;
