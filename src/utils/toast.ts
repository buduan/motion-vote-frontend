/**
 * Toast notification utilities using vue-sonner
 * 统一的通知系统，基于 vue-sonner
 */

import { toast as sonnerToast } from 'vue-sonner';

/**
 * Success toast notification
 */
function success(message: string, duration?: number) {
  sonnerToast.success(message, {
    duration: duration ?? 3000,
  });
}

/**
 * Error toast notification
 */
function error(message: string, duration?: number) {
  sonnerToast.error(message, {
    duration: duration ?? 5000,
  });
}

/**
 * Info toast notification
 */
function info(message: string, duration?: number) {
  sonnerToast.info(message, {
    duration: duration ?? 3000,
  });
}

/**
 * Warning toast notification
 */
function warning(message: string, duration?: number) {
  sonnerToast.warning(message, {
    duration: duration ?? 4000,
  });
}

/**
 * Loading toast notification
 * Returns a dismiss function
 */
function loading(message: string) {
  const toastId = sonnerToast.loading(message);
  return () => sonnerToast.dismiss(toastId);
}

/**
 * Promise toast notification
 * Shows loading state and auto-updates on success/error
 */
function promise<T>(
  promiseToResolve: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: Error) => string);
  },
) {
  return sonnerToast.promise(promiseToResolve, messages);
}

/**
 * Confirmation dialog (using native confirm for now)
 * Can be upgraded to a custom modal component later
 */
function confirm(message: string): boolean {
  return window.confirm(message);
}

const toast = {
  success,
  error,
  info,
  warning,
  loading,
  promise,
  confirm,
};

export default toast;
