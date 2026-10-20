import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useComparison } from '../context/ComparisonContext';
import { formatINR } from '../utils/formatters';
import EmptyState from '../components/common/EmptyState';
import ComparisonBar from '../components/comparison/ComparisonBar';
import { Heart, Trash2, ShoppingCart, Scale, Laptop, Cpu, HardDrive } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistItems, removeWishlist, loading } = useWishlist();
  const { addCart } = useCart();
  const { addToCompare, isInComparison } = useComparison();

  if (!loading && wishlistItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Your future favorites live here."
          message="Save laptops to review, compare, or purchase later when you're ready."
          actionText="Explore Laptops"
          actionLink="/explore"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E9E2E5] pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#29252A] flex items-center gap-2.5">
            Your Wishlist <Heart className="w-6 h-6 text-[#A85578] fill-[#A85578]" />
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6870] mt-1">
            Saved laptops in your personal account wishlist.
          </p>
        </div>

        <div className="text-xs bg-[#FAF8F5] border border-[#E9E2E5] text-[#6F6870] px-3.5 py-2 rounded-xl font-medium">
          Saved Items: <strong className="text-[#6D214F] font-bold">{wishlistItems.length}</strong>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => {
          const product = item.product;
          if (!product) return null;
          const inCompare = isInComparison(product.product_id);

          return (
            <div key={item.id} className="bg-white rounded-2xl border border-[#E9E2E5] p-5 shadow-premium hover:shadow-premium-hover transition-all duration-300 space-y-4 flex flex-col justify-between">
              
              <div className="space-y-3">
                
                {/* Header Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#6D214F] bg-[#F7E8EE] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {product.brand}
                  </span>
                  <button
                    onClick={() => removeWishlist(product.product_id)}
                    className="text-[#989198] hover:text-[#A85578] p-1 transition-colors cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Laptop Image */}
                <div className="h-36 bg-[#FAF8F5] rounded-xl border border-[#E9E2E5] p-2 flex flex-col items-center justify-center text-[#989198]">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.product_name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Laptop className="w-12 h-12 stroke-[1.5] text-[#989198]" />
                  )}
                </div>

                {/* Title & Price */}
                <div>
                  <h3 className="font-bold text-[#29252A] text-sm line-clamp-2 leading-snug hover:text-[#6D214F] transition-colors">
                    <Link to={`/products/${product.product_id}`}>
                      {product.product_name}
                    </Link>
                  </h3>

                  <div className="mt-2 text-xl font-extrabold text-[#6D214F]">
                    {formatINR(product.price)}
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-1.5 text-xs text-[#6F6870] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E9E2E5]">
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#6D214F]" />
                    <span>{product.ram_gb}GB RAM</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-[#6D214F]" />
                    <span>{product.storage_gb}GB {product.storage_type}</span>
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-[#E9E2E5]">
                <button
                  onClick={() => addCart(product.product_id, 1)}
                  className="w-full py-2.5 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/products/${product.product_id}`}
                    className="flex-1 py-1.5 bg-[#FAF8F5] hover:bg-[#F6F1F3] border border-[#E9E2E5] text-[#29252A] text-xs font-semibold rounded-xl text-center transition-colors"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => addToCompare(product)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                      inCompare ? 'bg-[#F7E8EE] border-[#6D214F]/40 text-[#6D214F]' : 'bg-white border-[#E9E2E5] text-[#6F6870]'
                    }`}
                  >
                    <Scale className="w-3.5 h-3.5" /> {inCompare ? 'Added' : 'Compare'}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      <ComparisonBar />

    </div>
  );
}
