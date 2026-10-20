import React, { useState, useEffect } from 'react';
import { useComparison } from '../context/ComparisonContext';
import { useAuth } from '../context/AuthContext';
import { compareProducts } from '../api/comparison';
import ComparisonTable from '../components/comparison/ComparisonTable';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { Scale, ArrowLeft, RefreshCw, Trash2, Sparkles, Laptop } from 'lucide-react';
import { Link } from 'react-router-dom';
import { recordComparisonHistory } from '../utils/journeyStorage';
import { formatINR } from '../utils/formatters';

export default function Compare() {
  const { selectedProducts, removeFromCompare, clearComparison, count } = useComparison();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const productIds = selectedProducts.map((p) => p.product_id).filter(Boolean);

  useEffect(() => {
    if (productIds.length < 2) {
      setData(null);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    compareProducts(productIds)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
          // Record to journey comparison history isolated by current user ID
          if (res?.products) {
            recordComparisonHistory(res.products, user?.id);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          const msg =
            err?.response?.data?.error?.message ||
            err?.response?.data?.detail ||
            err.message ||
            'Failed to compare selected laptops.';
          setError(msg);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [JSON.stringify(productIds), user?.id]);

  if (count === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <EmptyState
          title="No Laptops Selected for Comparison"
          message="Your comparison list is currently empty. Choose 2 to 4 laptops from the catalog, search results, or Discovery Studio to compare their specifications, performance trade-offs, and INR prices side by side."
          actionText="Browse Laptop Catalog"
          actionLink="/explore"
        />
        <div className="text-center pt-2">
          <Link
            to="/discovery-studio"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D214F] hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Or try the AI Discovery Studio to find laptops for your budget</span>
          </Link>
        </div>
      </div>
    );
  }

  if (count === 1) {
    const singleProduct = selectedProducts[0];
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6 animate-fadeIn">
        <EmptyState
          title="Select at Least One More Laptop"
          message={`You have selected 1 laptop: "${singleProduct?.product_name || singleProduct?.brand || 'Selected Laptop'}". Decision Arena requires at least 2 laptops to generate a side-by-side spec comparison and trade-off analysis.`}
          actionText="Browse Catalog to Add Another"
          actionLink="/explore"
        />

        <div className="max-w-md mx-auto p-4 bg-white rounded-2xl border border-[#E9E2E5] shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Laptop className="w-4 h-4 text-[#6D214F] shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#29252A] truncate block">
                {singleProduct?.product_name || singleProduct?.brand}
              </span>
              <span className="text-[11px] text-[#6D214F] font-semibold">
                {formatINR(singleProduct?.price)}
              </span>
            </div>
          </div>
          <button
            onClick={() => removeFromCompare(singleProduct.product_id)}
            className="px-2.5 py-1 text-xs text-[#6F6870] hover:text-[#6D214F] hover:bg-[#F7E8EE] rounded-lg transition-colors border border-[#E9E2E5] shrink-0 cursor-pointer"
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9E2E5] pb-4">
        <div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6D214F] hover:underline transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-2.5 py-0.5 rounded-full">
              ✦ Decision Arena
            </span>
            <span className="text-xs text-[#6F6870] font-mono">{count} Products</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#29252A] mt-1 flex items-center gap-2">
            SmartBuy Decision Arena
          </h1>
          <p className="text-xs sm:text-sm text-[#6F6870] mt-1">
            Understand the real differences, gains, and trade-offs between your selected laptops.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/discovery-studio"
            className="px-3.5 py-2 bg-[#F7E8EE] hover:bg-[#F2ECF7] border border-[#E9E2E5] text-[#6D214F] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discovery Studio</span>
          </Link>
          <button
            onClick={clearComparison}
            className="px-3.5 py-2 bg-white hover:bg-[#F7E8EE] border border-[#E9E2E5] text-[#6D214F] text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#6D214F]" /> Clear All
          </button>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="my-12 p-8 text-center bg-white rounded-2xl border border-[#E9E2E5] shadow-premium space-y-3 max-w-md mx-auto">
          <RefreshCw className="w-8 h-8 text-[#6D214F] animate-spin mx-auto" />
          <h3 className="font-bold text-[#29252A]">Generating Comparison Matrix</h3>
          <p className="text-xs text-[#6F6870]">Retrieving side-by-side specs, price gaps, and trade-offs...</p>
        </div>
      ) : error ? (
        <div className="space-y-4 max-w-lg mx-auto">
          <ErrorState
            title="Comparison Failed"
            message={error}
            onRetry={() => window.location.reload()}
          />
          <div className="text-center">
            <button
              onClick={clearComparison}
              className="px-4 py-2 bg-white hover:bg-[#FAF8F5] text-[#6D214F] border border-[#E9E2E5] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Clear Stale Selections & Start Fresh
            </button>
          </div>
        </div>
      ) : (
        <ComparisonTable comparisonData={data} />
      )}
    </div>
  );
}
