import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useComparison } from '../../context/ComparisonContext';
import { getCurrentUser, updateCurrentUser } from '../../api/auth';
import {
  X,
  Compass,
  Heart,
  ShoppingCart,
  ShoppingBag,
  Scale,
  Sparkles,
  LogOut,
  User,
  ShieldCheck,
  ChevronRight,
  Laptop,
  Mail,
  Calendar,
  Phone,
  Edit3,
  Check,
  AlertCircle,
  RefreshCw,
  LogIn,
  UserPlus,
  Save,
  CheckCircle2
} from 'lucide-react';

export default function AccountSidebar({ isOpen, onClose }) {
  const { user: authUser, isAuthenticated, logout, updateUser } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { itemCount: cartCount } = useCart();
  const { count: compareCount } = useComparison();
  const navigate = useNavigate();
  const drawerRef = useRef(null);

  // Profile data & fetch states
  const [profile, setProfile] = useState(authUser || null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Inline profile editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Fetch full user profile details from backend
  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setFetchError(null);
    try {
      const data = await getCurrentUser();
      setProfile(data);
      if (updateUser) {
        updateUser(data);
      }
      setEditForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
      });
    } catch (err) {
      console.error('Failed to load user profile in AccountSidebar:', err);
      setFetchError(
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        'Unable to load fresh profile details. Showing cached data.'
      );
      // Fallback to auth context user
      if (authUser) {
        setProfile((prev) => prev || authUser);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authUser, updateUser]);

  // Trigger fetch when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setIsEditing(false);
      setSaveSuccess(false);
      setSaveError(null);
      if (isAuthenticated) {
        fetchProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    }
  }, [isOpen, isAuthenticated, fetchProfile]);

  // Keep editForm synced when profile changes
  useEffect(() => {
    if (profile) {
      setEditForm({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
      });
    }
  }, [profile]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogout = () => {
    onClose();
    logout();
    navigate('/');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const payload = {
        first_name: editForm.first_name.trim(),
        last_name: editForm.last_name.trim(),
        email: editForm.email.trim(),
      };
      const updated = await updateCurrentUser(payload);
      setProfile((prev) => ({ ...prev, ...updated }));
      if (updateUser) {
        updateUser(updated);
      }
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsEditing(false);
      }, 1200);
    } catch (err) {
      console.error('Failed to update profile:', err);
      const msg =
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        'Failed to save changes. Please verify input.';
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  // Helper values
  const effectiveUser = profile || authUser;
  const username = effectiveUser?.username || 'Shopper';
  const fullName =
    effectiveUser?.full_name?.trim() ||
    `${effectiveUser?.first_name || ''} ${effectiveUser?.last_name || ''}`.trim() ||
    username;
  const email = effectiveUser?.email || `${username.toLowerCase()}@smartbuy.ai`;
  const phone = effectiveUser?.phone || 'Not provided';
  const memberId = effectiveUser?.id
    ? `#SB-${String(effectiveUser.id).padStart(4, '0')}`
    : '#SB-0001';

  // Format member join date
  const formatJoinDate = (dateString) => {
    if (!dateString) return 'Joined Recently';
    try {
      const d = new Date(dateString);
      return `Member since ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    } catch {
      return 'Active Member';
    }
  };

  // Compute initials (2 letters)
  const computeInitials = () => {
    if (effectiveUser?.first_name && effectiveUser?.last_name) {
      return `${effectiveUser.first_name[0]}${effectiveUser.last_name[0]}`.toUpperCase();
    }
    if (username) {
      const parts = username.split(/[\s_.-]+/);
      if (parts.length > 1 && parts[0] && parts[1]) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return username.slice(0, 2).toUpperCase();
    }
    return 'SB';
  };

  const initials = computeInitials();

  const navItems = [
    {
      to: '/my-journey',
      icon: Compass,
      label: 'My Laptop Journey',
      description: 'Search history, preferences & saved decisions',
      badge: null,
      highlight: true,
    },
    {
      to: '/wishlist',
      icon: Heart,
      label: 'Saved Wishlist',
      description: 'Laptops you have marked as favorites',
      badge: wishlistCount > 0 ? wishlistCount : null,
      badgeColor: 'bg-[#A85578]',
    },
    {
      to: '/cart',
      icon: ShoppingCart,
      label: 'Shopping Cart',
      description: 'Items ready for instant checkout',
      badge: cartCount > 0 ? cartCount : null,
      badgeColor: 'bg-[#6D214F]',
    },
    {
      to: '/orders',
      icon: ShoppingBag,
      label: 'Order History',
      description: 'Past purchases and invoice receipts',
      badge: null,
    },
    {
      to: '/compare',
      icon: Scale,
      label: 'Decision Arena',
      description: 'Side-by-side trade-off spec comparisons',
      badge: compareCount > 0 ? compareCount : null,
      badgeColor: 'bg-[#6D214F]',
    },
    {
      to: '/discovery-studio',
      icon: Sparkles,
      label: 'Discovery Studio',
      description: 'Interactive requirement & budget assistant',
      badge: null,
    },
    {
      to: '/explore',
      icon: Laptop,
      label: 'Explore Catalog',
      description: 'Browse all 76 verified laptop models',
      badge: null,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fadeIn">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-[#29252A]/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-drawer-title"
        className="relative z-50 w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#E9E2E5] animate-slideLeft overflow-hidden"
      >
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#E9E2E5] bg-[#FAF8F5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[#6D214F] font-black text-lg">✦</span>
            <h2 id="account-drawer-title" className="font-extrabold text-[#29252A] text-base">
              {isAuthenticated ? 'User Profile & Account' : 'Account Overview'}
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            {isAuthenticated && !loading && (
              <button
                onClick={fetchProfile}
                title="Refresh profile data"
                className="p-1.5 text-[#6F6870] hover:text-[#6D214F] hover:bg-white rounded-xl transition-all cursor-pointer border border-transparent hover:border-[#E9E2E5]"
                aria-label="Refresh profile"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close user profile"
              className="p-1.5 text-[#6F6870] hover:text-[#29252A] hover:bg-white rounded-xl transition-all cursor-pointer border border-transparent hover:border-[#E9E2E5]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Guest State if Not Authenticated */}
          {!isAuthenticated ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#FAF8F5] to-[#F7E8EE]/40 p-6 rounded-2xl border border-[#E9E2E5] text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-[#E9E2E5] text-[#6D214F] flex items-center justify-center shadow-xs">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#29252A] text-base">Guest Shopper</h3>
                  <p className="text-xs text-[#6F6870] mt-1 leading-relaxed">
                    Sign in to your SmartBuy AI account to save your laptop journey, sync comparisons, and track order histories.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2.5 pt-2">
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="w-full py-2.5 px-3 bg-white hover:bg-[#FAF8F5] text-[#29252A] hover:text-[#6D214F] border border-[#E9E2E5] rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={onClose}
                    className="w-full py-2.5 px-3 bg-[#6D214F] hover:bg-[#8B315F] text-white rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Create Account
                  </Link>
                </div>
              </div>

              {/* Guest Features Info */}
              <div className="bg-white p-4 rounded-2xl border border-[#E9E2E5] space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#989198] block">
                  Why Create an Account?
                </span>
                <ul className="text-xs text-[#6F6870] space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#6D214F] shrink-0" />
                    <span>Personalized AI recommendations across sessions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#6D214F] shrink-0" />
                    <span>Side-by-side Decision Arena comparison memory</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#6D214F] shrink-0" />
                    <span>Permanent wishlist & fast 1-click checkout</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            /* Authenticated User View */
            <div className="space-y-5">
              {/* Fetch Error Banner with Retry */}
              {fetchError && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{fetchError}</span>
                  </div>
                  <button
                    onClick={fetchProfile}
                    className="text-amber-800 font-bold underline shrink-0 hover:text-amber-950 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Loading Skeleton */}
              {loading && !profile ? (
                <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E9E2E5] animate-pulse space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-200" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                      <div className="h-3 bg-gray-200 rounded-md w-1/2" />
                    </div>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-[#E9E2E5]">
                    <div className="h-3 bg-gray-200 rounded-md w-full" />
                    <div className="h-3 bg-gray-200 rounded-md w-4/5" />
                  </div>
                </div>
              ) : (
                /* Profile Card & Details */
                <div className="bg-gradient-to-br from-[#FAF8F5] to-[#F7E8EE]/40 p-5 rounded-2xl border border-[#E9E2E5] shadow-xs space-y-4">
                  {/* Avatar & Header row */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6D214F] to-[#8B315F] text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-[#29252A] text-base truncate">
                          {fullName}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#6D214F] bg-white border border-[#E9E2E5] px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                          <ShieldCheck className="w-3 h-3 text-[#C9A227]" />
                          Active • Verified
                        </span>
                      </div>
                      <p className="text-xs text-[#6F6870] font-mono mt-0.5 truncate">
                        @{username}
                      </p>
                      <span className="inline-block text-[10px] font-semibold text-[#8B315F] bg-[#F7E8EE] px-2 py-0.5 rounded-md mt-1 border border-[#6D214F]/15">
                        {memberId}
                      </span>
                    </div>
                  </div>

                  {/* Profile Key Metadata Grid */}
                  <div className="pt-3 border-t border-[#E9E2E5]/80 grid grid-cols-1 gap-2.5 text-xs">
                    <div className="flex items-center gap-2.5 text-[#29252A]">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#E9E2E5] flex items-center justify-center text-[#6D214F] shrink-0">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-[#989198] uppercase font-bold block">
                          Email Address
                        </span>
                        <span className="font-medium text-[#29252A] truncate block" title={email}>
                          {email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-[#29252A]">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#E9E2E5] flex items-center justify-center text-[#6D214F] shrink-0">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-[#989198] uppercase font-bold block">
                          Phone Number
                        </span>
                        <span className={`font-medium ${phone === 'Not provided' ? 'text-[#989198] italic' : 'text-[#29252A]'}`}>
                          {phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-[#29252A]">
                      <div className="w-7 h-7 rounded-lg bg-white border border-[#E9E2E5] flex items-center justify-center text-[#6D214F] shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-[#989198] uppercase font-bold block">
                          Membership Status
                        </span>
                        <span className="font-medium text-[#29252A]">
                          {formatJoinDate(effectiveUser?.date_joined)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Edit Profile Toggle Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(!isEditing)}
                      className="w-full py-2 px-3 bg-white hover:bg-[#FAF8F5] text-[#6D214F] hover:text-[#8B315F] border border-[#E9E2E5] hover:border-[#6D214F]/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{isEditing ? 'Close Profile Editor' : 'Edit Profile Details'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Inline Edit Profile Form */}
              {isEditing && (
                <form
                  onSubmit={handleSaveProfile}
                  className="bg-white p-4 rounded-2xl border border-[#6D214F]/25 shadow-sm space-y-3 animate-fadeIn"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#E9E2E5]">
                    <div className="flex items-center gap-1.5">
                      <Edit3 className="w-4 h-4 text-[#6D214F]" />
                      <span className="text-xs font-extrabold text-[#29252A]">
                        Update Personal Details
                      </span>
                    </div>
                    <span className="text-[10px] text-[#989198]">PATCH /auth/me/</span>
                  </div>

                  {saveSuccess && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Profile updated successfully!</span>
                    </div>
                  )}

                  {saveError && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{saveError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6F6870] uppercase mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={editForm.first_name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, first_name: e.target.value })
                        }
                        placeholder="e.g. Shiv"
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D214F]/40"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6F6870] uppercase mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={editForm.last_name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, last_name: e.target.value })
                        }
                        placeholder="e.g. Kumar"
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D214F]/40"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#6F6870] uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      placeholder="e.g. name@example.com"
                      className="w-full px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D214F]/40"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-2 px-3 bg-[#6D214F] hover:bg-[#8B315F] disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      className="py-2 px-3 bg-white hover:bg-[#FAF8F5] text-[#6F6870] border border-[#E9E2E5] font-bold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Quick Shortcuts / Navigation */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#989198] px-1 block mb-2">
              Workspace & Activities
            </span>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`group flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    item.highlight
                      ? 'bg-[#F7E8EE]/40 border-[#6D214F]/20 hover:bg-[#F7E8EE] hover:border-[#6D214F]'
                      : 'bg-white border-[#E9E2E5] hover:border-[#6D214F]/30 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                        item.highlight
                          ? 'bg-[#6D214F] text-white shadow-xs'
                          : 'bg-[#FAF8F5] text-[#6D214F] border border-[#E9E2E5]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#29252A] group-hover:text-[#6D214F] transition-colors truncate">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-[#6F6870] truncate">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.badge !== null && (
                      <span
                        className={`text-white text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.badgeColor || 'bg-[#6D214F]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-[#989198] group-hover:text-[#6D214F] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer with Logout or Guest Callout */}
        <div className="p-6 border-t border-[#E9E2E5] bg-[#FAF8F5] space-y-3 shrink-0">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full py-3 px-4 bg-white hover:bg-[#F7E8EE] text-[#6D214F] border border-[#E9E2E5] hover:border-[#6D214F]/40 font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Account</span>
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-xs text-[#6F6870]">
              <span>Already have an account?</span>
              <Link
                to="/login"
                onClick={onClose}
                className="font-bold text-[#6D214F] hover:underline"
              >
                Log In
              </Link>
            </div>
          )}

          <p className="text-[10px] text-center text-[#989198]">
            SmartBuy AI • Intelligent Laptop Decision Engine
          </p>
        </div>
      </div>
    </div>
  );
}
