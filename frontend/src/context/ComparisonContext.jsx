import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';

const ComparisonContext = createContext();

/**
 * Storage key helper:
 * - Authenticated: smartbuy_compare_<user_id> (stable numeric ID)
 * - Guest: smartbuy_compare_guest
 */
export const getCompareStorageKey = (user) => {
  if (user && user.id != null) {
    return `smartbuy_compare_${user.id}`;
  }
  return 'smartbuy_compare_guest';
};

/**
 * Safe loader from localStorage for a given user object
 */
const loadProductsFromStorage = (targetUser) => {
  const key = getCompareStorageKey(targetUser);
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      // Validate that each product has a valid product_id
      return parsed.filter((p) => p && (p.product_id || p.id));
    }
    return [];
  } catch (e) {
    console.error(`Failed to load comparison from ${key}:`, e);
    return [];
  }
};

/**
 * Clean product entity to save space and avoid circular structure
 */
const sanitizeProduct = (product) => ({
  product_id: product.product_id,
  product_name: product.product_name,
  brand: product.brand,
  price: product.price,
  currency: product.currency || 'INR',
  ram_gb: product.ram_gb,
  storage_gb: product.storage_gb,
  storage_type: product.storage_type,
  processor: product.processor,
  gpu: product.gpu,
  rating: product.rating,
  image_url: product.image_url || (product.images?.[0]?.url) || null,
});

export const ComparisonProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUserIdRef = useRef(user?.id ?? null);

  // Initialize selectedProducts strictly from the current user's isolated storage
  const [selectedProducts, setSelectedProducts] = useState(() => {
    // Clean up legacy global key so old unisolated state cannot pollute anything
    try {
      localStorage.removeItem('smartbuy_comparison');
    } catch (_) {}
    return loadProductsFromStorage(user);
  });

  // Switch storage and state whenever user ID changes (login, logout, or account switch)
  useEffect(() => {
    const newUserId = user?.id ?? null;
    if (currentUserIdRef.current !== newUserId) {
      currentUserIdRef.current = newUserId;
      // Load the new user's (or guest's) saved products directly
      const userProducts = loadProductsFromStorage(user);
      setSelectedProducts(userProducts);
    }
  }, [user?.id]);

  // Also listen for smartbuy_auth_change for instant cross-tab / window sync
  useEffect(() => {
    const handleAuthChange = () => {
      let activeUser = null;
      try {
        const saved = localStorage.getItem('smartbuy_user');
        activeUser = saved ? JSON.parse(saved) : null;
      } catch (_) {}

      const activeUserId = activeUser?.id ?? null;
      if (currentUserIdRef.current !== activeUserId) {
        currentUserIdRef.current = activeUserId;
        setSelectedProducts(loadProductsFromStorage(activeUser));
      }
    };

    window.addEventListener('smartbuy_auth_change', handleAuthChange);
    return () => window.removeEventListener('smartbuy_auth_change', handleAuthChange);
  }, []);

  // Helper to persist list directly to current user's storage
  const saveForUser = useCallback((newProducts) => {
    const key = getCompareStorageKey(user);
    try {
      localStorage.setItem(key, JSON.stringify(newProducts));
    } catch (e) {
      console.error(`Failed to save comparison to ${key}:`, e);
    }
  }, [user]);

  const addToCompare = useCallback((product) => {
    if (!product || !product.product_id) return false;

    // Max limit check: 4 products
    if (selectedProducts.length >= 4) {
      alert("You can compare up to 4 laptops at a time.");
      return false;
    }

    // Duplicate check
    if (selectedProducts.some((p) => p.product_id === product.product_id)) {
      return false;
    }

    const clean = sanitizeProduct(product);
    setSelectedProducts((prev) => {
      const updated = [...prev, clean];
      saveForUser(updated);
      return updated;
    });
    return true;
  }, [selectedProducts, saveForUser]);

  const removeFromCompare = useCallback((productId) => {
    setSelectedProducts((prev) => {
      const updated = prev.filter((p) => p.product_id !== productId);
      saveForUser(updated);
      return updated;
    });
  }, [saveForUser]);

  const clearComparison = useCallback(() => {
    saveForUser([]);
    setSelectedProducts([]);
  }, [saveForUser]);

  const isInComparison = useCallback((productId) => {
    return selectedProducts.some((p) => p.product_id === productId);
  }, [selectedProducts]);

  return (
    <ComparisonContext.Provider
      value={{
        selectedProducts,
        addToCompare,
        removeFromCompare,
        clearComparison,
        isInComparison,
        count: selectedProducts.length,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
