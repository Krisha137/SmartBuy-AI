import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useComparison } from '../../context/ComparisonContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { Scale, Compass, Menu, X, Heart, ShoppingCart, ShoppingBag, LogOut, LogIn, UserPlus } from 'lucide-react';

export default function Header() {
  const { count: compareCount } = useComparison();
  const { user, isAuthenticated, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const { itemCount: cartCount } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E9E2E5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6D214F] to-[#8B315F] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-lg font-bold">✦</span>
          </div>
          <div>
            <div className="flex items-center gap-1 font-bold text-lg text-[#29252A] leading-none tracking-tight">
              SMARTBUY <span className="text-[#6D214F] font-extrabold flex items-center gap-0.5 ml-0.5">AI</span>
            </div>
            <span className="text-[10px] text-[#6F6870] font-semibold tracking-wider uppercase">Laptop Decision Engine</span>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 font-medium text-xs">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'text-[#6D214F] bg-[#F7E8EE] font-bold shadow-xs'
                  : 'text-[#6F6870] hover:text-[#29252A] hover:bg-[#FAF8F5]'
              }`
            }
          >
            <span className="text-[#6D214F]">✦</span>
            Home
          </NavLink>

          <NavLink
            to="/discovery-studio"
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'text-[#6D214F] bg-[#F7E8EE] font-extrabold shadow-xs'
                  : 'text-[#6D214F] bg-[#FAF8F5] hover:bg-[#F7E8EE] border border-[#E9E2E5] font-bold'
              }`
            }
          >
            <span className="text-sm">✦</span>
            Discovery Studio
          </NavLink>

          <NavLink
            to="/compare"
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 relative ${
                isActive
                  ? 'text-[#6D214F] bg-[#F7E8EE] font-bold shadow-xs'
                  : 'text-[#6F6870] hover:text-[#29252A] hover:bg-[#FAF8F5]'
              }`
            }
          >
            <Scale className="w-4 h-4 text-[#6F6870]" />
            Arena
            {compareCount > 0 && (
              <span className="ml-0.5 bg-[#6D214F] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {compareCount}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/budget-simulator"
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'text-[#6D214F] bg-[#F7E8EE] font-bold shadow-xs'
                  : 'text-[#6F6870] hover:text-[#29252A] hover:bg-[#FAF8F5]'
              }`
            }
          >
            <span>₹</span>
            Simulator
          </NavLink>

          <NavLink
            to="/my-journey"
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'text-[#6D214F] bg-[#F7E8EE] font-bold shadow-xs'
                  : 'text-[#6F6870] hover:text-[#29252A] hover:bg-[#FAF8F5]'
              }`
            }
          >
            <Compass className="w-4 h-4 text-[#6F6870]" />
            My Journey
          </NavLink>

          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'text-[#6D214F] bg-[#F7E8EE] font-bold shadow-xs'
                  : 'text-[#6F6870] hover:text-[#29252A] hover:bg-[#FAF8F5]'
              }`
            }
          >
            Explore
          </NavLink>

          {/* Wishlist */}
          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 relative ${
                isActive
                  ? 'text-[#6D214F] bg-[#F7E8EE] font-bold shadow-xs'
                  : 'text-[#6F6870] hover:text-[#29252A] hover:bg-[#FAF8F5]'
              }`
            }
          >
            <Heart className="w-4 h-4 text-[#A85578]" />
            Wishlist
            {wishlistCount > 0 && (
              <span className="ml-0.5 bg-[#A85578] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {wishlistCount}
              </span>
            )}
          </NavLink>

          {/* Cart */}
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 relative ${
                isActive
                  ? 'text-[#6D214F] bg-[#F7E8EE] font-bold shadow-xs'
                  : 'text-[#6F6870] hover:text-[#29252A] hover:bg-[#FAF8F5]'
              }`
            }
          >
            <ShoppingCart className="w-4 h-4 text-[#6D214F]" />
            Cart
            {cartCount > 0 && (
              <span className="ml-0.5 bg-[#6D214F] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {cartCount}
              </span>
            )}
          </NavLink>

          {/* My Orders */}
          {isAuthenticated && (
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#6D214F] bg-[#F7E8EE] font-bold shadow-xs'
                    : 'text-[#6F6870] hover:text-[#29252A] hover:bg-[#FAF8F5]'
                }`
              }
            >
              <ShoppingBag className="w-4 h-4 text-[#6D214F]" />
              Orders
            </NavLink>
          )}

          {/* User Auth Section */}
          <div className="ml-2 pl-2 border-l border-[#E9E2E5] flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 select-text">
                  {user?.avatar || user?.profile_image ? (
                    <img
                      src={user.avatar || user.profile_image}
                      alt={user?.username || 'User avatar'}
                      className="w-4 h-4 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-[#6D214F] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-[#29252A]">
                    {user?.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-1.5 text-[#6F6870] hover:text-[#6D214F] hover:bg-[#F7E8EE] rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs font-semibold text-[#29252A] hover:text-[#6D214F] hover:bg-[#F7E8EE] rounded-xl transition-colors flex items-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" /> Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#6D214F] hover:bg-[#8B315F] rounded-xl transition-all flex items-center gap-1 shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Sign Up
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile menu toggle button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#29252A] hover:bg-[#F6F1F3] rounded-xl transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-[#6D214F]" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E9E2E5] bg-[#FAF8F5] px-4 pt-3 pb-4 space-y-3 shadow-md animate-fadeIn">
          <div className="flex flex-col space-y-1 pt-1">
            <NavLink
              to="/"
              end
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl font-medium text-xs flex items-center gap-2 ${
                  isActive ? 'text-[#6D214F] bg-[#F7E8EE] font-bold' : 'text-[#29252A] hover:bg-[#F6F1F3]'
                }`
              }
            >
              <span className="text-[#6D214F]">✦</span>
              Home
            </NavLink>

            <NavLink
              to="/discovery-studio"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${
                  isActive ? 'text-[#6D214F] bg-[#F7E8EE]' : 'text-[#6D214F] bg-[#FAF8F5] hover:bg-[#F7E8EE]'
                }`
              }
            >
              <span>✦</span>
              Discovery Studio
            </NavLink>

            <NavLink
              to="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl font-medium text-xs flex items-center justify-between ${
                  isActive ? 'text-[#6D214F] bg-[#F7E8EE] font-bold' : 'text-[#29252A] hover:bg-[#F6F1F3]'
                }`
              }
            >
              <span className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-[#6F6870]" />
                Decision Arena
              </span>
              {compareCount > 0 && (
                <span className="bg-[#6D214F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {compareCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/budget-simulator"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl font-medium text-xs flex items-center gap-2 ${
                  isActive ? 'text-[#6D214F] bg-[#F7E8EE] font-bold' : 'text-[#29252A] hover:bg-[#F6F1F3]'
                }`
              }
            >
              <span>₹</span>
              Budget Simulator
            </NavLink>

            <NavLink
              to="/my-journey"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl font-medium text-xs flex items-center gap-2 ${
                  isActive ? 'text-[#6D214F] bg-[#F7E8EE] font-bold' : 'text-[#29252A] hover:bg-[#F6F1F3]'
                }`
              }
            >
              <Compass className="w-4 h-4 text-[#6F6870]" />
              My Journey
            </NavLink>

            <NavLink
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl font-medium text-xs flex items-center gap-2 ${
                  isActive ? 'text-[#6D214F] bg-[#F7E8EE] font-bold' : 'text-[#29252A] hover:bg-[#F6F1F3]'
                }`
              }
            >
              <Compass className="w-4 h-4 text-[#6F6870]" />
              Explore Catalog
            </NavLink>

            <NavLink
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl font-medium text-xs flex items-center justify-between ${
                  isActive ? 'text-[#6D214F] bg-[#F7E8EE] font-bold' : 'text-[#29252A] hover:bg-[#F6F1F3]'
                }`
              }
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#A85578]" />
                Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="bg-[#A85578] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </NavLink>

            <NavLink
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl font-medium text-xs flex items-center justify-between ${
                  isActive ? 'text-[#6D214F] bg-[#F7E8EE] font-bold' : 'text-[#29252A] hover:bg-[#F6F1F3]'
                }`
              }
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#6D214F]" />
                Cart
              </span>
              {cartCount > 0 && (
                <span className="bg-[#6D214F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </NavLink>

            {isAuthenticated && (
              <NavLink
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-xl font-medium text-xs flex items-center gap-2 ${
                    isActive ? 'text-[#6D214F] bg-[#F7E8EE] font-bold' : 'text-[#29252A] hover:bg-[#F6F1F3]'
                  }`
                }
              >
                <ShoppingBag className="w-4 h-4 text-[#6D214F]" />
                My Orders
              </NavLink>
            )}

            {/* Mobile Auth options */}
            <div className="pt-2 border-t border-[#E9E2E5] flex flex-col space-y-1">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-[#29252A] flex items-center gap-2 select-text">
                    {user?.avatar || user?.profile_image ? (
                      <img
                        src={user.avatar || user.profile_image}
                        alt={user?.username || 'User avatar'}
                        className="w-5 h-5 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-[#6D214F] text-white text-xs font-bold flex items-center justify-center shrink-0">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span>{user?.username}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl font-medium text-xs text-[#6D214F] hover:bg-[#F7E8EE] flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Log Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center text-xs font-semibold text-[#29252A] bg-white border border-[#E9E2E5] rounded-xl hover:bg-[#F6F1F3]"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-center text-xs font-bold text-white bg-[#6D214F] rounded-xl hover:bg-[#8B315F]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
