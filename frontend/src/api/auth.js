import apiClient from './client';

export const registerUser = (userData) => {
  return apiClient.post('/auth/register/', userData);
};

export const loginUser = (credentials) => {
  return apiClient.post('/auth/login/', credentials);
};

export const getCurrentUser = () => {
  return apiClient.get('/auth/me/');
};

export const updateCurrentUser = (userData) => {
  return apiClient.patch('/auth/me/', userData);
};

export const refreshToken = (refresh) => {
  return apiClient.post('/auth/token/refresh/', { refresh });
};
