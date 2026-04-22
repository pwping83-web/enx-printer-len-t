const ADMIN_AUTH_KEY = 'enx_admin_authenticated';

export const isAdminAuthenticated = (): boolean => {
  try {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setAdminAuthenticated = (authenticated: boolean): void => {
  try {
    if (authenticated) {
      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
      return;
    }
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  } catch {
    // Ignore storage exceptions in restricted browser modes
  }
};

export const clearAdminAuthenticated = (): void => {
  setAdminAuthenticated(false);
};
