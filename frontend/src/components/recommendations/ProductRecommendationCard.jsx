import React from 'react';
import { Link } from 'react-router-dom';
import { formatINR, formatRating, getImageUrl } from '../../utils/formatters';
import { useComparison } from '../../context/ComparisonContext';
import { CheckCircle2, AlertTriangle, Scale, ArrowRight, Laptop, Star, Cpu, HardDrive } from 'lucide-react';

export default function ProductRecommendationCard({ recommendation }) {
  const { addToCompare, removeFromCompare, isInComparison } = useComparison();
  const product = recommendation.product || recommendation;
  const rank = recommendation.rank;
  const matchScore = recommendation.match_score;
  const explanation = recommendation.explanation || { positive: [], tradeoffs: [] };

  const inCompare = isInComparison(product.product_id);

  const toggleCompare = (e) => {
    e.preventDefault();
    if (inCompare) {
      removeFromCompare(product.product_id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-[#E9E2E5] hover:border-[#D8C7D0] shadow-premium hover:shadow-premium-hover transition-all duration-300 overflow-hidden">
      
      {/* Top Header Badge */}
      <div className="bg-[#FAF8F5] px-6 py-3 border-b border-[#E9E2E5] flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {rank && (
            <span className="w-7 h-7 rounded-full bg-[#6D214F] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              #{rank}
            </span>
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F]">
            {product.brand} {product.product_segment ? `• ${product.product_segment}` : ''}
          </span>
        </div>

        {matchScore !== undefined && matchScore !== null && (
          <div className="flex items-center gap-1.5 bg-[#F7E8EE] border border-[#E9E2E5] text-[#6D214F] px-3.5 py-1 rounded-full text-xs font-bold">
            <span>✦</span>
            <span>{Number(matchScore).toFixed(0)}% MATCH</span>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Col: Product Info */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-[#FAF8F5] rounded-xl flex items-center justify-center text-[#989198] shrink-0 border border-[#E9E2E5] p-2">
              {product.image_url ? (
                <img src={getImageUrl(product.image_url)} alt={product.product_name} className="max-h-full max-w-full object-contain" />
              ) : (
                <Laptop className="w-8 h-8 stroke-[1.5]" />
              )}
            </div>

            <div>
              <h3 className="font-bold text-[#29252A] text-base leading-snug hover:text-[#6D214F] transition-colors">
                <Link to={`/products/${product.product_id}`}>
                  {product.product_name}
                </Link>
              </h3>

              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-[#6D214F]">
                  {formatINR(product.price)}
                </span>
                {product.original_price && Number(product.original_price) > Number(product.price) && (
                  <span className="text-xs text-[#989198] line-through">
                    {formatINR(product.original_price)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-[#6F6870] mt-1">
                <div className="flex items-center gap-1 text-[#C9A227] font-semibold">
                  <Star className="w-3.5 h-3.5 fill-[#C9A227]" />
                  <span>{formatRating(product.rating)}</span>
                </div>
                <span>({product.review_count} reviews)</span>
              </div>
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs text-[#29252A] bg-[#FAF8F5] p-3 rounded-xl border border-[#E9E2E5]">
            <div className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#6D214F] shrink-0" />
              <span className="truncate">{product.ram_gb}GB RAM</span>
            </div>
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#6D214F] shrink-0" />
              <span className="truncate">{product.storage_gb}GB {product.storage_type}</span>
            </div>
            <div className="col-span-2 text-[#6F6870] truncate">
              • {product.processor} ({product.cpu_cores || 4} cores)
            </div>
            <div className="col-span-2 text-[#6F6870] truncate">
              • {product.gpu} ({product.gpu_type})
            </div>
          </div>
        </div>

        {/* Right Col: Backend Machine Explanations */}
        <div className="lg:col-span-7 space-y-4 bg-[#FAF8F5]/80 p-4 rounded-xl border border-[#E9E2E5]">
          
          {/* Why it matches */}
          {explanation.positive && explanation.positive.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#6D214F] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#6D214F]" /> Why This Laptop Matches
              </h4>
              <ul className="space-y-1 text-xs text-[#29252A] pl-1">
                {explanation.positive.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed bg-white p-2 rounded-lg border border-[#E9E2E5]">
                    <span className="text-[#6D214F] font-bold shrink-0">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Trade-offs */}
          {explanation.tradeoffs && explanation.tradeoffs.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-[#E9E2E5]">
              <h4 className="text-xs font-bold text-[#6F6870] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#C9A227]" /> Trade-offs To Consider
              </h4>
              <ul className="space-y-1 text-xs text-[#6F6870] pl-1">
                {explanation.tradeoffs.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-[#C9A227] font-bold shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>

      {/* Footer Actions */}
      <div className="bg-[#FAF8F5] px-6 py-3 border-t border-[#E9E2E5] flex items-center justify-between gap-4">
        <button
          onClick={toggleCompare}
          className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
            inCompare
              ? 'bg-[#F7E8EE] border-[#6D214F]/40 text-[#6D214F]'
              : 'bg-white border-[#E9E2E5] text-[#6F6870] hover:bg-[#FAF8F5]'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          {inCompare ? 'Added to Compare ✓' : 'Add to Compare'}
        </button>

        <Link
          to={`/products/${product.product_id}`}
          className="px-4 py-2 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
        >
          View Full Product & Review Intelligence <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
