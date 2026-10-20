import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/orders';
import { formatINR } from '../utils/formatters';
import EmptyState from '../components/common/EmptyState';
import { DetailsSkeleton } from '../components/common/LoadingSkeleton';
import ComparisonBar from '../components/comparison/ComparisonBar';
import { ShoppingBag, Calendar, ChevronRight, PackageCheck } from 'lucide-react';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    getOrders()
      .then((data) => {
        if (isMounted) {
          const list = Array.isArray(data) ? data : (data?.results || []);
          setOrders(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Failed to fetch orders.');
          setOrders([]);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-[#F7E8EE] text-[#6D214F] border-[#6D214F]/20';
      case 'PENDING':
        return 'bg-[#FAF5E8] text-[#C9A227] border-[#C9A227]/30';
      case 'PROCESSING':
        return 'bg-[#F2ECF7] text-[#6D214F] border-[#6D214F]/20';
      case 'SHIPPED':
        return 'bg-[#F7E8EE] text-[#8B315F] border-[#8B315F]/30';
      case 'DELIVERED':
        return 'bg-[#F7E8EE] text-[#6D214F] border-[#6D214F]/40';
      case 'CANCELLED':
        return 'bg-[#F6F1F3] text-[#A85578] border-[#A85578]/20';
      default:
        return 'bg-[#FAF8F5] text-[#6F6870] border-[#E9E2E5]';
    }
  };

  if (loading) {
    return <DetailsSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="No Orders Found"
          message="You have not placed any laptop orders yet."
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
            Your Orders <ShoppingBag className="w-6 h-6 text-[#6D214F]" />
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6870] mt-1">
            View active and historical laptop purchases in your account.
          </p>
        </div>

        <div className="text-xs bg-[#FAF8F5] border border-[#E9E2E5] text-[#6F6870] px-3.5 py-2 rounded-xl font-medium">
          Total Orders: <strong className="text-[#6D214F] font-bold">{orders.length}</strong>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl border border-[#E9E2E5] p-6 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            {/* Info */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono font-bold text-sm text-[#29252A]">{order.order_number}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider border px-3 py-0.5 rounded-full ${getStatusBadge(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#6F6870]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#6D214F]" />
                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <PackageCheck className="w-3.5 h-3.5 text-[#6D214F]" />
                  {order.item_count || order.items?.length || 0} {order.item_count === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              <div className="text-xs text-[#6F6870] pt-1 line-clamp-1">
                Items: {order.items?.map((i) => i.product_name).join(', ')}
              </div>
            </div>

            {/* Amount & View Details link */}
            <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#E9E2E5]">
              <div className="text-right">
                <div className="text-[10px] text-[#989198] font-bold uppercase">Total Amount</div>
                <div className="text-base font-black text-[#6D214F]">{formatINR(order.total_amount)}</div>
              </div>

              <Link
                to={`/orders/${order.order_number}`}
                className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#F7E8EE] hover:text-[#6D214F] border border-[#E9E2E5] text-[#29252A] text-xs font-bold rounded-xl transition-all flex items-center gap-1"
              >
                View Details <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <ComparisonBar />
    </div>
  );
}
