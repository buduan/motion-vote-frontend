/**
 * Cookie 工具函数
 */

/**
 * 设置 Cookie
 * @param name Cookie 名称
 * @param value Cookie 值
 * @param days 过期天数（默认 1 天）
 */
export function setCookie(name: string, value: string, days: number = 1): void {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
}

/**
 * 获取 Cookie
 * @param name Cookie 名称
 * @returns Cookie 值，不存在则返回 null
 */
export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    if (!c) continue;
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

/**
 * 删除 Cookie
 * @param name Cookie 名称
 */
export function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

/**
 * 检查 Cookie 是否存在
 * @param name Cookie 名称
 * @returns 是否存在
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}
