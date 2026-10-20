import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderDetails, cancelOrder } from '../api/orders';
import { formatINR } from '../utils/formatters';
import { DetailsSkeleton } from '../components/common/LoadingSkeleton';
import ErrorState from '../components/common/ErrorState';
import ComparisonBar from '../components/comparison/ComparisonBar';
import { ArrowLeft, MapPin, Calendar, Clock, ShoppingBag, XCircle, CheckCircle2, Laptop } from 'lucide-react';

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getOrderDetails(orderId)
      .then((data) => {
        if (isMounted) {
          setOrder(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.detail || 'Order not found or access denied.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    setActionError(null);

    try {
      const updatedOrder = await cancelOrder(orderId);
      setOrder(updatedOrder);
    } catch (err) {
      setActionError(err.response?.data?.order || 'Unable to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState
          title="Order Not Found"
          message={error || `Could not find order ${orderId}.`}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const timelineSteps = [
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'DELIVERED', label: 'Delivered' }
  ];

  const currentStatusIndex = timelineSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 animate-fadeIn">
      {/* Back link */}
      <div>
        <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D214F] hover:underline transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Orders
        </Link>
      </div>

      {/* Action Error alert */}
      {actionError && (
        <div className="p-4 bg-[#F7E8EE] border border-[#A85578]/40 text-[#6D214F] rounded-2xl text-xs font-medium">
          {actionError}
        </div>
      )}

      {/* Order Header Card */}
      <div className="bg-white rounded-2xl border border-[#E9E2E5] p-6 shadow-premium flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-[#29252A] font-mono">{order.order_number}</h1>
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border ${
                order.status === 'CANCELLED'
                  ? 'bg-[#F6F1F3] text-[#A85578] border-[#A85578]/30'
                  : 'bg-[#F7E8EE] text-[#6D214F] border-[#6D214F]/30'
              }`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-xs text-[#6F6870] mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#6D214F]" />
            Placed on {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>

        {order.can_cancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-4 py-2 bg-[#F7E8EE] hover:bg-[#F2ECF7] text-[#6D214F] border border-[#E9E2E5] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-[#A85578]" />
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      {/* Order Status Timeline */}
      {order.status === 'CANCELLED' ? (
        <div className="bg-[#F7E8EE] border border-[#E9E2E5] rounded-2xl p-6 text-center text-[#6D214F] text-xs font-bold flex items-center justify-center gap-2">
          <XCircle className="w-5 h-5 text-[#A85578]" />
          This order was cancelled.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#E9E2E5] p-6 shadow-premium space-y-4">
          <h3 className="text-xs font-bold text-[#6D214F] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#6D214F]" /> Order Progress Timeline
          </h3>

          {/* Timeline Bar & Steps */}
          <div className="relative pt-4 pb-2">
            {/* Progress line */}
            <div className="absolute top-8 inset-x-8 h-1 bg-[#F6F1F3] -z-0">
              <div
                className="h-full bg-gradient-to-r from-[#6D214F] to-[#C9A227] transition-all duration-500 rounded-full"
                style={{
                  width: `${currentStatusIndex >= 0 ? (currentStatusIndex / (timelineSteps.length - 1)) * 100 : 0}%`
                }}
              />
            </div>

            <div className="grid grid-cols-4 gap-2 relative z-10">
              {timelineSteps.map((step, idx) => {
                const isPassed = currentStatusIndex !== -1 && idx <= currentStatusIndex;
                const isCurrent = currentStatusIndex === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-[#6D214F] text-white ring-4 ring-[#F7E8EE] shadow-md'
                          : isPassed
                          ? 'bg-[#6D214F] text-white shadow-xs'
                          : 'bg-[#FAF8F5] border border-[#E9E2E5] text-[#989198]'
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-xs font-bold ${isPassed ? 'text-[#6D214F]' : 'text-[#989198]'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Details & Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Purchased Items list */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E9E2E5] p-6 shadow-premium space-y-4">
          <h2 className="text-base font-bold text-[#29252A] border-b border-[#E9E2E5] pb-3 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#6D214F]" /> Purchased Items ({order.items?.length || 0})
          </h2>

          <div className="space-y-3">
            {order.items &&
              order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs p-4 bg-[#FAF8F5] rounded-xl border border-[#E9E2E5] gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white border border-[#E9E2E5] rounded-lg flex items-center justify-center text-[#989198] shrink-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <Laptop className="w-6 h-6 stroke-[1.5]" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#29252A] text-sm">
                        {item.product_id ? (
                          <Link to={`/products/${item.product_id}`} className="hover:text-[#6D214F] transition-colors">
                            {item.product_name}
                          </Link>
                        ) : (
                          item.product_name
                        )}
                      </h3>
                      <div className="text-[#6F6870] font-medium mt-0.5">
                        Unit Price: <span className="font-bold text-[#6D214F]">{formatINR(item.price)}</span> × {item.quantity}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-[#989198] uppercase font-bold">Line Total</div>
                    <div className="text-base font-extrabold text-[#6D214F]">{formatINR(item.line_total)}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Shipping & Payment Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E9E2E5] p-6 shadow-premium space-y-4">
            <h2 className="text-base font-bold text-[#29252A] border-b border-[#E9E2E5] pb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#6D214F]" /> Delivery Information
            </h2>

            <div className="text-xs space-y-1 text-[#29252A]">
              <p className="font-bold text-[#29252A] text-sm">{order.customer_name}</p>
              <p className="text-[#6F6870]">Phone: {order.phone}</p>
              <p className="text-[#6F6870]">Email: {order.email}</p>
              <div className="pt-2 border-t border-[#E9E2E5] text-[#6F6870] space-y-0.5">
                <p>{order.address_line_1}</p>
                {order.address_line_2 && <p>{order.address_line_2}</p>}
                <p>{order.city}, {order.state} - {order.postal_code}</p>
                <p>{order.country}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#E9E2E5] p-6 shadow-premium space-y-3 text-xs">
            <h2 className="text-base font-bold text-[#29252A] border-b border-[#E9E2E5] pb-3">
              Payment Summary
            </h2>
            <div className="flex justify-between text-[#6F6870]">
              <span>Items Subtotal</span>
              <span className="font-semibold text-[#29252A]">{formatINR(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#6F6870]">
              <span>Shipping & Delivery</span>
              <span className="text-[#6D214F] font-bold">FREE Delivery</span>
            </div>
            <div className="border-t border-[#E9E2E5] pt-3 flex justify-between items-baseline text-sm">
              <span className="font-bold text-[#29252A]">Total Amount</span>
              <span className="font-black text-[#6D214F] text-xl">{formatINR(order.total_amount)}</span>
            </div>
          </div>
        </div>
      </div>

      <ComparisonBar />
    </div>
  );
}
