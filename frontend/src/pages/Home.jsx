import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import ProductCard from '../components/products/ProductCard';
import { getRecentlyViewed, getSavedDiscoveryPrefs } from '../utils/journeyStorage';
import { formatINR } from '../utils/formatters';
import {
  ArrowRight,
  Compass,
  Sparkles,
  Scale,
  IndianRupee,
  ShieldCheck,
  Zap,
  GraduationCap,
  Code2,
  Gamepad2,
  Palette,
  Briefcase,
  Cpu,
  Clock,
  CheckCircle2,
  HelpCircle,
  ThumbsUp,
  Layers
} from 'lucide-react';

const USE_CASES = [
  { id: 'college', label: 'College & Daily', icon: GraduationCap, query: 'student laptop' },
  { id: 'coding', label: 'Programming', icon: Code2, query: 'coding 16GB' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, query: 'gaming dedicated GPU' },
  { id: 'design', label: 'Design & Video', icon: Palette, query: 'video editing' },
  { id: 'business', label: 'Business & Office', icon: Briefcase, query: 'business productivity' },
  { id: 'ai', label: 'Data Science & AI', icon: Cpu, query: 'data science' },
];

export default function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Live collections from PostgreSQL
  const [curatedCollection, setCuratedCollection] = useState('performance');
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // User journey state
  const [recentItems, setRecentItems] = useState([]);
  const [savedPrefs, setSavedPrefs] = useState(null);

  useEffect(() => {
    setRecentItems(getRecentlyViewed());
    setSavedPrefs(getSavedDiscoveryPrefs());
  }, []);

  // Fetch actual products for curated collection tabs
  useEffect(() => {
    let isMounted = true;
    setLoadingProducts(true);

    let params = {};
    if (curatedCollection === 'performance') {
      params = { min_ram: 16, ordering: '-price' };
    } else if (curatedCollection === 'ultrabooks') {
      params = { max_weight: 1.5, ordering: 'price' };
    } else if (curatedCollection === 'value') {
      params = { max_price: 65000, ordering: '-rating' };
    }

    apiClient
      .get('/products/', { params })
      .then((res) => {
        if (isMounted) {
          const list = res.results || res.data?.results || res || [];
          setCollectionProducts(list.slice(0, 4));
          setLoadingProducts(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load curated collection:', err);
        if (isMounted) setLoadingProducts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [curatedCollection]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-20 animate-fadeIn">
      {/* 1. DISCOVERY HERO */}
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#E9E2E5]">
        {/* Subtle Warm Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#F7E8EE]/50 to-[#F2ECF7]/50 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white border border-[#E9E2E5] text-[#6D214F] text-xs font-bold shadow-xs">
            <span className="text-sm">✦</span>
            <span>Intelligent Laptop Decision Platform</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#29252A] leading-[1.12]">
              Your next laptop, <br className="hidden sm:block" />
              <span className="text-[#6D214F] relative inline-block">
                chosen with intelligence.
                <span className="absolute bottom-1 inset-x-0 h-3 bg-[#F7E8EE] -z-10 rounded-full opacity-80" />
              </span>
            </h1>
            <p className="text-base sm:text-lg text-[#6F6870] max-w-2xl mx-auto leading-relaxed">
              Skip endless spec sheets and marketing hype. Tell us how you work, compare real trade-offs, and discover the exact laptop that fits your budget.
            </p>
          </div>

          {/* 2. PROMINENT QUICK-START ENTRY INTO DISCOVERY STUDIO */}
          <div className="max-w-2xl mx-auto bg-white p-3 rounded-2xl border-2 border-[#6D214F]/30 hover:border-[#6D214F] shadow-premium transition-all duration-300">
            <form onSubmit={handleHeroSearch} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2.5 w-full pl-3 py-1">
                <span className="text-[#6D214F] font-black text-lg">✦</span>
                <input
                  type="text"
                  placeholder="Need a laptop for coding under ₹80,000..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-[#29252A] placeholder:text-[#989198] text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="w-full sm:w-auto px-5 py-3 bg-[#6D214F] hover:bg-[#8B315F] disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Search</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <Link
                  to="/discovery-studio"
                  className="w-full sm:w-auto px-5 py-3 bg-[#F7E8EE] hover:bg-[#F2ECF7] text-[#6D214F] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 border border-[#E9E2E5] shadow-xs whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open Studio</span>
                </Link>
              </div>
            </form>
          </div>

          <div className="flex items-center justify-center gap-4 text-[11px] text-[#989198] font-medium pt-1">
            <span>Verified PostgreSQL Specifications</span>
            <span>•</span>
            <span>Indian Rupee Pricing (INR)</span>
            <span>•</span>
            <span>Evidence-Based Reviews</span>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE USE-CASE SELECTOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-3 py-1 rounded-full">
            ✦ Quick Explore
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#29252A]">
            What are you looking to accomplish?
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6870]">
            Select your workflow to see instant tailored recommendations.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {USE_CASES.map((uc) => {
            const IconComp = uc.icon;
            return (
              <button
                key={uc.id}
                onClick={() => navigate(`/search?q=${encodeURIComponent(uc.query)}`)}
                className="bg-white p-4 rounded-2xl border border-[#E9E2E5] hover:border-[#6D214F] hover:bg-[#FAF8F5] transition-all flex flex-col items-center text-center space-y-2 cursor-pointer shadow-xs group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F7E8EE] text-[#6D214F] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <IconComp className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-[#29252A] group-hover:text-[#6D214F] transition-colors">
                  {uc.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 4. CONTINUE YOUR LAPTOP SEARCH (WHEN PREVIOUS ACTIVITY EXISTS) */}
      {(recentItems.length > 0 || savedPrefs) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FAF8F5] rounded-3xl border border-[#E9E2E5] p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E9E2E5] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#6D214F]" />
                <h3 className="font-extrabold text-[#29252A] text-base">Continue Your Laptop Search</h3>
              </div>
              <Link to="/my-journey" className="text-xs font-bold text-[#6D214F] hover:underline flex items-center gap-1">
                View Full Journey <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recentItems.slice(0, 4).map((p) => (
                <Link
                  key={p.product_id}
                  to={`/products/${p.product_id}`}
                  className="bg-white p-3.5 rounded-2xl border border-[#E9E2E5] hover:border-[#6D214F]/40 transition-all block space-y-1.5 shadow-xs"
                >
                  <span className="text-[10px] font-bold uppercase text-[#6D214F] bg-[#F7E8EE] px-2 py-0.5 rounded-full">
                    {p.brand}
                  </span>
                  <div className="font-bold text-xs text-[#29252A] truncate mt-1">{p.product_name}</div>
                  <div className="text-sm font-black text-[#6D214F]">{formatINR(p.price)}</div>
                  <div className="text-[11px] text-[#6F6870]">{p.ram_gb}GB RAM • {p.storage_gb}GB SSD</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. CURATED PRODUCT COLLECTIONS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E9E2E5] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F]">Curated Catalog</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#29252A]">
              Tested Hardware Collections
            </h2>
          </div>

          <div className="inline-flex rounded-xl p-1 bg-[#FAF8F5] border border-[#E9E2E5]">
            <button
              onClick={() => setCuratedCollection('performance')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                curatedCollection === 'performance' ? 'bg-[#6D214F] text-white shadow-xs' : 'text-[#6F6870] hover:text-[#29252A]'
              }`}
            >
              Power & Multitasking
            </button>
            <button
              onClick={() => setCuratedCollection('ultrabooks')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                curatedCollection === 'ultrabooks' ? 'bg-[#6D214F] text-white shadow-xs' : 'text-[#6F6870] hover:text-[#29252A]'
              }`}
            >
              Ultra-Portable (&lt;1.5kg)
            </button>
            <button
              onClick={() => setCuratedCollection('value')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                curatedCollection === 'value' ? 'bg-[#6D214F] text-white shadow-xs' : 'text-[#6F6870] hover:text-[#29252A]'
              }`}
            >
              High Value (&lt;₹65K)
            </button>
          </div>
        </div>

        {loadingProducts ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 bg-white rounded-2xl border border-[#E9E2E5] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {collectionProducts.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* 6. PREVIEW OF DECISION ARENA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#E9E2E5] p-6 sm:p-10 shadow-premium grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-3 py-1 rounded-full">
              ✦ Feature Preview
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#29252A]">
              SmartBuy Decision Arena
            </h3>
            <p className="text-xs sm:text-sm text-[#6F6870] leading-relaxed">
              Don’t settle for generic comparison tables. Decision Arena calculates concrete gains (“What do I gain?”), explicit trade-offs (“What am I sacrificing?”), and a personal verdict based on your actual work priorities.
            </p>
            <div className="space-y-2 text-xs text-[#29252A] pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Pairwise INR price gap and RAM headroom calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Honest disclosure of missing battery and weight data</span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/compare"
                className="px-6 py-3 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2"
              >
                <Scale className="w-4 h-4" /> Enter Decision Arena
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E9E2E5] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#6D214F]">
              <span>Arena Preview Snapshot</span>
              <span>2 Models Selected</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#E9E2E5] space-y-1 text-xs">
              <span className="font-bold text-[#29252A]">“What do I gain?”</span>
              <p className="text-[#6F6870] text-[11px]">
                Choosing Model A provides 16GB RAM (+8GB more than Model B) for virtualization and heavy multitasking.
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-[#E9E2E5] space-y-1 text-xs">
              <span className="font-bold text-[#29252A]">“What am I sacrificing?”</span>
              <p className="text-[#6F6870] text-[11px]">
                Costs ₹14,000 more and carries a 0.2kg heavier chassis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PREVIEW OF BUDGET SIMULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#FAF8F5] via-[#F7E8EE]/40 to-[#FAF8F5] rounded-3xl border border-[#E9E2E5] p-6 sm:p-10 shadow-premium grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F] bg-white border border-[#E9E2E5] px-3 py-1 rounded-full">
              ✦ Budget Intelligence
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-[#29252A]">
              Is spending ₹10,000 more worth it?
            </h3>
            <p className="text-xs sm:text-sm text-[#6F6870] leading-relaxed">
              Our interactive Budget Simulator tests whether jumping to the next price bracket unlocks meaningful upgrades like 16GB RAM or a dedicated GPU, or whether your current budget already provides everything you need.
            </p>
            <div className="pt-2">
              <Link
                to="/budget-simulator"
                className="px-6 py-3 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2"
              >
                <IndianRupee className="w-4 h-4" /> Try Budget Simulator
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#E9E2E5] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#29252A]">
              <span>Interactive Step-Up Analysis</span>
              <span className="text-[#6D214F]">+₹10,000 Bracket</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                ✓ <strong>RAM Upgrade:</strong> 16GB installed (vs 8GB baseline)
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900">
                ✓ <strong>SSD Upgrade:</strong> 512GB NVMe (vs 256GB baseline)
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-900">
                • <strong>Consideration:</strong> Battery endurance data unavailable on upgrade model
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. REVIEW TRUTH LENS PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-3 py-1 rounded-full">
            ✦ NLP Review Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#29252A]">
            Review Truth Lens
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6870]">
            We analyzed 1,142 customer reviews across 16 factual dimensions. Click any theme on any product page to read real quotes and honest confidence ratings.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { name: 'Performance', count: '596 mentions' },
            { name: 'Value for Money', count: '532 mentions' },
            { name: 'Battery Life', count: '456 mentions' },
            { name: 'Display Quality', count: '431 mentions' },
            { name: 'Build Quality', count: '140 mentions' },
            { name: 'Keyboard Feel', count: '155 mentions' },
          ].map((theme, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-2xl border border-[#E9E2E5] text-center space-y-1 shadow-xs"
            >
              <span className="font-bold text-xs text-[#29252A] block">{theme.name}</span>
              <span className="text-[11px] text-[#6D214F] font-semibold">{theme.count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FINAL CLEAR CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#6D214F] text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <h3 className="text-2xl sm:text-4xl font-black">
              Ready to find the laptop that fits your world?
            </h3>
            <p className="text-xs sm:text-sm text-[#F7E8EE] leading-relaxed">
              Step into Discovery Studio, set your budget in Indian Rupees, and get grounded recommendations in minutes.
            </p>
            <div className="pt-2">
              <Link
                to="/discovery-studio"
                className="px-8 py-3.5 bg-white hover:bg-[#FAF8F5] text-[#6D214F] text-xs font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#6D214F]" /> Enter Discovery Studio
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
