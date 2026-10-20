import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../api/orders';
import { formatINR } from '../utils/formatters';
import EmptyState from '../components/common/EmptyState';
import { ShieldCheck, Truck, ArrowLeft, CheckCircle2, Laptop } from 'lucide-react';

export default function Checkout() {
  const { cart, itemCount, subtotal, refreshCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    customer_name: user?.username || '',
    email: user?.email || '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India'
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: cleaned }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const order = await placeOrder(formData);
      await refreshCart();
      navigate(`/order-confirmation/${order.order_number}`, { state: { order } });
    } catch (err) {
      setError(
        err.response?.data?.phone?.[0] ||
        err.response?.data?.cart ||
        err.response?.data?.detail ||
        err.message ||
        'Failed to place order. Please verify your details.'
      );
      setSubmitting(false);
    }
  };

  if (!cartLoading && (!cart.items || cart.items.length === 0)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Your Cart is Empty"
          message="You cannot proceed to checkout with an empty cart."
          actionText="Explore Laptop Catalog"
          actionLink="/explore"
        />
      </div>
    );
  }

  const steps = [
    { num: '01', label: 'Cart', status: 'completed' },
    { num: '02', label: 'Details', status: 'active' },
    { num: '03', label: 'Review', status: 'pending' },
    { num: '04', label: 'Confirm', status: 'pending' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 animate-fadeIn">
      {/* Back link */}
      <div>
        <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D214F] hover:underline transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
        </Link>
      </div>

      {/* Title & Step Indicator Header */}
      <div className="border-b border-[#E9E2E5] pb-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#29252A] flex items-center gap-2">
              Checkout <ShieldCheck className="w-7 h-7 text-[#6D214F]" />
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6870] mt-1">
              Provide delivery details and review your final order.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto pt-2">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center space-y-1">
              <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center border transition-all ${
                step.status === 'completed' ? 'bg-[#F7E8EE] border-[#6D214F] text-[#6D214F]' :
                step.status === 'active' ? 'bg-[#6D214F] border-[#6D214F] text-white shadow-xs' :
                'bg-[#FAF8F5] border-[#E9E2E5] text-[#989198]'
              }`}>
                {step.num}
              </div>
              <span className={`text-xs font-semibold ${step.status === 'active' ? 'text-[#6D214F]' : 'text-[#6F6870]'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#F7E8EE] border border-[#A85578]/40 text-[#6D214F] rounded-2xl text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Shipping Form (Left Column) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E9E2E5] p-6 sm:p-8 shadow-premium space-y-6">
          <h2 className="text-base font-bold text-[#29252A] border-b border-[#E9E2E5] pb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#6D214F]" /> Shipping & Contact Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-[#29252A]">Full Name *</label>
              <input
                type="text"
                name="customer_name"
                required
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#29252A]">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="rahul@example.com"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#29252A]">Phone Number (10 Digits) *</label>
              <input
                type="tel"
                name="phone"
                required
                maxLength={10}
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D214F] focus:bg-white font-mono text-[#29252A]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-[#29252A]">Address Line 1 *</label>
              <input
                type="text"
                name="address_line_1"
                required
                value={formData.address_line_1}
                onChange={handleChange}
                placeholder="Flat / Building / Street Address"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A]"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-bold text-[#29252A]">Landmark / Area (Optional)</label>
              <input
                type="text"
                name="address_line_2"
                value={formData.address_line_2}
                onChange={handleChange}
                placeholder="Near Metro Station / Sector"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#29252A]">City *</label>
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="Bengaluru"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#29252A]">State *</label>
              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                placeholder="Karnataka"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#29252A]">PIN Code *</label>
              <input
                type="text"
                name="postal_code"
                required
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="560001"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#29252A]">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                disabled
                className="w-full px-3.5 py-2.5 bg-[#F6F1F3] border border-[#E9E2E5] text-[#6F6870] rounded-xl font-medium"
              />
            </div>
          </div>
        </div>

        {/* Order Summary & Confirmation Button (Right Column) */}
        <div className="lg:col-span-5 space-y-6 sticky top-24">
          <div className="bg-white rounded-2xl border border-[#E9E2E5] p-6 shadow-premium space-y-4">
            <h2 className="text-base font-bold text-[#29252A] border-b border-[#E9E2E5] pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-bold text-[#6D214F] bg-[#F7E8EE] px-2.5 py-0.5 rounded-full">
                {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
              </span>
            </h2>

            {/* Cart Items list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.items &&
                cart.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-[#E9E2E5]/50">
                    <div className="flex items-center gap-2 max-w-[70%]">
                      <div className="w-8 h-8 bg-[#FAF8F5] rounded border border-[#E9E2E5] flex items-center justify-center text-[#989198] shrink-0">
                        {item.product?.image_url ? (
                          <img src={item.product.image_url} alt="" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <Laptop className="w-4 h-4" />
                        )}
                      </div>
                      <span className="truncate font-semibold text-[#29252A]">
                        {item.product?.product_name} <span className="text-[#6F6870]">× {item.quantity}</span>
                      </span>
                    </div>
                    <span className="font-extrabold text-[#6D214F]">{formatINR(item.line_total)}</span>
                  </div>
                ))}
            </div>

            <div className="space-y-2 pt-2 text-xs text-[#6F6870] border-t border-[#E9E2E5]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[#29252A]">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="text-[#6D214F] font-bold">FREE Delivery</span>
              </div>
              <div className="border-t border-[#E9E2E5] pt-3 flex justify-between items-baseline text-sm">
                <span className="font-bold text-[#29252A]">Total Payable</span>
                <span className="font-black text-[#6D214F] text-xl">{formatINR(subtotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#6D214F] hover:bg-[#8B315F] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 active:scale-95 cursor-pointer"
            >
              {submitting ? (
                'Processing Order...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Place Order ({formatINR(subtotal)})
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
