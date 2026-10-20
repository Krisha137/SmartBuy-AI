import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../api/wishlist';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getWishlist();
      setWishlistItems(res.items || []);
    } catch (e) {
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const addWishlist = async (productId) => {
    if (!isAuthenticated) return false;
    try {
      await apiAddToWishlist(productId);
      await refreshWishlist();
      return true;
    } catch (e) {
      return false;
    }
  };

  const removeWishlist = async (productId) => {
    if (!isAuthenticated) return false;
    try {
      await apiRemoveFromWishlist(productId);
      await refreshWishlist();
      return true;
    } catch (e) {
      return false;
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.product && item.product.product_id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        count: wishlistItems.length,
        loading,
        addWishlist,
        removeWishlist,
        isInWishlist,
        refreshWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
