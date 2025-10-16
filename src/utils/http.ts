import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiResponse, ErrorResponse } from '@/types/api';

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    if (error.response?.status === 401) {
      // 清除token
      localStorage.removeItem('token');
      // 跳转到登录页面
      window.location.href = '/auth/login';
    }

    // 处理其他错误
    const errorResponse: ErrorResponse = {
      success: false,
      message: error.response?.data?.message || error.message || '请求失败',
      timestamp: new Date().toISOString(),
      error: error.response?.data?.error,
    };

    return Promise.reject(errorResponse);
  },
);

// 封装请求方法
export class HttpClient {
  static async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await http.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  static async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await http.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  static async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await http.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  static async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await http.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  static async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await http.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}

export default http;
