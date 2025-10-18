import { useToast, type PluginOptions, POSITION } from 'vue-toastification';

/**
 * Toast notification utility with vue-toastification
 * Automatically adapts to current daisyUI theme
 */

// Get toast instance
const toast = useToast();

class ToastService {
  /**
   * 显示成功提示
   */
  success(message: string) {
    toast.success(message, {
      position: POSITION.TOP_RIGHT,
      timeout: 3000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      draggablePercent: 0.6,
      showCloseButtonOnHover: false,
      hideProgressBar: false,
      closeButton: 'button',
      icon: true,
      rtl: false,
    });
  }

  /**
   * 显示错误提示
   */
  error(message: string) {
    toast.error(message, {
      position: POSITION.TOP_RIGHT,
      timeout: 5000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      draggablePercent: 0.6,
      showCloseButtonOnHover: false,
      hideProgressBar: false,
      closeButton: 'button',
      icon: true,
      rtl: false,
    });
  }

  /**
   * 显示信息提示
   */
  info(message: string) {
    toast.info(message, {
      position: POSITION.TOP_RIGHT,
      timeout: 3000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      draggablePercent: 0.6,
      showCloseButtonOnHover: false,
      hideProgressBar: false,
      closeButton: 'button',
      icon: true,
      rtl: false,
    });
  }

  /**
   * 显示警告提示
   */
  warning(message: string) {
    toast.warning(message, {
      position: POSITION.TOP_RIGHT,
      timeout: 4000,
      closeOnClick: true,
      pauseOnFocusLoss: true,
      pauseOnHover: true,
      draggable: true,
      draggablePercent: 0.6,
      showCloseButtonOnHover: false,
      hideProgressBar: false,
      closeButton: 'button',
      icon: true,
      rtl: false,
    });
  }

  /**
   * 确认对话框
   * Note: vue-toastification doesn't have built-in confirm dialog
   * Using native confirm for now, can be replaced with a modal component
   */
  confirm(message: string): boolean {
    return confirm(message);
  }
}

export const toastService = new ToastService();

export default toastService;

// Export toast options for main.ts configuration
export const getToastOptions = (): PluginOptions => {
  return {
    position: POSITION.TOP_RIGHT,
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false,
    transition: 'Vue-Toastification__fade',
    maxToasts: 5,
    newestOnTop: true,
    filterBeforeCreate: (toast, toasts) => {
      // Prevent duplicate toasts with same message
      if (toasts.filter(t => t.content === toast.content).length !== 0) {
        return false;
      }
      return toast;
    },
  };
};
