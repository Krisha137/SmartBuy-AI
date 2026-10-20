import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatINR } from '../utils/formatters';
import EmptyState from '../components/common/EmptyState';
import ComparisonBar from '../components/comparison/ComparisonBar';
import { ShoppingCart, Trash2, Plus, Minus, Laptop, ArrowRight, ShieldCheck } from 'lucide-react';

export default function CartPage() {
  const { cart, itemCount, subtotal, updateQuantity, removeItem, clearCart, loading } = useCart();

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    } else {
      removeItem(item.id);
    }
  };

  const handleIncrease = (item) => {
    updateQuantity(item.id, item.quantity + 1);
  };

  if (!loading && (!cart.items || cart.items.length === 0)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Your Shopping Cart is Empty"
          message="Add laptops from the catalog or recommendations to build your selection."
          actionText="Explore Laptops"
          actionLink="/explore"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9E2E5] pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#29252A] flex items-center gap-2.5">
            Shopping Cart <ShoppingCart className="w-6 h-6 text-[#6D214F]" />
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6870] mt-1">
            Review your selected laptops before proceeding to checkout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={clearCart}
            className="text-xs text-[#6F6870] hover:text-[#6D214F] border border-[#E9E2E5] hover:border-[#6D214F]/30 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1 font-semibold bg-white cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear Cart
          </button>
          <span className="text-xs bg-[#F7E8EE] text-[#6D214F] border border-[#E9E2E5] px-3.5 py-2 rounded-xl font-bold">
            {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
          </span>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart Items List (LEFT) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items &&
            cart.items.map((item) => {
              const product = item.product;
              if (!product) return null;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-[#E9E2E5] p-5 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Product Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-20 h-20 bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl p-2 flex items-center justify-center shrink-0 text-[#989198]">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.product_name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <Laptop className="w-8 h-8 stroke-[1.5]" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-2.5 py-0.5 rounded-full">
                        {product.brand}
                      </span>
                      <h3 className="font-bold text-[#29252A] text-sm sm:text-base leading-snug hover:text-[#6D214F] transition-colors">
                        <Link to={`/products/${product.product_id}`}>{product.product_name}</Link>
                      </h3>
                      <div className="text-xs text-[#6F6870] font-medium">
                        Unit Price: <span className="font-bold text-[#6D214F]">{formatINR(product.price)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls & Line Total */}
                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E9E2E5]">
                    {/* Quantity Picker */}
                    <div className="flex items-center border border-[#E9E2E5] rounded-xl bg-[#FAF8F5]">
                      <button
                        onClick={() => handleDecrease(item)}
                        className="p-2 text-[#6F6870] hover:text-[#29252A] hover:bg-[#F6F1F3] rounded-l-xl transition-colors cursor-pointer"
                        title="Decrease Quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3.5 py-1 text-xs font-bold text-[#29252A] min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrease(item)}
                        className="p-2 text-[#6F6870] hover:text-[#29252A] hover:bg-[#F6F1F3] rounded-r-xl transition-colors cursor-pointer"
                        title="Increase Quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right">
                      <div className="text-[10px] text-[#989198] uppercase tracking-wider font-bold">Total</div>
                      <div className="text-base font-extrabold text-[#6D214F]">
                        {formatINR(item.line_total)}
                      </div>
                    </div>

                    {/* Remove item button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[#989198] hover:text-[#6D214F] p-2 rounded-xl hover:bg-[#F7E8EE] transition-colors cursor-pointer"
                      title="Remove from Cart"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Order Summary Sidebar (RIGHT) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E9E2E5] p-6 shadow-premium space-y-6 sticky top-24">
          <h2 className="text-lg font-bold text-[#29252A] border-b border-[#E9E2E5] pb-3 flex items-center justify-between">
            <span>Order Summary</span>
            <span className="text-xs font-bold text-[#6D214F] bg-[#F7E8EE] px-2.5 py-0.5 rounded-full">INR (₹)</span>
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-[#6F6870]">
              <span>Items Total ({itemCount})</span>
              <span className="font-semibold text-[#29252A]">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#6F6870]">
              <span>Shipping / Delivery</span>
              <span className="text-[#6D214F] font-bold">FREE Express</span>
            </div>
            <div className="border-t border-[#E9E2E5] pt-3 flex justify-between items-baseline">
              <span className="font-bold text-[#29252A] text-base">Total</span>
              <span className="font-black text-[#6D214F] text-2xl">{formatINR(subtotal)}</span>
            </div>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl p-4 space-y-2 text-xs text-[#6F6870]">
            <div className="flex items-center gap-1.5 font-bold text-[#29252A]">
              <ShieldCheck className="w-4 h-4 text-[#6D214F]" />
              Authentic SmartBuy AI Checkout
            </div>
            <p className="leading-relaxed text-[#6F6870]">
              All items in cart are saved directly to your PostgreSQL account profile.
            </p>
          </div>

          <div className="pt-2 space-y-2.5">
            <Link
              to="/checkout"
              className="w-full py-3.5 bg-[#6D214F] hover:bg-[#8B315F] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/explore"
              className="w-full py-2.5 bg-[#FAF8F5] hover:bg-[#F6F1F3] text-[#29252A] font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-1 border border-[#E9E2E5]"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      <ComparisonBar />
    </div>
  );
}
