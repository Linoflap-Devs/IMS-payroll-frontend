import Cookies from 'js-cookie';

export const setCookie = (key: string, value: string) => {
  Cookies.set(key, value, {
    expires: 7,
    secure: true,
    sameSite: 'strict',
    path: '/',
  });
};

// For auth token specifically
export const setAuthCookie = (value: string) => {
  // Using document.cookie for httpOnly cookie
  document.cookie = `auth_token=${value}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict; httponly`;
};

export const getCookie = (key: string) => {
  return Cookies.get(key);
};

export const removeCookie = (key: string) => {
  Cookies.remove(key);
};
