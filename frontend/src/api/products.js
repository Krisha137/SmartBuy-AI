import apiClient from './client';

export const getProducts = (params = {}) => {
  return apiClient.get('/products/', { params });
};

export const getProduct = (productId) => {
  return apiClient.get(`/products/${productId}/`);
};

export const getCategories = () => {
  return apiClient.get('/categories/');
};

export const getProductSegments = () => {
  return apiClient.get('/product-segments/');
};

export const getBrands = () => {
  return apiClient.get('/brands/');
};
