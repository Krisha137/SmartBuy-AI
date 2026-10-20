import apiClient from './client';

export const understandRequirements = (query) => {
  return apiClient.post('/ai/understand-requirements/', { query });
};

export const smartSearch = (query) => {
  return apiClient.post('/smartbuy/search/', { query });
};

export const askProduct = (productId, question) => {
  return apiClient.post(`/products/${productId}/ask/`, { question });
};
