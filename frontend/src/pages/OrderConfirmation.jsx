import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getOrderDetails } from '../api/orders';
import { formatINR } from '../utils/formatters';
import { CheckCircle2, ShoppingBag, Truck, Calendar, MapPin, ArrowRight, Laptop } from 'lucide-react';
import { DetailsSkeleton } from '../components/common/LoadingSkeleton';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);

  useEffect(() => {
    if (!order && orderId) {
      getOrderDetails(orderId)
        .then((data) => {
          setOrder(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [orderId, order]);

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#29252A]">Order Information Unavailable</h2>
        <Link to="/orders" className="inline-block px-5 py-2.5 bg-[#6D214F] text-white font-bold text-xs rounded-xl hover:bg-[#8B315F]">
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 pb-24 animate-fadeIn">
      {/* Success Banner */}
      <div className="bg-[#F7E8EE] border border-[#E9E2E5] rounded-3xl p-6 sm:p-10 text-center space-y-4 shadow-premium">
        <div className="w-16 h-16 bg-[#6D214F] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#29252A]">Order Confirmed!</h1>
        <p className="text-xs sm:text-sm text-[#6F6870] max-w-md mx-auto">
          Thank you for choosing SmartBuy AI. Your order has been placed successfully.
        </p>
        <div className="inline-block bg-white text-[#6D214F] border border-[#E9E2E5] px-4 py-1.5 rounded-full text-xs font-mono font-bold shadow-xs">
          Order #: {order.order_number}
        </div>
      </div>

      {/* Details Box */}
      <div className="bg-white rounded-2xl border border-[#E9E2E5] p-6 shadow-premium space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs border-b border-[#E9E2E5] pb-4">
          <div>
            <span className="text-[#6F6870] font-medium block flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#6D214F]" /> Date Placed
            </span>
            <strong className="text-[#29252A] text-sm">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
          </div>
          <div>
            <span className="text-[#6F6870] font-medium block flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-[#6D214F]" /> Status
            </span>
            <span className="inline-block bg-[#F7E8EE] text-[#6D214F] font-bold px-2.5 py-0.5 rounded-full uppercase text-[10px]">
              {order.status}
            </span>
          </div>
          <div>
            <span className="text-[#6F6870] font-medium block">Total Amount (INR)</span>
            <strong className="text-[#6D214F] text-base font-black">{formatINR(order.total_amount)}</strong>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="text-xs space-y-1 bg-[#FAF8F5] p-4 rounded-xl border border-[#E9E2E5]">
          <h3 className="font-bold text-[#29252A] flex items-center gap-1.5 mb-1 text-sm">
            <MapPin className="w-4 h-4 text-[#6D214F]" /> Delivery Address
          </h3>
          <p className="font-semibold text-[#29252A]">{order.customer_name} ({order.phone})</p>
          <p className="text-[#6F6870]">{order.address_line_1}{order.address_line_2 ? `, ${order.address_line_2}` : ''}</p>
          <p className="text-[#6F6870]">{order.city}, {order.state} - {order.postal_code}, {order.country}</p>
        </div>

        {/* Items list */}
        <div className="space-y-3">
          <h3 className="font-bold text-[#29252A] text-sm flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-[#6D214F]" /> Order Items ({order.items?.length || 0})
          </h3>
          <div className="space-y-2">
            {order.items &&
              order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E9E2E5]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-[#E9E2E5] rounded-lg flex items-center justify-center text-[#989198]">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <Laptop className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-[#29252A]">{item.product_name}</div>
                      <div className="text-[#6F6870]">Qty: {item.quantity} × {formatINR(item.price)}</div>
                    </div>
                  </div>
                  <div className="font-extrabold text-[#6D214F]">{formatINR(item.line_total)}</div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/orders"
          className="px-6 py-3.5 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          View All My Orders <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/explore"
          className="px-6 py-3.5 bg-white border border-[#E9E2E5] hover:bg-[#FAF8F5] text-[#29252A] text-xs font-bold rounded-xl transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
