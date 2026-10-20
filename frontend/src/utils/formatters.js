/**
 * Formatting utilities for SmartBuy AI Frontend.
 * Ensures consistent Indian Rupee (INR / ₹) display across the application.
 */

/**
 * Formats a number or string into Indian Rupee format (e.g., 77107 -> ₹77,107).
 * @param {number|string} amount 
 * @returns {string} Formatted INR price string
 */
export function formatINR(amount) {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹0';
  }
  
  const num = Math.round(Number(amount));
  
  // Format using Indian Numbering System (en-IN)
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  } catch (e) {
    return `₹${num.toLocaleString('en-IN')}`;
  }
}

/**
 * Formats decimal ratings to 1 decimal place (e.g. 4.2).
 */
export function formatRating(rating) {
  if (rating === null || rating === undefined || isNaN(Number(rating))) {
    return 'N/A';
  }
  return Number(rating).toFixed(1);
}

/**
 * Formats a percentage value (e.g. 82.5 -> 82.5%).
 */
export function formatPercentage(val) {
  if (val === null || val === undefined || isNaN(Number(val))) {
    return '0%';
  }
  return `${Number(val).toFixed(0)}%`;
}

/**
 * Resolves relative image URLs by prepending the Django backend origin if needed.
 */
export function getImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('/')) {
    const backendBase = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000';
    return `${backendBase}${url}`;
  }
  return url;
}
