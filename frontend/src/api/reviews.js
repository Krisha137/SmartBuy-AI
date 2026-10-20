import apiClient from './client';

export const getReviews = (productId, params = {}) => {
  return apiClient.get(`/products/${productId}/reviews/`, { params });
};

export const getReviewIntelligence = (productId) => {
  return apiClient.get(`/products/${productId}/review-intelligence/`);
};
