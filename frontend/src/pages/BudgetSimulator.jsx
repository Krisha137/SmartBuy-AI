import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { useComparison } from '../context/ComparisonContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatRating, getImageUrl } from '../utils/formatters';
import { getSavedDiscoveryPrefs } from '../utils/journeyStorage';
import {
  IndianRupee,
  TrendingUp,
  Scale,
  Sparkles,
  ArrowRight,
  Check,
  Heart,
  ShoppingCart,
  Laptop,
  AlertCircle,
  HelpCircle,
  Layers,
  Zap,
  BatteryCharging,
  Feather,
  RefreshCw,
  Sliders,
  CheckCircle2,
  X
} from 'lucide-react';

const BUDGET_TIERS = [
  { label: '₹40,000', value: 40000 },
  { label: '₹50,000', value: 50000 },
  { label: '₹60,000', value: 60000 },
  { label: '₹70,000', value: 70000 },
  { label: '₹80,000', value: 80000 },
  { label: '₹1,00,000', value: 100000 },
  { label: '₹1,25,000', value: 125000 },
  { label: '₹1,50,000', value: 150000 },
  { label: '₹2,00,000', value: 200000 },
];

const SIMULATOR_PRIORITIES = [
  { id: 'multitasking', label: 'Multitasking & RAM', icon: Layers, specKey: 'ram_gb' },
  { id: 'performance', label: 'Processor Speed', icon: Zap, specKey: 'cpu_cores' },
  { id: 'portability', label: 'Lightweight Portability', icon: Feather, specKey: 'weight_kg' },
  { id: 'battery', label: 'Battery Life', icon: BatteryCharging, specKey: 'battery_life' },
];

export default function BudgetSimulator() {
  const navigate = useNavigate();
  const { addToCompare, removeFromCompare, isInComparison } = useComparison();
  const { isInWishlist, addWishlist, removeWishlist } = useWishlist();
  const { addCart } = useCart();
  const { isAuthenticated } = useAuth();

  const savedPrefs = getSavedDiscoveryPrefs() || {};

  const [selectedBudget, setSelectedBudget] = useState(60000);
  const [selectedPriority, setSelectedPriority] = useState('multitasking');
  const [productsInBudget, setProductsInBudget] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upgrade comparison target
  const [baselineProduct, setBaselineProduct] = useState(null);
  const [upgradeProduct, setUpgradeProduct] = useState(null);

  // Fetch all products once to allow seamless interactive budget changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    apiClient
      .get('/products/?ordering=price&page_size=100')
      .then((res) => {
        if (isMounted) {
          const list = res.results || res.data?.results || res || [];
          setAllProducts(list);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load products for Budget Simulator:', err);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Update products in budget whenever selectedBudget changes
  useEffect(() => {
    if (allProducts.length === 0) return;

    const filtered = allProducts.filter((p) => Number(p.price) <= selectedBudget);
    setProductsInBudget(filtered);

    // Pick top supported option for priority as baseline
    if (filtered.length > 0) {
      const sorted = [...filtered].sort((a, b) => {
        if (selectedPriority === 'multitasking') return Number(b.ram_gb) - Number(a.ram_gb);
        if (selectedPriority === 'portability') {
          const wA = a.weight_kg ? Number(a.weight_kg) : 99;
          const wB = b.weight_kg ? Number(b.weight_kg) : 99;
          return wA - wB;
        }
        if (selectedPriority === 'battery') {
          const bA = a.battery_life ? Number(a.battery_life) : 0;
          const bB = b.battery_life ? Number(b.battery_life) : 0;
          return bB - bA;
        }
        // default performance
        const pA = (Number(a.cpu_cores || 4) * 2) + Number(a.ram_gb);
        const pB = (Number(b.cpu_cores || 4) * 2) + Number(b.ram_gb);
        return pB - pA;
      });

      const topOption = sorted[0];
      setBaselineProduct(topOption);

      // Find higher-priced alternative for "+₹10K more worth it?"
      const higherTierMin = Number(topOption.price) + 6000;
      const higherTierMax = Number(topOption.price) + 25000;
      const higherOptions = allProducts.filter(
        (p) => Number(p.price) >= higherTierMin && Number(p.price) <= higherTierMax
      );

      if (higherOptions.length > 0) {
        // pick the best upgrade matching current priority
        const sortedUpgrade = [...higherOptions].sort((a, b) => {
          if (selectedPriority === 'multitasking') return Number(b.ram_gb) - Number(a.ram_gb);
          if (selectedPriority === 'portability') {
            const wA = a.weight_kg ? Number(a.weight_kg) : 99;
            const wB = b.weight_kg ? Number(b.weight_kg) : 99;
            return wA - wB;
          }
          return (Number(b.cpu_cores || 4) * 2 + Number(b.ram_gb)) - (Number(a.cpu_cores || 4) * 2 + Number(a.ram_gb));
        });
        setUpgradeProduct(sortedUpgrade[0]);
      } else {
        setUpgradeProduct(null);
      }
    } else {
      setBaselineProduct(null);
      setUpgradeProduct(null);
    }
  }, [selectedBudget, selectedPriority, allProducts]);

  // Handle manual selection of baseline product
  const handleSelectBaseline = (p) => {
    setBaselineProduct(p);
    const higherTierMin = Number(p.price) + 6000;
    const higherTierMax = Number(p.price) + 25000;
    const higherOptions = allProducts.filter(
      (item) => Number(item.price) >= higherTierMin && Number(item.price) <= higherTierMax
    );
    if (higherOptions.length > 0) {
      setUpgradeProduct(higherOptions[0]);
    } else {
      setUpgradeProduct(null);
    }
  };

  // Compute Grounded Upgrade Explanation
  const generateUpgradeAnalysis = () => {
    if (!baselineProduct || !upgradeProduct) return null;

    const priceGap = Number(upgradeProduct.price) - Number(baselineProduct.price);
    const benefits = [];
    const limitations = [];

    // RAM comparison
    if (upgradeProduct.ram_gb > baselineProduct.ram_gb) {
      benefits.push(
        `Upgrades RAM from ${baselineProduct.ram_gb}GB to ${upgradeProduct.ram_gb}GB (+${upgradeProduct.ram_gb - baselineProduct.ram_gb}GB increase), providing significantly more multitasking headroom for simultaneous applications.`
      );
    } else if (upgradeProduct.ram_gb === baselineProduct.ram_gb) {
      limitations.push(`Both models offer identical ${baselineProduct.ram_gb}GB RAM capacity.`);
    }

    // Storage comparison
    if (upgradeProduct.storage_gb > baselineProduct.storage_gb) {
      benefits.push(
        `Expands high-speed storage from ${baselineProduct.storage_gb}GB to ${upgradeProduct.storage_gb}GB SSD.`
      );
    }

    // Processor / GPU
    if (upgradeProduct.gpu_type === 'Dedicated' && baselineProduct.gpu_type === 'Integrated') {
      benefits.push(
        `Adds a dedicated ${upgradeProduct.gpu} graphics processor (compared to integrated graphics on the baseline).`
      );
    }
    if ((upgradeProduct.cpu_cores || 0) > (baselineProduct.cpu_cores || 0)) {
      benefits.push(
        `Equipped with ${upgradeProduct.processor} (${upgradeProduct.cpu_cores || 'more'} CPU cores vs ${baselineProduct.cpu_cores || 'standard'} cores).`
      );
    }

    // Weight trade-off
    if (upgradeProduct.weight_kg && baselineProduct.weight_kg) {
      if (Number(upgradeProduct.weight_kg) < Number(baselineProduct.weight_kg)) {
        benefits.push(
          `Shedding carry weight down to ${upgradeProduct.weight_kg} kg (baseline is ${baselineProduct.weight_kg} kg).`
        );
      } else if (Number(upgradeProduct.weight_kg) > Number(baselineProduct.weight_kg)) {
        limitations.push(
          `Chassis is slightly heavier at ${upgradeProduct.weight_kg} kg compared to ${baselineProduct.weight_kg} kg.`
        );
      }
    }

    // Battery trade-off
    if (upgradeProduct.battery_life && baselineProduct.battery_life) {
      if (Number(upgradeProduct.battery_life) > Number(baselineProduct.battery_life)) {
        benefits.push(
          `Battery life improves to ${upgradeProduct.battery_life}h (vs ${baselineProduct.battery_life}h).`
        );
      }
    } else if (!upgradeProduct.battery_life) {
      limitations.push('Battery endurance duration data is not available for the higher-priced model.');
    }

    // Is it worth it verdict
    const matchesPriority =
      (selectedPriority === 'multitasking' && upgradeProduct.ram_gb > baselineProduct.ram_gb) ||
      (selectedPriority === 'portability' && upgradeProduct.weight_kg && Number(upgradeProduct.weight_kg) < Number(baselineProduct.weight_kg)) ||
      (selectedPriority === 'performance' && (upgradeProduct.gpu_type === 'Dedicated' || (upgradeProduct.cpu_cores || 0) > (baselineProduct.cpu_cores || 0)));

    return {
      priceGap,
      benefits,
      limitations,
      matchesPriority,
      verdictText: matchesPriority
        ? `Spending ${formatINR(priceGap)} more directly satisfies your stated ${selectedPriority} priority with tangible hardware upgrades.`
        : `Spending ${formatINR(priceGap)} more provides alternative configuration benefits, but may not be necessary if you strictly prioritize ${selectedPriority}.`,
    };
  };

  const upgradeAnalysis = generateUpgradeAnalysis();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F7E8EE] border border-[#E9E2E5] text-[#6D214F] text-xs font-bold shadow-xs">
          <IndianRupee className="w-3.5 h-3.5 text-[#6D214F]" />
          <span>Budget Trade-Off Simulator</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#29252A] tracking-tight leading-tight">
          Is spending more money actually worth it?
        </h1>
        <p className="text-sm sm:text-base text-[#6F6870] leading-relaxed">
          Explore whether stepping up your budget unlocks genuine hardware advantages or just unnecessary extras for your workflow.
        </p>
      </div>

      {/* Interactive Controls Bar */}
      <div className="bg-white rounded-3xl border border-[#E9E2E5] p-6 sm:p-8 shadow-premium space-y-6 max-w-5xl mx-auto">
        {/* Budget Selector */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F]">Select Budget Ceiling</span>
              <h3 className="font-extrabold text-[#29252A] text-lg">Active Budget: {formatINR(selectedBudget)}</h3>
            </div>
            <span className="text-xs text-[#6F6870] font-medium">
              {productsInBudget.length} models available in PostgreSQL
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {BUDGET_TIERS.map((tier) => (
              <button
                key={tier.value}
                onClick={() => setSelectedBudget(tier.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedBudget === tier.value
                    ? 'bg-[#6D214F] text-white shadow-md'
                    : 'bg-[#FAF8F5] text-[#29252A] border border-[#E9E2E5] hover:border-[#6D214F]/40'
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="pt-4 border-t border-[#E9E2E5] space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F]">
            What matters most to your workflow?
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SIMULATOR_PRIORITIES.map((p) => {
              const IconComp = p.icon;
              const isSelected = selectedPriority === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPriority(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center gap-2.5 cursor-pointer ${
                    isSelected
                      ? 'border-[#6D214F] bg-[#FAF8F5] ring-2 ring-[#6D214F]/20'
                      : 'border-[#E9E2E5] bg-white hover:border-[#D8C7D0]'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#6D214F] text-white' : 'bg-[#F7E8EE] text-[#6D214F]'}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-[#29252A]">{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* FEATURE INTERACTION: "Is spending ₹10,000 more worth it?" */}
      {baselineProduct && (
        <div className="bg-gradient-to-br from-[#FAF8F5] via-white to-[#F7E8EE]/40 rounded-3xl border border-[#E9E2E5] p-6 sm:p-8 shadow-premium space-y-6 max-w-5xl mx-auto">
          <div className="border-b border-[#E9E2E5] pb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[#6D214F] font-bold text-lg">✦</span>
              <h2 className="text-xl sm:text-2xl font-black text-[#29252A]">
                “Is spending more worth it?”
              </h2>
            </div>
            {upgradeProduct && (
              <span className="text-xs font-bold bg-[#F7E8EE] text-[#6D214F] px-3 py-1 rounded-full border border-[#E9E2E5]">
                Price Step-Up: +{formatINR(Number(upgradeProduct.price) - Number(baselineProduct.price))}
              </span>
            )}
          </div>

          {upgradeProduct ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left: Baseline Product */}
              <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#E9E2E5] shadow-xs space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6870] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-[#E9E2E5]">
                  Baseline Choice ({formatINR(selectedBudget)} Budget)
                </span>

                <div className="h-28 bg-[#FAF8F5] rounded-xl border border-[#E9E2E5] flex items-center justify-center p-2">
                  {baselineProduct.image_url ? (
                    <img src={getImageUrl(baselineProduct.image_url)} alt="" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <Laptop className="w-8 h-8 text-[#989198]" />
                  )}
                </div>

                <h4 className="font-bold text-[#29252A] text-sm line-clamp-2">
                  {baselineProduct.brand} {baselineProduct.product_name}
                </h4>
                <div className="text-xl font-black text-[#6D214F]">
                  {formatINR(baselineProduct.price)}
                </div>

                <div className="text-xs text-[#6F6870] space-y-1 pt-2 border-t border-[#E9E2E5]">
                  <div>• RAM: <strong>{baselineProduct.ram_gb}GB</strong></div>
                  <div>• Storage: <strong>{baselineProduct.storage_gb}GB {baselineProduct.storage_type}</strong></div>
                  <div>• Processor: <strong>{baselineProduct.processor}</strong></div>
                  <div>• GPU: <strong>{baselineProduct.gpu} ({baselineProduct.gpu_type || 'graphics'})</strong></div>
                  <div>• Weight: <strong>{baselineProduct.weight_kg ? `${baselineProduct.weight_kg} kg` : 'Not available'}</strong></div>
                </div>

                <Link
                  to={`/products/${baselineProduct.product_id}`}
                  className="w-full py-2 bg-[#FAF8F5] hover:bg-[#F7E8EE] text-[#6D214F] text-xs font-bold rounded-xl border border-[#E9E2E5] block text-center transition-colors"
                >
                  View Details
                </Link>
              </div>

              {/* Right: Upgrade Alternative */}
              <div className="lg:col-span-7 bg-white p-5 rounded-2xl border-2 border-[#6D214F]/30 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-2.5 py-0.5 rounded-full">
                    Higher-Priced Alternative
                  </span>
                  <span className="text-xs font-extrabold text-[#6D214F]">
                    +{formatINR(upgradeAnalysis.priceGap)} Extra
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-[#FAF8F5] rounded-xl border border-[#E9E2E5] p-2 flex items-center justify-center shrink-0">
                    {upgradeProduct.image_url ? (
                      <img src={getImageUrl(upgradeProduct.image_url)} alt="" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Laptop className="w-6 h-6 text-[#989198]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#29252A] text-sm">
                      {upgradeProduct.brand} {upgradeProduct.product_name}
                    </h4>
                    <div className="text-lg font-black text-[#6D214F]">
                      {formatINR(upgradeProduct.price)}
                    </div>
                  </div>
                </div>

                {/* Grounded Benefits List */}
                <div className="space-y-2 pt-2 border-t border-[#E9E2E5]">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> What you gain for the extra cost:
                  </span>
                  {upgradeAnalysis.benefits.length > 0 ? (
                    <ul className="space-y-1.5 text-xs text-[#29252A]">
                      {upgradeAnalysis.benefits.map((b, idx) => (
                        <li key={idx} className="bg-emerald-50/60 p-2 rounded-lg border border-emerald-100 flex items-start gap-1.5">
                          <span className="text-emerald-700 font-bold">✓</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#6F6870] italic">No significant hardware specification advantages found.</p>
                  )}
                </div>

                {/* Limitations & Disclosures */}
                {upgradeAnalysis.limitations.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-bold text-[#8B315F] uppercase tracking-wider">
                      Considerations & Disclosures:
                    </span>
                    <ul className="space-y-1 text-xs text-[#6F6870]">
                      {upgradeAnalysis.limitations.map((lim, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-[#C9A227] font-bold">•</span>
                          <span>{lim}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Objective Verdict */}
                <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E9E2E5] text-xs space-y-1">
                  <span className="font-bold text-[#6D214F]">SmartBuy Decision Verdict:</span>
                  <p className="text-[#29252A] leading-relaxed">{upgradeAnalysis.verdictText}</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    to={`/products/${upgradeProduct.product_id}`}
                    className="flex-1 py-2 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl text-center transition-all shadow-xs"
                  >
                    View Higher-Tier Model
                  </Link>
                  <Link
                    to="/compare"
                    onClick={() => {
                      addToCompare(baselineProduct);
                      addToCompare(upgradeProduct);
                    }}
                    className="px-4 py-2 bg-white hover:bg-[#F7E8EE] border border-[#E9E2E5] text-[#6D214F] text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                  >
                    <Scale className="w-3.5 h-3.5" /> Compare Both in Arena
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E9E2E5] space-y-2">
              <AlertCircle className="w-8 h-8 text-[#C9A227] mx-auto" />
              <h4 className="font-bold text-[#29252A] text-sm">No Higher-Tier Alternative In This Window</h4>
              <p className="text-xs text-[#6F6870] max-w-md mx-auto">
                No laptops were found between +₹6,000 and +₹25,000 above this model in our catalog. Try selecting another budget tier above.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Grid of Other Laptops Within Selected Budget */}
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="flex items-center justify-between border-b border-[#E9E2E5] pb-3">
          <h3 className="font-extrabold text-[#29252A] text-base">
            All Models Supported Under {formatINR(selectedBudget)}
          </h3>
          <span className="text-xs text-[#6F6870] font-medium">
            Click any laptop to make it the baseline
          </span>
        </div>

        {productsInBudget.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E9E2E5] text-[#6F6870] text-xs">
            No laptop models found under {formatINR(selectedBudget)}. Please increase the budget ceiling.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {productsInBudget.map((p) => {
              const isCurrentBaseline = baselineProduct?.product_id === p.product_id;
              return (
                <div
                  key={p.product_id}
                  onClick={() => handleSelectBaseline(p)}
                  className={`bg-white p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 flex flex-col justify-between ${
                    isCurrentBaseline
                      ? 'border-[#6D214F] ring-2 ring-[#6D214F]/20 shadow-md'
                      : 'border-[#E9E2E5] hover:border-[#D8C7D0] hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-2 py-0.5 rounded-full">
                        {p.brand}
                      </span>
                      {isCurrentBaseline && (
                        <span className="text-[10px] font-bold text-[#6D214F] bg-[#FAF8F5] border border-[#E9E2E5] px-2 py-0.5 rounded-md">
                          Selected Baseline
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-xs text-[#29252A] mt-2 line-clamp-2">{p.product_name}</h5>
                    <div className="text-base font-black text-[#6D214F] mt-1">{formatINR(p.price)}</div>
                    <div className="text-[11px] text-[#6F6870] mt-1">
                      {p.ram_gb}GB RAM • {p.storage_gb}GB SSD • {p.processor.split(' ')[0]}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="w-full py-1.5 text-center text-xs font-semibold rounded-lg bg-[#FAF8F5] text-[#6D214F] hover:bg-[#F7E8EE] transition-colors"
                  >
                    Simulate Upgrades
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
