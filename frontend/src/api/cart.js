import apiClient from './client';

export const getCart = () => {
  return apiClient.get('/cart/');
};

export const addToCart = (productId, quantity = 1) => {
  return apiClient.post('/cart/items/', { product_id: productId, quantity });
};

export const updateCartItem = (itemId, quantity) => {
  return apiClient.patch(`/cart/items/${itemId}/`, { quantity });
};

export const removeCartItem = (itemId) => {
  return apiClient.delete(`/cart/items/${itemId}/`);
};

export const clearCart = () => {
  return apiClient.delete('/cart/clear/');
};
