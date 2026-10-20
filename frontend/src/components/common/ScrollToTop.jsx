import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * Automatically resets the window scroll position to (0, 0) whenever the route pathname changes.
 * Preserves anchor links (#section) by scrolling to the target element if present.
 * Does not reset scroll on search query parameter changes (filtering, sorting).
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // If a hash anchor is provided, scroll smoothly to the target element
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId) || document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    // Default: Reset scroll position to top of page on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname, hash]);

  return null;
}
