import client from './client';

export async function placeOrder(shippingData) {
  const response = await client.post('/orders/', shippingData);
  return response;
}

export async function getOrders() {
  const response = await client.get('/orders/');
  return response;
}

export async function getOrderDetails(orderId) {
  const response = await client.get(`/orders/${orderId}/`);
  return response;
}

export async function cancelOrder(orderId) {
  const response = await client.post(`/orders/${orderId}/cancel/`);
  return response;
}
