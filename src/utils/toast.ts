/**
 * Toast notification utility
 * 使用浏览器原生的 alert/confirm 或者可以集成第三方 toast 库
 */

export interface ToastOptions {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

class ToastService {
  /**
   * 显示成功提示
   */
  success(message: string) {
    this.show({ message, type: 'success' });
  }

  /**
   * 显示错误提示
   */
  error(message: string) {
    this.show({ message, type: 'error' });
  }

  /**
   * 显示信息提示
   */
  info(message: string) {
    this.show({ message, type: 'info' });
  }

  /**
   * 显示警告提示
   */
  warning(message: string) {
    this.show({ message, type: 'warning' });
  }

  /**
   * 显示提示
   */
  private show(options: ToastOptions) {
    const { message, type = 'info' } = options;

    // 简单实现：使用 alert
    // 可以替换为第三方库如 vue-toastification
    const prefix = type === 'error' ? '❌ ' : type === 'success' ? '✅ ' : type === 'warning' ? '⚠️ ' : 'ℹ️ ';
    alert(prefix + message);
  }

  /**
   * 确认对话框
   */
  confirm(message: string): boolean {
    return confirm(message);
  }
}

export const toast = new ToastService();

export default toast;
