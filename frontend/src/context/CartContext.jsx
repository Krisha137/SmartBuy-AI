import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart
} from '../api/cart';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], item_count: 0, subtotal: 0, currency: 'INR' });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], item_count: 0, subtotal: 0, currency: 'INR' });
      return;
    }
    setLoading(true);
    try {
      const res = await getCart();
      setCart(res || { items: [], item_count: 0, subtotal: 0, currency: 'INR' });
    } catch (e) {
      setCart({ items: [], item_count: 0, subtotal: 0, currency: 'INR' });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) return false;
    try {
      const res = await apiAddToCart(productId, quantity);
      setCart(res);
      return true;
    } catch (e) {
      return false;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) return false;
    try {
      const res = await apiUpdateCartItem(itemId, quantity);
      setCart(res);
      return true;
    } catch (e) {
      return false;
    }
  };

  const removeItem = async (itemId) => {
    if (!isAuthenticated) return false;
    try {
      const res = await apiRemoveCartItem(itemId);
      setCart(res);
      return true;
    } catch (e) {
      return false;
    }
  };

  const clear = async () => {
    if (!isAuthenticated) return false;
    try {
      const res = await apiClearCart();
      setCart(res);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount: cart.item_count || 0,
        subtotal: cart.subtotal || 0,
        loading,
        addCart,
        updateQuantity,
        removeItem,
        clearCart: clear,
        refreshCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
