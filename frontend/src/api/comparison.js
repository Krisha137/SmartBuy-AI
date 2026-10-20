import apiClient from './client';

export const compareProducts = (productIds, requirementId = null) => {
  const payload = { product_ids: productIds };
  if (requirementId) {
    payload.requirement_id = requirementId;
  }
  return apiClient.post('/products/compare/', payload);
};
