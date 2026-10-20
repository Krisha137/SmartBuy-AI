import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useComparison } from '../../context/ComparisonContext';
import { useWishlist } from '../../context/WishlistContext';
import { formatINR, formatRating, formatPercentage, getImageUrl } from '../../utils/formatters';
import { getSavedDiscoveryPrefs } from '../../utils/journeyStorage';
import {
  Check,
  ThumbsUp,
  Star,
  Tag,
  Scale,
  ShoppingCart,
  Trash2,
  Laptop,
  ArrowRight,
  Heart,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Layers,
  Zap,
  Info,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function ComparisonTable({ comparisonData }) {
  const { addCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { removeFromCompare } = useComparison();
  const { isInWishlist, addWishlist, removeWishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [addingId, setAddingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [isCompact, setIsCompact] = useState(false);

  // Active user priorities (read from journey storage or defaulted)
  const savedPrefs = getSavedDiscoveryPrefs() || {};
  const [activePriorities, setActivePriorities] = useState(
    savedPrefs.priorities || ['performance', 'ram', 'battery']
  );

  if (!comparisonData || !comparisonData.products || comparisonData.products.length === 0) {
    return null;
  }

  const products = comparisonData.products;
  const differences = comparisonData.differences || {};
  const reviewIntel = comparisonData.review_intelligence || {};
  const recFit = comparisonData.recommendation_fit || {};
  const tradeOffs = comparisonData.trade_offs || {};

  const colCount = products.length;

  const handleAddToCart = async (p) => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setAddingId(p.product_id);
    try {
      await addCart(p.product_id, 1);
      setSuccessId(p.product_id);
      setTimeout(() => setSuccessId(null), 2500);
    } catch (err) {
      console.error('Failed to add product to cart from comparison:', err);
    } finally {
      setAddingId(null);
    }
  };

  const handleToggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (isInWishlist(productId)) {
      await removeWishlist(productId);
    } else {
      await addWishlist(productId);
    }
  };

  // Helper to get max value for numerical specs
  const getMaxVal = (key) => {
    const vals = products.map((p) => Number(p[key]) || 0);
    return Math.max(...vals, 1);
  };

  const getMinVal = (key) => {
    const vals = products.map((p) => Number(p[key])).filter((v) => !isNaN(v) && v > 0);
    return vals.length > 0 ? Math.min(...vals) : 0;
  };

  // Compute Spec Leaders
  const maxRam = getMaxVal('ram_gb');
  const maxStorage = getMaxVal('storage_gb');
  const minWeight = getMinVal('weight_kg');
  const maxBattery = getMaxVal('battery_life');
  const minPrice = getMinVal('price');

  // Compute "What do I gain?" grounded explanations
  const generateGains = (currentProd) => {
    const others = products.filter((p) => p.product_id !== currentProd.product_id);
    const gains = [];

    others.forEach((other) => {
      // RAM Gain
      if (currentProd.ram_gb > other.ram_gb) {
        gains.push(
          `Offers ${currentProd.ram_gb}GB RAM (+${currentProd.ram_gb - other.ram_gb}GB more than ${other.brand} ${other.product_name.split(' ')[0]}), providing superior multitasking bandwidth.`
        );
      }
      // Storage Gain
      if (currentProd.storage_gb > other.storage_gb) {
        gains.push(
          `Provides ${currentProd.storage_gb}GB storage (vs ${other.storage_gb}GB), allowing larger project file storage.`
        );
      }
      // GPU Gain
      if (currentProd.gpu_type === 'Dedicated' && other.gpu_type === 'Integrated') {
        gains.push(
          `Features dedicated ${currentProd.gpu} graphics (vs integrated on ${other.brand}), better suited for 3D rendering and games.`
        );
      }
      // Weight Gain (Lighter)
      if (currentProd.weight_kg && other.weight_kg && Number(currentProd.weight_kg) < Number(other.weight_kg)) {
        const diff = (Number(other.weight_kg) - Number(currentProd.weight_kg)).toFixed(2);
        gains.push(
          `Lighter carry weight (${currentProd.weight_kg}kg vs ${other.weight_kg}kg, saving ${diff}kg in your bag).`
        );
      }
      // Battery Gain
      if (currentProd.battery_life && other.battery_life && Number(currentProd.battery_life) > Number(other.battery_life)) {
        gains.push(
          `Listed battery life is ${currentProd.battery_life}h (+${Number(currentProd.battery_life) - Number(other.battery_life)}h more than ${other.brand}).`
        );
      } else if (currentProd.battery_life && !other.battery_life) {
        gains.push(
          `Verified battery specification (${currentProd.battery_life}h), whereas battery endurance is not available for ${other.brand}.`
        );
      }
    });

    if (gains.length === 0) {
      if (Number(currentProd.price) === minPrice) {
        gains.push(`Most budget-friendly price point in this comparison at ${formatINR(currentProd.price)}.`);
      } else {
        gains.push(`Baseline hardware matches standard configuration for its segment.`);
      }
    }

    return gains.slice(0, 3);
  };

  // Compute "What am I sacrificing?" grounded trade-offs
  const generateSacrifices = (currentProd) => {
    const others = products.filter((p) => p.product_id !== currentProd.product_id);
    const sacrifices = [];

    others.forEach((other) => {
      // Price sacrifice (costs more)
      if (Number(currentProd.price) > Number(other.price)) {
        const gap = Number(currentProd.price) - Number(other.price);
        sacrifices.push(
          `Costs ${formatINR(gap)} more than ${other.brand} ${other.product_name.split(' ')[0]}.`
        );
      }
      // RAM sacrifice (less RAM)
      if (currentProd.ram_gb < other.ram_gb) {
        sacrifices.push(
          `Has ${currentProd.ram_gb}GB RAM (vs ${other.ram_gb}GB on ${other.brand}), which may limit high-capacity virtualization.`
        );
      }
      // Weight sacrifice (heavier)
      if (currentProd.weight_kg && other.weight_kg && Number(currentProd.weight_kg) > Number(other.weight_kg)) {
        sacrifices.push(
          `Heavier build (${currentProd.weight_kg}kg vs ${other.weight_kg}kg on ${other.brand}).`
        );
      }
      // GPU sacrifice
      if (currentProd.gpu_type === 'Integrated' && other.gpu_type === 'Dedicated') {
        sacrifices.push(
          `Integrated graphics processor (${currentProd.gpu}) compared to dedicated GPU on ${other.brand}.`
        );
      }
    });

    // Check missing data
    if (!currentProd.battery_life) {
      sacrifices.push('Battery endurance duration is not disclosed by available specifications.');
    }
    if (!currentProd.weight_kg) {
      sacrifices.push('Chassis carry weight data is not available.');
    }

    if (sacrifices.length === 0) {
      sacrifices.push('Balanced profile without prominent spec compromises in this group.');
    }

    return sacrifices.slice(0, 3);
  };

  // Compute Grounded Personal Verdict
  const computeVerdict = () => {
    if (products.length < 2) return null;

    // Evaluate based on priorities
    let topPick = products[0];
    let topReason = '';
    let topTradeoff = '';
    let missingNotes = [];

    const wantsPerf = activePriorities.includes('performance');
    const wantsPortability = activePriorities.includes('weight');
    const wantsBudget = activePriorities.includes('budget');

    if (wantsBudget) {
      topPick = [...products].sort((a, b) => Number(a.price) - Number(b.price))[0];
      topReason = `Offers the lowest entry cost (${formatINR(topPick.price)}) while supplying ${topPick.ram_gb}GB RAM and ${topPick.storage_gb}GB storage.`;
      topTradeoff = 'May feature lower clock speeds or integrated graphics.';
    } else if (wantsPortability) {
      const portableList = [...products].filter((p) => p.weight_kg).sort((a, b) => Number(a.weight_kg) - Number(b.weight_kg));
      if (portableList.length > 0) {
        topPick = portableList[0];
        topReason = `Leading in portability at ${topPick.weight_kg} kg with ${topPick.display_size}" display form-factor.`;
        topTradeoff = 'Compact chassis limits heavy cooling headroom.';
      }
    } else if (wantsPerf) {
      topPick = [...products].sort((a, b) => {
        const sA = (a.ram_gb * 2) + (a.cpu_cores || 4) + (a.gpu_type === 'Dedicated' ? 10 : 0);
        const sB = (b.ram_gb * 2) + (b.cpu_cores || 4) + (b.gpu_type === 'Dedicated' ? 10 : 0);
        return sB - sA;
      })[0];
      topReason = `Maximized processing hardware with ${topPick.ram_gb}GB RAM and ${topPick.processor}.`;
      topTradeoff = `Higher price tag of ${formatINR(topPick.price)}.`;
    } else {
      topPick = products[0];
      topReason = `Strong overall equilibrium across ${topPick.ram_gb}GB RAM and display clarity.`;
      topTradeoff = `Check individual port and battery specs.`;
    }

    // Check missing info disclosure
    if (!topPick.battery_life) missingNotes.push('Battery life data is not available');
    if (!topPick.weight_kg) missingNotes.push('Weight specification is not available');

    return {
      product: topPick,
      reason: topReason,
      tradeoff: topTradeoff,
      missingDisclosures: missingNotes,
    };
  };

  const verdict = computeVerdict();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Controls & Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E9E2E5] shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#6D214F] uppercase tracking-wider">Comparison Mode:</span>
          <div className="inline-flex rounded-xl p-0.5 bg-[#FAF8F5] border border-[#E9E2E5]">
            <button
              onClick={() => setIsCompact(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !isCompact ? 'bg-[#6D214F] text-white shadow-xs' : 'text-[#6F6870] hover:text-[#29252A]'
              }`}
            >
              Detailed Decision Mode
            </button>
            <button
              onClick={() => setIsCompact(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                isCompact ? 'bg-[#6D214F] text-white shadow-xs' : 'text-[#6F6870] hover:text-[#29252A]'
              }`}
            >
              Compact Specs Mode
            </button>
          </div>
        </div>

        {/* Price Difference Indicator */}
        {differences.price_difference && differences.price_difference.price_gap > 0 && (
          <div className="flex items-center gap-2 text-xs font-bold text-[#6D214F] bg-[#F7E8EE] px-3 py-1.5 rounded-xl border border-[#E9E2E5]">
            <Tag className="w-3.5 h-3.5 text-[#6D214F]" />
            <span>Price Gap: {differences.price_difference.price_gap_formatted}</span>
            <span className="text-[11px] text-[#6F6870] font-normal hidden md:inline">
              ({differences.price_difference.min_price_formatted} — {differences.price_difference.max_price_formatted})
            </span>
          </div>
        )}
      </div>

      {/* Selected Laptops Header Cards */}
      <div className={`grid gap-4 ${colCount === 2 ? 'grid-cols-1 sm:grid-cols-2' : colCount === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {products.map((p) => {
          const inWish = isInWishlist(p.product_id);
          const images = p.images?.length > 0 ? p.images : (p.image_url ? [{ url: p.image_url }] : []);

          return (
            <div
              key={p.product_id}
              className="bg-white rounded-2xl border border-[#E9E2E5] p-5 shadow-premium space-y-4 flex flex-col justify-between hover:border-[#D8C7D0] transition-all relative"
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-2.5 py-0.5 rounded-full">
                    {p.brand}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleWishlist(p.product_id)}
                      className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        inWish ? 'bg-[#F7E8EE] text-[#6D214F] border-[#6D214F]/30' : 'bg-white text-[#989198] border-[#E9E2E5] hover:text-[#6D214F]'
                      }`}
                      title="Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${inWish ? 'fill-[#6D214F]' : ''}`} />
                    </button>
                    <button
                      onClick={() => removeFromCompare(p.product_id)}
                      className="text-[#989198] hover:text-[#6D214F] p-1.5 transition-colors cursor-pointer rounded-lg hover:bg-[#F7E8EE]"
                      title="Remove from Arena"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="h-32 bg-[#FAF8F5] rounded-xl border border-[#E9E2E5] my-3 p-3 flex items-center justify-center overflow-hidden">
                  {images.length > 0 ? (
                    <img
                      src={getImageUrl(images[0]?.url)}
                      alt={p.product_name}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Laptop className="w-10 h-10 text-[#989198]" />
                  )}
                </div>

                <h4 className="font-bold text-[#29252A] text-xs sm:text-sm line-clamp-2 leading-snug">
                  <Link to={`/products/${p.product_id}`} className="hover:text-[#6D214F]">
                    {p.product_name}
                  </Link>
                </h4>

                <div className="mt-2 text-xl font-black text-[#6D214F]">
                  {p.price_formatted || formatINR(p.price)}
                </div>

                {/* Spec Leader Badges */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.ram_gb === maxRam && maxRam > 8 && (
                    <span className="text-[10px] font-bold bg-[#F7E8EE] text-[#6D214F] px-2 py-0.5 rounded-md">
                      Highest RAM
                    </span>
                  )}
                  {Number(p.price) === minPrice && (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Best Price
                    </span>
                  )}
                  {p.weight_kg && Number(p.weight_kg) === minWeight && (
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md">
                      Lightest Carry
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2 border-t border-[#E9E2E5]">
                <button
                  onClick={() => handleAddToCart(p)}
                  disabled={addingId === p.product_id}
                  className={`w-full py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer ${
                    successId === p.product_id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#6D214F] hover:bg-[#8B315F] text-white active:scale-95'
                  }`}
                >
                  {addingId === p.product_id ? (
                    <span className="animate-pulse">Adding...</span>
                  ) : successId === p.product_id ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </>
                  )}
                </button>

                <Link
                  to={`/products/${p.product_id}`}
                  className="w-full py-2 text-center text-xs font-semibold text-[#6F6870] hover:text-[#6D214F] bg-[#FAF8F5] hover:bg-[#F7E8EE] rounded-xl border border-[#E9E2E5] block transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* FEATURE A & B: "What do I gain?" and "What am I sacrificing?" */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* WHAT DO I GAIN? */}
        <div className="bg-white rounded-2xl border border-[#E9E2E5] p-6 shadow-premium space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#E9E2E5] pb-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#29252A] text-base">“What do I gain?”</h3>
              <p className="text-xs text-[#6F6870]">
                Practical advantages of choosing one model over another based on verified specs.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {products.map((p) => {
              const gains = generateGains(p);
              return (
                <div key={p.product_id} className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E9E2E5] space-y-1.5">
                  <span className="font-bold text-xs text-[#6D214F]">
                    {p.brand} {p.product_name}
                  </span>
                  <ul className="space-y-1 text-xs text-[#29252A]">
                    {gains.map((gain, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{gain}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* WHAT AM I SACRIFICING? */}
        <div className="bg-white rounded-2xl border border-[#E9E2E5] p-6 shadow-premium space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#E9E2E5] pb-3">
            <div className="p-2 rounded-xl bg-[#F7E8EE] text-[#6D214F] border border-[#E9E2E5]">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#29252A] text-base">“What am I sacrificing?”</h3>
              <p className="text-xs text-[#6F6870]">
                Factual trade-offs, price differentials, and disclosures of unavailable data.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {products.map((p) => {
              const sacrifices = generateSacrifices(p);
              return (
                <div key={p.product_id} className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E9E2E5] space-y-1.5">
                  <span className="font-bold text-xs text-[#29252A]">
                    {p.brand} {p.product_name}
                  </span>
                  <ul className="space-y-1 text-xs text-[#6F6870]">
                    {sacrifices.map((sac, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                        <span>{sac}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FEATURE D: PERSONAL VERDICT */}
      {verdict && (
        <div className="bg-gradient-to-r from-[#FAF8F5] via-[#F7E8EE]/40 to-[#FAF8F5] rounded-3xl border border-[#E9E2E5] p-6 sm:p-8 shadow-premium space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9E2E5] pb-3">
            <div className="flex items-center gap-2">
              <span className="text-[#6D214F] font-black text-lg">✦</span>
              <h3 className="font-black text-[#29252A] text-lg">Decision Arena Personal Verdict</h3>
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F] bg-white border border-[#E9E2E5] px-3 py-1 rounded-full">
              Priorities: {activePriorities.join(' • ')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8 space-y-2">
              <span className="text-xs font-bold text-[#6D214F] uppercase tracking-wider">
                Top Recommendation for Your Priorities
              </span>
              <h4 className="text-xl sm:text-2xl font-black text-[#29252A]">
                {verdict.product.brand} {verdict.product.product_name}
              </h4>
              <p className="text-xs sm:text-sm text-[#29252A] leading-relaxed">
                <strong>Why recommended:</strong> {verdict.reason}
              </p>
              <p className="text-xs text-[#6F6870]">
                <strong>Main compromise:</strong> {verdict.tradeoff}
              </p>

              {verdict.missingDisclosures.length > 0 && (
                <div className="pt-2 text-[11px] text-[#989198] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 text-[#C9A227]" />
                  <span>Honest disclosure: {verdict.missingDisclosures.join('; ')}.</span>
                </div>
              )}
            </div>

            <div className="md:col-span-4 bg-white p-4 rounded-2xl border border-[#E9E2E5] text-center space-y-3 shadow-xs">
              <div className="text-2xl font-black text-[#6D214F]">
                {formatINR(verdict.product.price)}
              </div>
              <button
                onClick={() => handleAddToCart(verdict.product)}
                className="w-full py-2.5 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Select This Laptop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPECIFICATION COMPARISON MATRIX */}
      <div className="bg-white rounded-2xl border border-[#E9E2E5] shadow-premium overflow-x-auto">
        <div className="p-4 bg-[#FAF8F5] border-b border-[#E9E2E5] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F]">
            Specification-by-Specification Matrix
          </span>
          <span className="text-xs text-[#6F6870]">
            {isCompact ? 'Compact View (Core Hardware)' : 'Detailed View (All Available Metrics)'}
          </span>
        </div>

        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-[#E9E2E5]">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#6D214F] w-48 sticky left-0 bg-[#FAF8F5] z-10 border-r border-[#E9E2E5]">
                Specification
              </th>
              {products.map((p) => (
                <th key={p.product_id} className="p-4 font-bold text-[#29252A] text-xs border-r border-[#E9E2E5] last:border-r-0">
                  {p.brand} {p.product_name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#E9E2E5] text-xs">
            {/* SPECS ROWS */}
            {[
              { key: 'price', label: 'Price (INR)', customVal: (p) => formatINR(p.price), isLeader: (p) => Number(p.price) === minPrice },
              { key: 'ram_gb', label: 'RAM Capacity', customVal: (p) => `${p.ram_gb} GB`, isLeader: (p) => p.ram_gb === maxRam },
              { key: 'storage_gb', label: 'Storage', customVal: (p) => `${p.storage_gb} GB ${p.storage_type}`, isLeader: (p) => p.storage_gb === maxStorage },
              { key: 'processor', label: 'Processor', textOnly: true },
              { key: 'cpu_cores', label: 'CPU Cores', customVal: (p) => (p.cpu_cores ? `${p.cpu_cores} Cores` : 'Not available') },
              { key: 'gpu', label: 'GPU Graphics', textOnly: true },
              { key: 'gpu_type', label: 'GPU Category', textOnly: true },
              { key: 'display_size', label: 'Display Size & Resolution', customVal: (p) => `${p.display_size}" ${p.display_resolution || ''}` },
              { key: 'refresh_rate', label: 'Refresh Rate', customVal: (p) => (p.refresh_rate ? `${p.refresh_rate} Hz` : 'Standard (60Hz)') },
              ...(!isCompact
                ? [
                    { key: 'battery_life', label: 'Battery Life', customVal: (p) => (p.battery_life ? `${p.battery_life} Hours` : 'Not available') },
                    { key: 'weight_kg', label: 'Weight', customVal: (p) => (p.weight_kg ? `${p.weight_kg} kg` : 'Not available'), isLeader: (p) => p.weight_kg && Number(p.weight_kg) === minWeight },
                    { key: 'operating_system', label: 'Operating System', textOnly: true },
                    { key: 'rating', label: 'Customer Rating', customVal: (p) => `${formatRating(p.rating)} ★ (${p.review_count} reviews)` },
                  ]
                : []),
            ].map((row) => (
              <tr key={row.key} className="hover:bg-[#FAF8F5]/60 transition-colors">
                <td className="p-3.5 font-bold text-[#29252A] bg-[#FAF8F5]/80 sticky left-0 z-10 border-r border-[#E9E2E5]">
                  {row.label}
                </td>
                {products.map((p) => {
                  const rawVal = p[row.key];
                  const displayStr = row.customVal ? row.customVal(p) : (rawVal || 'Not available');
                  const isLead = row.isLeader ? row.isLeader(p) : false;

                  return (
                    <td key={p.product_id} className="p-3.5 border-r border-[#E9E2E5] last:border-r-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-semibold ${displayStr === 'Not available' ? 'text-[#989198] italic' : 'text-[#29252A]'}`}>
                          {displayStr}
                        </span>
                        {isLead && (
                          <span className="text-[10px] font-bold bg-[#F7E8EE] text-[#6D214F] px-1.5 py-0.5 rounded shrink-0">
                            Leader
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
