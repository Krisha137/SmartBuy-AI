import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor to attach JWT access token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartbuy_access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for clean error handling & token refresh
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh if 401 Unauthorized and not already retrying
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login/') &&
      !originalRequest.url.includes('/auth/register/') &&
      !originalRequest.url.includes('/auth/token/refresh/')
    ) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('smartbuy_refresh_token');

      if (refresh) {
        try {
          const res = await axios.post(`${baseURL}/auth/token/refresh/`, { refresh });
          if (res.data && res.data.access) {
            localStorage.setItem('smartbuy_access_token', res.data.access);
            originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
            return apiClient(originalRequest);
          }
        } catch (refreshErr) {
          // Token refresh failed, clear local auth tokens
          localStorage.removeItem('smartbuy_access_token');
          localStorage.removeItem('smartbuy_refresh_token');
          localStorage.removeItem('smartbuy_user');
          window.dispatchEvent(new Event('smartbuy_auth_change'));
        }
      }
    }

    let errorMessage = 'SmartBuy AI is temporarily unavailable. Please try again.';
    
    if (error.response) {
      const data = error.response.data;
      if (data && data.error) {
        errorMessage = typeof data.error === 'string' ? data.error : (data.error.message || JSON.stringify(data.error));
      } else if (data && data.detail) {
        errorMessage = data.detail;
      } else if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const val = data[firstKey];
          errorMessage = Array.isArray(val) ? val[0] : String(val);
        }
      }
    } else if (error.request) {
      errorMessage = 'Unable to connect to SmartBuy AI server. Please check your network connection.';
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;
