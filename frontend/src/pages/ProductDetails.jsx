import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getProduct } from '../api/products';
import { getReviewIntelligence, getReviews } from '../api/reviews';
import SpecGrid from '../components/products/SpecGrid';
import ReviewIntelligenceCard from '../components/reviews/ReviewIntelligenceCard';
import { ReviewList } from '../components/reviews/ReviewCard';
import AskLaptopPanel from '../components/qa/AskLaptopPanel';
import { DetailsSkeleton } from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import ComparisonBar from '../components/comparison/ComparisonBar';
import { useComparison } from '../context/ComparisonContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatINR, formatRating, getImageUrl } from '../utils/formatters';
import { addRecentlyViewed } from '../utils/journeyStorage';
import { ArrowLeft, Laptop, Star, Scale, Check, Heart, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductDetails() {
  const { productId } = useParams();
  const { addToCompare, removeFromCompare, isInComparison } = useComparison();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, addWishlist, removeWishlist } = useWishlist();
  const { addCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [intelligence, setIntelligence] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [detailImgError, setDetailImgError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.all([
      getProduct(productId),
      getReviewIntelligence(productId).catch(() => null),
      getReviews(productId).catch(() => ({ results: [] }))
    ])
      .then(([prodRes, intelRes, revRes]) => {
        if (isMounted) {
          setProduct(prodRes);
          setIntelligence(intelRes);
          setReviews(revRes?.results || revRes || []);
          setLoading(false);
          // Save to journey history
          if (prodRes) {
            addRecentlyViewed(prodRes);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Product not found.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState
          title="Product Not Found"
          message={error || `Product with ID '${productId}' could not be loaded.`}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const galleryImages = product?.images && product.images.length > 0
    ? product.images
    : (product?.image_url ? [{ id: 'primary', url: product.image_url, type: 'front' }] : []);

  const inCompare = isInComparison(product.product_id);
  const inWishlist = isInWishlist(product.product_id);

  const toggleCompare = () => {
    if (inCompare) {
      removeFromCompare(product.product_id);
    } else {
      addToCompare(product);
    }
  };

  const toggleWishlist = async () => {
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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    await addCart(product.product_id, 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24 animate-fadeIn">
      
      {/* Back link */}
      <div>
        <Link to="/explore" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D214F] hover:underline transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
        </Link>
      </div>

      {/* Header Presentation Section */}
      <div className="bg-white rounded-3xl border border-[#E9E2E5] p-6 sm:p-8 shadow-premium grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Product Image Gallery Box (LEFT) */}
        <div className="md:col-span-5 bg-white border border-[#E9E2E5] rounded-2xl p-6 shadow-xs flex flex-col items-center justify-between space-y-4">
          
          {/* Main Display Image Container */}
          <div className="relative w-full h-72 bg-[#FAF8F5] border border-[#E9E2E5] rounded-2xl flex items-center justify-center overflow-hidden p-4">
            {galleryImages.length > 0 && !detailImgError ? (
              <>
                <img
                  src={getImageUrl(galleryImages[activeImgIndex]?.url)}
                  alt={`${product.product_name} - ${galleryImages[activeImgIndex]?.type || 'View'}`}
                  className="max-h-full max-w-full object-contain transition-all duration-300"
                  onError={() => setDetailImgError(true)}
                />

                {/* View Type Badge */}
                {galleryImages[activeImgIndex]?.type && (
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-[#6D214F] text-white px-2.5 py-0.5 rounded-full shadow-xs">
                    {galleryImages[activeImgIndex].type} view
                  </span>
                )}

                {/* AI Visualization Badge */}
                {galleryImages[activeImgIndex]?.source_type === 'ai_generated' && (
                  <span className="absolute top-3 right-3 text-[10px] font-medium text-[#6F6870] bg-white/90 border border-[#E9E2E5] px-2 py-0.5 rounded-md shadow-xs z-10" title="AI-generated product visualization">
                    AI-generated visualization
                  </span>
                )}

                {/* Previous / Next Arrow buttons */}
                {galleryImages.length > 1 && (
                  <div className="absolute inset-x-2 flex items-center justify-between pointer-events-none">
                    <button
                      onClick={() => setActiveImgIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))}
                      className="pointer-events-auto p-2 rounded-full bg-white/90 hover:bg-white text-[#29252A] shadow-md border border-[#E9E2E5] transition-transform active:scale-90 cursor-pointer"
                      title="Previous view"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveImgIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))}
                      className="pointer-events-auto p-2 rounded-full bg-white/90 hover:bg-white text-[#29252A] shadow-md border border-[#E9E2E5] transition-transform active:scale-90 cursor-pointer"
                      title="Next view"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-[#989198] p-6 text-center space-y-2">
                <Laptop className="w-16 h-16 stroke-[1.2] text-[#989198]" />
                <span className="text-xs font-semibold text-[#6F6870]">Laptop image unavailable</span>
                <span className="text-[10px] text-[#989198] font-mono">Product ID: {product.product_id}</span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {galleryImages.length > 1 && !detailImgError && (
            <div className="flex items-center gap-2 overflow-x-auto w-full pt-1 pb-1 justify-center">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIndex(idx)}
                  className={`w-14 h-14 rounded-xl border-2 p-1 bg-[#FAF8F5] transition-all shrink-0 flex items-center justify-center cursor-pointer ${
                    idx === activeImgIndex
                      ? 'border-[#6D214F] ring-2 ring-[#F7E8EE] scale-105'
                      : 'border-[#E9E2E5] opacity-70 hover:opacity-100'
                  }`}
                  title={img.type ? `${img.type} view` : `View ${idx + 1}`}
                >
                  <img src={getImageUrl(img.url)} alt="" className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column (RIGHT) */}
        <div className="md:col-span-7 space-y-5">
          
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-3 py-1 rounded-full border border-[#E9E2E5]">
              {product.brand} {product.product_segment ? `• ${product.product_segment}` : ''}
            </span>
            <span className="text-xs text-[#989198] font-mono">ID: {product.product_id}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#29252A] leading-tight">
            {product.product_name}
          </h1>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-[#6D214F]">
              {formatINR(product.price)}
            </span>
            {product.original_price && Number(product.original_price) > Number(product.price) && (
              <span className="text-base text-[#989198] line-through">
                {formatINR(product.original_price)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#6F6870]">
            <div className="flex items-center gap-1 font-bold text-[#C9A227] bg-[#FAF5E8] px-3 py-1 rounded-full border border-[#E9E2E5]">
              <Star className="w-4 h-4 fill-[#C9A227]" />
              <span>{formatRating(product.rating)} / 5.0</span>
            </div>
            <span>Based on {product.review_count} verified reviews</span>
          </div>

          {/* Quick Summary Pill Banner */}
          <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E9E2E5] text-xs text-[#29252A] space-y-2">
            <div className="font-bold text-[#6D214F] uppercase tracking-wider text-[11px] flex items-center gap-1">
              <span>✦</span> Executive Spec Summary
            </div>
            <p className="leading-relaxed text-[#6F6870]">
              Powered by <strong className="text-[#29252A]">{product.processor}</strong> with <strong className="text-[#29252A]">{product.ram_gb}GB RAM</strong> and <strong className="text-[#29252A]">{product.storage_gb}GB {product.storage_type}</strong>. Features <strong className="text-[#29252A]">{product.gpu}</strong> graphics ({product.gpu_type}) and listed {product.battery_life || 8}h battery life.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleAddToCart}
              className="px-6 py-3.5 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md active:scale-95 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>

            <button
              onClick={toggleWishlist}
              className={`px-5 py-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                inWishlist
                  ? 'bg-[#F7E8EE] border-[#6D214F]/40 text-[#6D214F]'
                  : 'bg-white border-[#E9E2E5] text-[#29252A] hover:bg-[#FAF8F5]'
              }`}
            >
              <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#A85578] text-[#A85578]' : ''}`} />
              {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
            </button>

            <button
              onClick={toggleCompare}
              className={`px-5 py-3.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
                inCompare
                  ? 'bg-[#F7E8EE] border-[#6D214F]/40 text-[#6D214F]'
                  : 'bg-white border-[#E9E2E5] text-[#29252A] hover:bg-[#FAF8F5]'
              }`}
            >
              {inCompare ? <Check className="w-4 h-4 text-[#6D214F]" /> : <Scale className="w-4 h-4 text-[#6F6870]" />}
              {inCompare ? 'Added to Comparison ✓' : 'Add to Comparison'}
            </button>
          </div>

        </div>

      </div>

      {/* Key Specifications Section */}
      <SpecGrid product={product} />

      {/* Customer Review Intelligence Section */}
      {intelligence && (
        <ReviewIntelligenceCard intelligence={intelligence} productId={product.product_id} />
      )}

      {/* Ask SmartBuy Intelligence Section */}
      <AskLaptopPanel productId={product.product_id} productName={product.product_name} />

      {/* Customer Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#29252A] border-b border-[#E9E2E5] pb-3 flex items-center gap-2">
          <span>Customer Review Feedback</span>
          <span className="text-xs bg-[#FAF8F5] text-[#6D214F] px-2.5 py-0.5 rounded-full border border-[#E9E2E5]">
            {reviews.length} Verified
          </span>
        </h3>
        <ReviewList reviews={reviews} />
      </div>

      <ComparisonBar />

    </div>
  );
}
