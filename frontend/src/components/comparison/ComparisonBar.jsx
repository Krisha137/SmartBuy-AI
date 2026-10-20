import React from 'react';
import { Link } from 'react-router-dom';
import { useComparison } from '../../context/ComparisonContext';
import { Scale, X, ArrowRight, Laptop } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export default function ComparisonBar() {
  const { selectedProducts, removeFromCompare, clearComparison, count } = useComparison();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md text-[#29252A] border-t-2 border-[#6D214F]/40 shadow-premium animate-slideUp">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Left: Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#6D214F] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h4 className="font-bold text-xs sm:text-sm text-[#29252A] flex items-center gap-1.5">
              Comparison Drawer ({count}/4)
            </h4>
            <span className="text-[11px] text-[#6F6870]">Select 2 to 4 laptops to compare side-by-side</span>
          </div>
        </div>

        {/* Selected Product Pill Thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none max-w-xl">
          {selectedProducts.map((p) => (
            <div
              key={p.product_id}
              className="bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl pl-2.5 pr-1.5 py-1.5 flex items-center gap-2 text-xs shrink-0 shadow-xs"
            >
              <Laptop className="w-3.5 h-3.5 text-[#6D214F] shrink-0" />
              <div className="max-w-[110px] truncate">
                <span className="font-bold text-[#29252A] block truncate">{p.brand}</span>
                <span className="text-[10px] text-[#6D214F] font-semibold block truncate">{formatINR(p.price)}</span>
              </div>
              <button
                onClick={() => removeFromCompare(p.product_id)}
                className="p-1 text-[#989198] hover:text-[#6D214F] hover:bg-[#F7E8EE] rounded-lg transition-colors cursor-pointer"
                title="Remove product"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearComparison}
            className="text-xs text-[#6F6870] hover:text-[#6D214F] px-2 py-1 font-semibold transition-colors hidden md:block cursor-pointer"
          >
            Clear All
          </button>

          <Link
            to="/compare"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
              count >= 2
                ? 'bg-[#6D214F] hover:bg-[#8B315F] text-white active:scale-95'
                : 'bg-[#FAF8F5] border border-[#E9E2E5] text-[#989198] cursor-not-allowed'
            }`}
          >
            Compare ({count}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
