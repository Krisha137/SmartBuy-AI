/**
 * SmartBuy AI — Journey Storage Utility
 * Manages local session history for recently viewed laptops,
 * discovery studio preferences, and user discovery milestones.
 */

const RECENT_KEY = 'smartbuy_recent_laptops';
const PREFS_KEY = 'smartbuy_discovery_preferences';
const COMPARISONS_KEY = 'smartbuy_recent_comparisons';

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading recently viewed laptops:', e);
    return [];
  }
}

export function addRecentlyViewed(product) {
  if (!product || !product.product_id) return;
  try {
    const existing = getRecentlyViewed();
    // Remove if already present, put at front
    const filtered = existing.filter((p) => p.product_id !== product.product_id);
    const item = {
      product_id: product.product_id,
      product_name: product.product_name,
      brand: product.brand,
      price: product.price,
      ram_gb: product.ram_gb,
      storage_gb: product.storage_gb,
      storage_type: product.storage_type,
      processor: product.processor,
      gpu: product.gpu,
      rating: product.rating,
      image_url: product.image_url || (product.images?.[0]?.url) || null,
      viewed_at: new Date().toISOString(),
    };
    const updated = [item, ...filtered].slice(0, 12);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving recently viewed laptop:', e);
  }
}

export function getSavedDiscoveryPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error loading discovery preferences:', e);
    return null;
  }
}

export function saveDiscoveryPrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      ...prefs,
      updated_at: new Date().toISOString(),
    }));
  } catch (e) {
    console.error('Error saving discovery preferences:', e);
  }
}

export function clearDiscoveryPrefs() {
  try {
    localStorage.removeItem(PREFS_KEY);
  } catch (e) {
    console.error('Error clearing discovery preferences:', e);
  }
}

const getComparisonsStorageKey = (userId = null) => {
  return userId != null ? `${COMPARISONS_KEY}_${userId}` : `${COMPARISONS_KEY}_guest`;
};

export function getSavedComparisons(userId = null) {
  try {
    const key = getComparisonsStorageKey(userId);
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading saved comparisons:', e);
    return [];
  }
}

export function recordComparisonHistory(products, userId = null) {
  if (!products || products.length < 2) return;
  try {
    const key = getComparisonsStorageKey(userId);
    const existing = getSavedComparisons(userId);
    const ids = products.map((p) => p.product_id).sort().join('-');
    const filtered = existing.filter((c) => c.key !== ids);
    const newEntry = {
      key: ids,
      products: products.map((p) => ({
        product_id: p.product_id,
        product_name: p.product_name,
        brand: p.brand,
        price: p.price,
        image_url: p.image_url || (p.images?.[0]?.url) || null,
      })),
      compared_at: new Date().toISOString(),
    };
    const updated = [newEntry, ...filtered].slice(0, 6);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving comparison history:', e);
  }
}
