import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { formatINR, formatRating, getImageUrl } from '../../utils/formatters';
import { useComparison } from '../../context/ComparisonContext';
import { useAuth } from '../../context/AuthContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import {
  Laptop,
  Cpu,
  HardDrive,
  Star,
  Scale,
  Check,
  ArrowRight,
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Sparkles,
  Zap
} from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCompare, removeFromCompare, isInComparison } = useComparison();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, addWishlist, removeWishlist } = useWishlist();
  const { addCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const inCompare = isInComparison(product.product_id);
  const inWishlist = isInWishlist(product.product_id);

  const images =
    product?.images && product.images.length > 0
      ? product.images
      : product?.image_url
      ? [{ id: 'primary', url: product.image_url, type: 'front' }]
      : [];

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const matchScore =
    product.match_score !== undefined && product.match_score !== null
      ? Math.round(product.match_score)
      : product.score !== undefined
      ? Math.round(product.score)
      : null;

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      setImgError(false);
    }
  };

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImgIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      setImgError(false);
    }
  };

  const toggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inCompare) {
      removeFromCompare(product.product_id);
    } else {
      addToCompare(product);
    }
  };

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (inWishlist) {
      await removeWishlist(product.product_id);
    } else {
      await addWishlist(product.product_id);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setAddingToCart(true);
    try {
      await addCart(product.product_id, 1);
    } finally {
      setAddingToCart(false);
    }
  };

  // Grounded "Why consider this?" rationale generated dynamically from verified specs
  const whyConsider = (() => {
    if (product.ram_gb >= 16 && product.gpu_type === 'Dedicated') {
      return `${product.ram_gb}GB RAM & Dedicated ${product.gpu} for heavy workloads`;
    }
    if (product.weight_kg && Number(product.weight_kg) <= 1.45) {
      return `Ultra-portable ${product.weight_kg}kg build suited for daily travel`;
    }
    if (product.battery_life && Number(product.battery_life) >= 10) {
      return `Verified ${product.battery_life}h battery life for all-day unplugged work`;
    }
    if (product.ram_gb >= 16) {
      return `16GB+ RAM installed for responsive code & multitasking`;
    }
    if (product.storage_gb >= 1024) {
      return `Generous 1TB SSD storage for extensive project files`;
    }
    if (product.display_resolution && (product.display_resolution.includes('2K') || product.display_resolution.includes('4K') || product.display_resolution.includes('OLED'))) {
      return `High-definition ${product.display_resolution} panel for visual clarity`;
    }
    return `${product.brand} ${product.product_segment || 'Laptop'} with verified PostgreSQL specs`;
  })();

  const matchedCriteria = [
    product.ram_gb >= 16 ? 'RAM requirement met (16GB+)' : `${product.ram_gb}GB RAM installed`,
    product.storage_type === 'SSD' ? 'High-speed SSD storage' : `${product.storage_gb}GB Storage`,
    product.product_segment ? `${product.product_segment} segment matched` : 'Use case requirement',
    product.battery_life ? `${product.battery_life}h battery life specification` : null,
    product.weight_kg ? `${product.weight_kg}kg weight specification` : null,
  ].filter(Boolean);

  return (
    <div
      className="bg-white rounded-[22px] border border-[#E9E2E5] hover:border-[#6D214F]/40 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col justify-between overflow-hidden group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Banner & Image Gallery Container */}
      <div className="relative p-4 bg-[#FAF8F5] flex flex-col items-center justify-center border-b border-[#E9E2E5]">
        {/* Match / Brand Badge (Left) & Wishlist (Right) */}
        <div className="w-full flex items-center justify-between gap-2 mb-2 z-10">
          <div>
            {matchScore !== null ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMatchModal(true);
                }}
                className="text-[11px] font-bold text-[#6D214F] bg-[#F7E8EE] border border-[#E9E2E5] hover:bg-[#F2ECF7] px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                title="Click to inspect requirement match"
              >
                <span>✦</span> {matchScore}% FIT
              </button>
            ) : (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-2.5 py-0.5 rounded-full">
                {product.brand}
              </span>
            )}
          </div>

          <button
            onClick={toggleWishlist}
            className={`p-1.5 rounded-full transition-all cursor-pointer ${
              inWishlist
                ? 'bg-[#F7E8EE] text-[#A85578]'
                : 'bg-white text-[#989198] hover:text-[#A85578] hover:bg-[#F7E8EE] border border-[#E9E2E5]'
            }`}
            title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#A85578] text-[#A85578]' : ''}`} />
          </button>
        </div>

        {/* Laptop Image Slider Container */}
        <div className="w-full h-36 sm:h-40 relative flex items-center justify-center text-[#989198] overflow-hidden">
          {images.length > 0 && !imgError ? (
            <img
              src={getImageUrl(images[currentImgIndex]?.url)}
              alt={`${product.product_name} - ${images[currentImgIndex]?.type || 'View'}`}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#F6F1F3] rounded-xl text-[#6F6870] p-2 text-center border border-dashed border-[#E9E2E5]">
              <Laptop className="w-10 h-10 stroke-[1.5] text-[#989198]" />
              <span className="text-[11px] text-[#6F6870] font-semibold mt-1">Image unavailable</span>
              <span className="text-[9px] text-[#989198] font-mono">ID: {product.product_id}</span>
            </div>
          )}

          {images[currentImgIndex]?.source_type === 'ai_generated' && (
            <span
              className="absolute top-1 right-1 text-[9px] font-medium text-[#6F6870] bg-white/90 border border-[#E9E2E5] px-1.5 py-0.5 rounded-md shadow-xs z-10"
              title="AI-generated product visualization"
            >
              AI visualization
            </span>
          )}

          {/* Image Navigation Controls */}
          {images.length > 1 && !imgError && isHovered && (
            <div className="absolute inset-x-1 flex items-center justify-between pointer-events-none z-10">
              <button
                onClick={prevImage}
                className="pointer-events-auto p-1 rounded-full bg-white/90 hover:bg-white text-[#29252A] shadow-sm border border-[#E9E2E5] transition-transform active:scale-90 cursor-pointer"
                title="Previous view"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={nextImage}
                className="pointer-events-auto p-1 rounded-full bg-white/90 hover:bg-white text-[#29252A] shadow-sm border border-[#E9E2E5] transition-transform active:scale-90 cursor-pointer"
                title="Next view"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Dots Indicator */}
          {images.length > 1 && !imgError && (
            <div className="absolute bottom-1 inset-x-0 flex items-center justify-center gap-1 z-10">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImgIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentImgIndex ? 'w-4 bg-[#6D214F]' : 'w-1.5 bg-[#E9E2E5] hover:bg-[#6F6870]'
                  }`}
                  title={img.type ? `${img.type} view` : `View ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6D214F] mb-1 uppercase tracking-wider">
            <span>{product.brand}</span>
            {product.product_segment && <span>• {product.product_segment}</span>}
          </div>

          <h3 className="font-bold text-[#29252A] text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-[#6D214F] transition-colors">
            <Link to={`/products/${product.product_id}`}>{product.product_name}</Link>
          </h3>

          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-[#6D214F]">
              {formatINR(product.price)}
            </span>
            {product.original_price && Number(product.original_price) > Number(product.price) && (
              <span className="text-xs text-[#989198] line-through">
                {formatINR(product.original_price)}
              </span>
            )}
          </div>
        </div>

        {/* Dynamic "Why consider this?" Insight Pill */}
        <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E9E2E5] text-[11px] text-[#29252A] flex items-start gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
          <span className="line-clamp-2 font-medium leading-tight">
            <strong>Why consider:</strong> {whyConsider}
          </span>
        </div>

        {/* 3-4 Key Specifications Row */}
        <div className="grid grid-cols-2 gap-1.5 text-[11px] text-[#6F6870]">
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1.5 rounded-xl border border-[#E9E2E5]">
            <Cpu className="w-3.5 h-3.5 text-[#6D214F] shrink-0" />
            <span className="truncate font-semibold">{product.ram_gb}GB RAM</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1.5 rounded-xl border border-[#E9E2E5]">
            <HardDrive className="w-3.5 h-3.5 text-[#6D214F] shrink-0" />
            <span className="truncate font-semibold">{product.storage_gb}GB {product.storage_type}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1.5 rounded-xl border border-[#E9E2E5] col-span-2">
            <span className="text-[#6D214F] font-bold">⚡</span>
            <span className="truncate font-semibold">
              {product.processor} {product.battery_life ? `• ${product.battery_life}h Battery` : ''}
            </span>
          </div>
        </div>

        {/* Rating Row */}
        <div className="pt-2 border-t border-[#E9E2E5] flex items-center justify-between text-xs text-[#6F6870]">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-[#C9A227] text-[#C9A227]" />
            <span className="font-bold text-[#29252A]">{formatRating(product.rating)}</span>
            <span className="text-[#989198]">({product.review_count} reviews)</span>
          </div>
          {matchScore !== null && (
            <button
              onClick={() => setShowMatchModal(true)}
              className="text-[11px] text-[#6D214F] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              Match details <Info className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Card Actions Panel */}
      <div className="p-3 bg-[#FAF8F5] border-t border-[#E9E2E5] flex items-center gap-2">
        <Link
          to={`/products/${product.product_id}`}
          className="flex-1 py-2 px-3 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl text-center transition-all flex items-center justify-center gap-1 shadow-xs active:scale-95"
        >
          Details <ArrowRight className="w-3 h-3" />
        </Link>

        <button
          onClick={handleAddToCart}
          disabled={addingToCart}
          title="Add to Cart"
          aria-label="Add to Cart"
          className="p-2 rounded-xl border border-[#E9E2E5] bg-white text-[#29252A] hover:bg-[#F7E8EE] hover:border-[#6D214F]/30 hover:text-[#6D214F] transition-colors cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>

        <button
          onClick={toggleCompare}
          title={inCompare ? 'Remove from Arena' : 'Add to Arena'}
          aria-label={inCompare ? 'Remove from Arena' : 'Add to Arena'}
          className={`p-2 rounded-xl border text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
            inCompare
              ? 'bg-[#F7E8EE] border-[#6D214F]/40 text-[#6D214F] font-bold'
              : 'bg-white border-[#E9E2E5] text-[#6F6870] hover:bg-[#FAF8F5]'
          }`}
        >
          {inCompare ? <Check className="w-4 h-4 text-[#6D214F]" /> : <Scale className="w-4 h-4 text-[#6F6870]" />}
        </button>
      </div>

      {/* Match Breakdown Modal */}
      {showMatchModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowMatchModal(false)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E9E2E5] max-w-sm w-full p-6 space-y-4 shadow-xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E9E2E5] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-[#6D214F] text-lg font-bold">✦</span>
                <h4 className="font-bold text-[#29252A] text-sm">
                  Why this matches ({matchScore}%)
                </h4>
              </div>
              <button onClick={() => setShowMatchModal(false)} className="text-[#989198] hover:text-[#29252A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <ul className="space-y-2 text-xs text-[#29252A]">
              {matchedCriteria.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E9E2E5]">
                  <span className="text-[#6D214F] font-bold shrink-0">✓</span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setShowMatchModal(false)}
              className="w-full py-2 bg-[#6D214F] text-white text-xs font-bold rounded-xl hover:bg-[#8B315F] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
