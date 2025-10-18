import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosRequestHeaders,
} from 'axios';
import type { ApiResponse, ErrorResponse } from '@/types/api';
import toast from '@/utils/toast';

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
http.interceptors.request.use(
  config => {
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
      window.location.href = '/auth/login';
    }

    // 在开发模式下，把错误打印到控制台并提示 toast，便于调试
    try {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error('[HTTP Error]', { status, message, details: error.response?.data });
        toast.error(message);
      }
    } catch {
      // ignore
    }

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
    const response = await http.post<ApiResponse<T>>(url, data as unknown, config);
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
}

export default http;
