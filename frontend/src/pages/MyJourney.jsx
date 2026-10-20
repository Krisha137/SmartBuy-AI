import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';
import { getRecentlyViewed, getSavedDiscoveryPrefs, getSavedComparisons } from '../utils/journeyStorage';
import { formatINR, formatRating, getImageUrl } from '../utils/formatters';
import apiClient from '../api/client';
import {
  Compass,
  Heart,
  ShoppingCart,
  Scale,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Clock,
  History,
  Trash2,
  CheckCircle2,
  User,
  Sliders,
  Laptop,
  ArrowUpRight
} from 'lucide-react';

export default function MyJourney() {
  const { user, isAuthenticated } = useAuth();
  const { wishlistItems = [], count: wishlistCount, removeWishlist } = useWishlist();
  const { cart, itemCount: cartCount } = useCart();
  const { addToCompare } = useComparison();
  const navigate = useNavigate();

  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [savedPrefs, setSavedPrefs] = useState(null);
  const [savedComparisons, setSavedComparisons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    // Load local journey data scoped to user
    setRecentlyViewed(getRecentlyViewed() || []);
    setSavedPrefs(getSavedDiscoveryPrefs());
    setSavedComparisons(getSavedComparisons(user?.id) || []);

    // If authenticated, load user's actual orders
    if (isAuthenticated) {
      setLoadingOrders(true);
      apiClient
        .get('/orders/')
        .then((res) => {
          const list = res.results || res.data?.results || res || [];
          setOrders(Array.isArray(list) ? list : []);
          setLoadingOrders(false);
        })
        .catch((err) => {
          console.error('Failed to load user orders for journey:', err);
          setLoadingOrders(false);
        });
    } else {
      setOrders([]);
    }
  }, [isAuthenticated, user?.id]);

  const hasAnyActivity =
    recentlyViewed.length > 0 ||
    wishlistCount > 0 ||
    cartCount > 0 ||
    savedPrefs !== null ||
    savedComparisons.length > 0 ||
    orders.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9E2E5] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-2.5 py-0.5 rounded-full">
              ✦ Personal Workspace
            </span>
            {isAuthenticated ? (
              <span className="text-xs text-[#29252A] font-medium bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E9E2E5]">
                Account: <strong>{user?.username}</strong>
              </span>
            ) : (
              <span className="text-xs text-[#6F6870] font-medium bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E9E2E5]">
                Guest Session (Stored on this device)
              </span>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#29252A] tracking-tight">
            My Laptop Journey
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6870]">
            Your personal search history, saved preferences, comparisons, and active decisions in one place.
          </p>
        </div>

        {!isAuthenticated && (
          <div className="bg-[#FAF8F5] border border-[#E9E2E5] p-3 rounded-2xl flex items-center gap-3">
            <div className="text-xs text-[#6F6870]">
              <span className="font-bold text-[#29252A] block">Sign in to sync across devices</span>
              Save your wishlist & orders permanently.
            </div>
            <Link
              to="/login?next=/my-journey"
              className="px-4 py-2 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
            >
              Log In
            </Link>
          </div>
        )}
      </div>

      {!hasAnyActivity ? (
        /* Empty State for first-time visitors */
        <div className="bg-white rounded-3xl border border-[#E9E2E5] p-10 sm:p-16 text-center shadow-premium max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#F7E8EE] text-[#6D214F] flex items-center justify-center font-bold text-2xl mx-auto shadow-xs">
            ✦
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-[#29252A]">Your Journey Starts Here</h2>
            <p className="text-xs sm:text-sm text-[#6F6870] leading-relaxed max-w-md mx-auto">
              As you explore laptops, use Discovery Studio, compare models, and save favorites, your activity will appear here so you can continue where you left off anytime.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/discovery-studio"
              className="px-6 py-3 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Start Discovery Studio
            </Link>
            <Link
              to="/explore"
              className="px-6 py-3 bg-white hover:bg-[#FAF8F5] border border-[#E9E2E5] text-[#29252A] text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <Compass className="w-4 h-4" /> Browse Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* CONTINUE WHERE YOU LEFT OFF BANNER */}
          {savedPrefs && (
            <div className="bg-gradient-to-r from-[#FAF8F5] via-[#F7E8EE]/40 to-[#FAF8F5] rounded-3xl border border-[#E9E2E5] p-6 sm:p-8 shadow-premium flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#6D214F] font-black text-sm">✦</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F]">
                    Continue Where You Left Off
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#29252A]">
                  Saved Discovery: {savedPrefs.purpose ? savedPrefs.purpose.toUpperCase() : 'Custom Search'}
                </h3>
                <p className="text-xs text-[#6F6870] max-w-xl">
                  Budget bracket: <strong>{formatINR(savedPrefs.budgetMin || 40000)} – {formatINR(savedPrefs.budgetMax || 120000)}</strong>
                  {savedPrefs.priorities && ` • Priorities: ${savedPrefs.priorities.join(', ')}`}
                </p>
              </div>

              <Link
                to="/discovery-studio"
                className="px-6 py-3 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
              >
                <span>Resume in Studio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* QUICK METRICS OVERVIEW CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E9E2E5] shadow-xs space-y-1">
              <span className="text-xs font-bold text-[#6F6870] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#6D214F]" /> Recently Viewed
              </span>
              <div className="text-2xl font-black text-[#29252A]">{recentlyViewed.length}</div>
              <span className="text-[11px] text-[#989198]">Models inspected</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E9E2E5] shadow-xs space-y-1">
              <span className="text-xs font-bold text-[#6F6870] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#A85578]" /> Wishlist
              </span>
              <div className="text-2xl font-black text-[#29252A]">{wishlistCount}</div>
              <span className="text-[11px] text-[#989198]">Saved favorites</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E9E2E5] shadow-xs space-y-1">
              <span className="text-xs font-bold text-[#6F6870] flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-[#6D214F]" /> Saved Comparisons
              </span>
              <div className="text-2xl font-black text-[#29252A]">{savedComparisons.length}</div>
              <span className="text-[11px] text-[#989198]">Arena sessions</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E9E2E5] shadow-xs space-y-1">
              <span className="text-xs font-bold text-[#6F6870] flex items-center gap-1.5">
                <ShoppingCart className="w-3.5 h-3.5 text-[#6D214F]" /> Cart Items
              </span>
              <div className="text-2xl font-black text-[#29252A]">{cartCount}</div>
              <span className="text-[11px] text-[#989198]">Ready for checkout</span>
            </div>
          </div>

          {/* RECENTLY VIEWED LAPTOPS */}
          {recentlyViewed.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E9E2E5] pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#6D214F]" />
                  <h3 className="font-extrabold text-[#29252A] text-lg">Recently Viewed Laptops</h3>
                </div>
                <span className="text-xs text-[#6F6870] font-medium">{recentlyViewed.length} laptops</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {recentlyViewed.map((item) => (
                  <div
                    key={item.product_id}
                    className="bg-white rounded-2xl border border-[#E9E2E5] p-4 shadow-xs hover:border-[#D8C7D0] transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-2 py-0.5 rounded-full">
                        {item.brand}
                      </span>

                      <div className="h-24 bg-[#FAF8F5] rounded-xl border border-[#E9E2E5] my-2 p-2 flex items-center justify-center">
                        {item.image_url ? (
                          <img src={getImageUrl(item.image_url)} alt="" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Laptop className="w-8 h-8 text-[#989198]" />
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-[#29252A] line-clamp-2 leading-snug">
                        {item.product_name}
                      </h4>
                      <div className="text-base font-black text-[#6D214F] mt-1">
                        {formatINR(item.price)}
                      </div>
                      <div className="text-[11px] text-[#6F6870] mt-1">
                        {item.ram_gb}GB RAM • {item.storage_gb}GB {item.storage_type}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E9E2E5] flex items-center gap-2">
                      <Link
                        to={`/products/${item.product_id}`}
                        className="flex-1 py-1.5 text-center text-xs font-bold bg-[#6D214F] hover:bg-[#8B315F] text-white rounded-xl transition-colors"
                      >
                        Inspect Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SAVED COMPARISON HISTORY */}
          {savedComparisons.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E9E2E5] pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#6D214F]" />
                  <h3 className="font-extrabold text-[#29252A] text-lg">Saved Decision Arena Comparisons</h3>
                </div>
                <span className="text-xs text-[#6F6870] font-medium">{savedComparisons.length} recorded</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedComparisons.map((comp, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl border border-[#E9E2E5] p-5 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#6F6870] border-b border-[#E9E2E5] pb-2">
                        <span className="font-bold text-[#6D214F]">Session #{idx + 1}</span>
                        <span>{comp.compared_at ? new Date(comp.compared_at).toLocaleDateString() : 'Recent'}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {(comp.products || []).map((p) => (
                          <div key={p.product_id} className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E9E2E5] text-xs">
                            <span className="text-[10px] font-bold text-[#6D214F] uppercase">{p.brand}</span>
                            <div className="font-bold text-[#29252A] truncate mt-0.5">{p.product_name}</div>
                            <div className="text-xs font-black text-[#6D214F] mt-1">{formatINR(p.price)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        (comp.products || []).forEach((p) => addToCompare(p));
                        navigate('/compare');
                      }}
                      className="w-full py-2 bg-[#FAF8F5] hover:bg-[#F7E8EE] border border-[#E9E2E5] text-[#6D214F] text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5" /> Re-enter Decision Arena
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ACTIVE WISHLIST PREVIEW */}
          {wishlistCount > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E9E2E5] pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#A85578]" />
                  <h3 className="font-extrabold text-[#29252A] text-lg">Saved In Your Wishlist</h3>
                </div>
                <Link to="/wishlist" className="text-xs font-bold text-[#6D214F] hover:underline flex items-center gap-1">
                  View Full Wishlist <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(wishlistItems || []).slice(0, 3).map((item) => {
                  const prod = item.product || item;
                  return (
                    <div key={item.id || prod?.product_id} className="bg-white p-4 rounded-2xl border border-[#E9E2E5] space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-2 py-0.5 rounded-full">
                        {prod?.brand}
                      </span>
                      <h5 className="font-bold text-xs text-[#29252A] line-clamp-2">{prod?.product_name}</h5>
                      <div className="text-base font-black text-[#6D214F]">{formatINR(prod?.price)}</div>
                      <Link
                        to={`/products/${prod?.product_id}`}
                        className="text-xs font-bold text-[#6D214F] hover:underline block pt-1"
                      >
                        Inspect Specs →
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AUTHENTICATED USER ORDERS */}
          {isAuthenticated && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#E9E2E5] pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[#6D214F]" />
                  <h3 className="font-extrabold text-[#29252A] text-lg">Your Order History</h3>
                </div>
                <Link to="/orders" className="text-xs font-bold text-[#6D214F] hover:underline flex items-center gap-1">
                  All Orders <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingOrders ? (
                <div className="p-6 text-center text-xs text-[#6F6870]">Loading your order records...</div>
              ) : orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.slice(0, 3).map((order) => (
                    <div
                      key={order.order_id}
                      className="bg-white p-4 rounded-2xl border border-[#E9E2E5] flex flex-wrap items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <span className="font-bold text-[#29252A]">Order #{order.order_id}</span>
                        <span className="text-[#6F6870] ml-3">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : ''}
                        </span>
                        <div className="text-[#6F6870] mt-0.5">
                          Total: <strong className="text-[#6D214F]">{formatINR(order.total_amount)}</strong> • Status:{' '}
                          <span className="capitalize font-semibold text-[#29252A]">{order.order_status || 'Pending'}</span>
                        </div>
                      </div>

                      <Link
                        to={`/orders/${order.order_id}`}
                        className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#F7E8EE] border border-[#E9E2E5] text-[#6D214F] font-bold rounded-xl"
                      >
                        Order Details
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#6F6870] bg-white rounded-2xl border border-[#E9E2E5]">
                  No past orders on record for this account.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
