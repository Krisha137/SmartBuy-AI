import apiClient from './client';

export const getWishlist = () => {
  return apiClient.get('/wishlist/');
};

export const addToWishlist = (productId) => {
  return apiClient.post('/wishlist/', { product_id: productId });
};

export const removeFromWishlist = (productId) => {
  return apiClient.delete(`/wishlist/${productId}/`);
};
