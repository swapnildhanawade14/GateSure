const ADMIN_SESSION_KEY = 'gatesure_admin_session';
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';

export function getAdminSession(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return window.localStorage.getItem(ADMIN_SESSION_KEY) === 'active';
  } catch {
    return false;
  }
}

export function setAdminSession(active: boolean) {
  if (typeof window === 'undefined') return;

  if (active) {
    window.localStorage.setItem(ADMIN_SESSION_KEY, 'active');
    return;
  }

  window.localStorage.removeItem(ADMIN_SESSION_KEY);
}

export function logoutAdmin() {
  setAdminSession(false);
}
