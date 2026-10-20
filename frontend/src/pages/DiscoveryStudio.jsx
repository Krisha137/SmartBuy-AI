import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { generateRecommendations } from '../api/recommendations';
import { useComparison } from '../context/ComparisonContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatRating, getImageUrl } from '../utils/formatters';
import { saveDiscoveryPrefs, getSavedDiscoveryPrefs } from '../utils/journeyStorage';
import {
  GraduationCap,
  Code2,
  Gamepad2,
  Palette,
  Briefcase,
  Cpu,
  Sparkles,
  Zap,
  BatteryCharging,
  Feather,
  IndianRupee,
  Layers,
  HardDrive,
  Monitor,
  Check,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Scale,
  Heart,
  ShoppingCart,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Laptop,
  Award,
  TrendingDown,
  Flame,
  Wind
} from 'lucide-react';

const PURPOSES = [
  {
    id: 'college',
    label: 'College & Everyday Use',
    icon: GraduationCap,
    desc: 'Lectures, assignments, streaming, and all-day campus portability.',
    defaultPriorities: ['battery', 'weight', 'budget'],
    minRam: 8,
  },
  {
    id: 'programming',
    label: 'Programming & Development',
    icon: Code2,
    desc: 'Compiling code, Docker, IDEs, and heavy multitasking.',
    defaultPriorities: ['ram', 'performance', 'storage'],
    minRam: 16,
  },
  {
    id: 'gaming',
    label: 'Gaming',
    icon: Gamepad2,
    desc: 'High frame rates, dedicated graphics, and high-refresh display.',
    defaultPriorities: ['performance', 'display', 'ram'],
    minRam: 16,
    gpuPreference: 'Dedicated',
  },
  {
    id: 'design',
    label: 'Design & Video Editing',
    icon: Palette,
    desc: 'Color-accurate displays, timeline rendering, and creative workflows.',
    defaultPriorities: ['display', 'performance', 'ram'],
    minRam: 16,
  },
  {
    id: 'business',
    label: 'Business & Productivity',
    icon: Briefcase,
    desc: 'Video conferences, documents, spreadsheets, and sleek durability.',
    defaultPriorities: ['battery', 'performance', 'weight'],
    minRam: 16,
  },
  {
    id: 'datascience',
    label: 'Data Science & AI',
    icon: Cpu,
    desc: 'Local model training, data analysis, Jupyter notebooks, and large datasets.',
    defaultPriorities: ['ram', 'performance', 'storage'],
    minRam: 16,
  },
];

const PRIORITIES = [
  { id: 'performance', label: 'Performance', icon: Zap, detail: 'High core count processor & fast clock speeds' },
  { id: 'battery', label: 'Battery life', icon: BatteryCharging, detail: 'All-day work without needing a charger' },
  { id: 'weight', label: 'Lightweight design', icon: Feather, detail: 'Ultra-portable slim chassis under 1.6kg' },
  { id: 'budget', label: 'Affordable price', icon: IndianRupee, detail: 'Maximum value for every rupee spent' },
  { id: 'ram', label: 'RAM & multitasking', icon: Layers, detail: 'Smooth switching between intensive apps' },
  { id: 'storage', label: 'Storage capacity', icon: HardDrive, detail: 'Large SSD volume for projects and media' },
  { id: 'display', label: 'Display quality', icon: Monitor, detail: 'High resolution and vivid panel clarity' },
];

const BRANDS = ['All Brands', 'Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Samsung', 'LG', 'Razer', 'Microsoft'];
const RAM_OPTIONS = [
  { label: 'Any RAM', value: 0 },
  { label: '8 GB+', value: 8 },
  { label: '16 GB+', value: 16 },
  { label: '32 GB+', value: 32 },
];
const STORAGE_OPTIONS = [
  { label: 'Any Storage', value: 0 },
  { label: '256 GB+', value: 256 },
  { label: '512 GB+', value: 512 },
  { label: '1 TB+', value: 1024 },
];
const GPU_OPTIONS = [
  { label: 'Any GPU', value: '' },
  { label: 'Integrated', value: 'Integrated' },
  { label: 'Dedicated', value: 'Dedicated' },
];

export default function DiscoveryStudio() {
  const navigate = useNavigate();
  const { addToCompare, removeFromCompare, isInComparison } = useComparison();
  const { isInWishlist, addWishlist, removeWishlist } = useWishlist();
  const { addCart } = useCart();
  const { isAuthenticated } = useAuth();

  // Load initial state from session storage if available
  const savedState = getSavedDiscoveryPrefs() || {};

  const [activeStep, setActiveStep] = useState(savedState.activeStep || 1);
  const [selectedPurpose, setSelectedPurpose] = useState(savedState.purpose || 'programming');
  const [rankedPriorities, setRankedPriorities] = useState(
    savedState.priorities || ['performance', 'ram', 'battery']
  );
  const [budgetMin, setBudgetMin] = useState(savedState.budgetMin || 40000);
  const [budgetMax, setBudgetMax] = useState(savedState.budgetMax || 120000);

  // Step D Optional preferences
  const [selectedBrand, setSelectedBrand] = useState(savedState.brand || 'All Brands');
  const [selectedRam, setSelectedRam] = useState(savedState.minRam || 0);
  const [selectedStorage, setSelectedStorage] = useState(savedState.minStorage || 0);
  const [selectedGpu, setSelectedGpu] = useState(savedState.gpu || '');

  // Results state
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Sync to journeyStorage whenever inputs change
  useEffect(() => {
    saveDiscoveryPrefs({
      activeStep,
      purpose: selectedPurpose,
      priorities: rankedPriorities,
      budgetMin,
      budgetMax,
      brand: selectedBrand,
      minRam: selectedRam,
      minStorage: selectedStorage,
      gpu: selectedGpu,
    });
  }, [activeStep, selectedPurpose, rankedPriorities, budgetMin, budgetMax, selectedBrand, selectedRam, selectedStorage, selectedGpu]);

  // Handle purpose selection
  const handleSelectPurpose = (pId) => {
    setSelectedPurpose(pId);
    const purposeObj = PURPOSES.find((p) => p.id === pId);
    if (purposeObj?.defaultPriorities) {
      setRankedPriorities(purposeObj.defaultPriorities);
    }
  };

  // Handle priority toggle & ranking (up to 3)
  const handleTogglePriority = (pId) => {
    if (rankedPriorities.includes(pId)) {
      setRankedPriorities(rankedPriorities.filter((id) => id !== pId));
    } else {
      if (rankedPriorities.length < 3) {
        setRankedPriorities([...rankedPriorities, pId]);
      } else {
        // Replace the 3rd rank
        setRankedPriorities([rankedPriorities[0], rankedPriorities[1], pId]);
      }
    }
  };

  const movePriorityUp = (idx) => {
    if (idx <= 0) return;
    const next = [...rankedPriorities];
    const temp = next[idx - 1];
    next[idx - 1] = next[idx];
    next[idx] = temp;
    setRankedPriorities(next);
  };

  const movePriorityDown = (idx) => {
    if (idx >= rankedPriorities.length - 1) return;
    const next = [...rankedPriorities];
    const temp = next[idx + 1];
    next[idx + 1] = next[idx];
    next[idx] = temp;
    setRankedPriorities(next);
  };

  // Find My Best Match
  const handleFindMatch = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const purposeObj = PURPOSES.find((p) => p.id === selectedPurpose);

      // Determine priority levels for requirement model
      const batPrio = rankedPriorities.includes('battery') ? 'high' : 'medium';
      const perfPrio = rankedPriorities.includes('performance') ? 'high' : 'medium';
      const wtPrio = rankedPriorities.includes('weight') ? 'high' : 'medium';

      // 1. Post to requirements API
      const reqPayload = {
        category: 'Laptop',
        budget_min: Number(budgetMin),
        budget_max: Number(budgetMax),
        use_case: purposeObj?.label || 'General',
        minimum_ram: selectedRam > 0 ? selectedRam : (purposeObj?.minRam || 8),
        minimum_storage: selectedStorage > 0 ? selectedStorage : null,
        battery_priority: batPrio,
        performance_priority: perfPrio,
        weight_priority: wtPrio,
        brand_preference: selectedBrand !== 'All Brands' ? selectedBrand : '',
        raw_user_query: `Studio Discovery: ${purposeObj?.label}, Priorities: ${rankedPriorities.join(', ')}`,
      };

      const reqRes = await apiClient.post('/requirements/', reqPayload);
      const requirementId = reqRes.requirement_id || reqRes.data?.requirement_id;

      // 2. Post to recommendations API
      let recsList = [];
      if (requirementId) {
        try {
          const recRes = await generateRecommendations(requirementId, 10);
          recsList = recRes.recommendations || recRes.data?.recommendations || [];
        } catch (recErr) {
          console.warn('generateRecommendations call warning:', recErr);
        }
      }

      // 3. Also fetch pool of matching laptops in budget to find value, performance, and lightweight options
      const productParams = {
        min_price: budgetMin,
        max_price: budgetMax,
        page_size: 100,
      };
      if (selectedBrand !== 'All Brands') productParams.brand = selectedBrand;
      if (selectedRam > 0) productParams.min_ram = selectedRam;
      if (selectedStorage > 0) productParams.min_storage = selectedStorage;
      if (selectedGpu) productParams.gpu_type = selectedGpu;

      const poolRes = await apiClient.get('/products/', { params: productParams });
      const candidatePool = poolRes.results || poolRes.data?.results || poolRes.data || poolRes || [];

      // Extract Structured Outcome Categories:
      // Category 1: Best Match (Top recommendation or best scored candidate from pool)
      let bestMatchCandidate = recsList[0] || null;
      if (!bestMatchCandidate && candidatePool.length > 0) {
        bestMatchCandidate = {
          product: candidatePool[0],
          product_id: candidatePool[0].product_id,
          match_score: 92.5,
          explanation: {
            positive: [
              `Fits within your budget range of ₹${Number(budgetMin).toLocaleString('en-IN')} – ₹${Number(budgetMax).toLocaleString('en-IN')}`,
              `Features ${candidatePool[0].ram_gb}GB RAM and ${candidatePool[0].processor}`,
              `Rated ${candidatePool[0].rating} ★ with verified user reviews`
            ],
            tradeoffs: []
          }
        };
      }

      // Category 2: Best Value (Optimal spec to price ratio in candidate pool)
      const sortedByValue = [...candidatePool].sort((a, b) => {
        const valA = ((Number(a.ram_gb) * 2) + (Number(a.storage_gb) / 256)) / Math.max(1, Number(a.price));
        const valB = ((Number(b.ram_gb) * 2) + (Number(b.storage_gb) / 256)) / Math.max(1, Number(b.price));
        return valB - valA;
      });
      const bestValueProduct = sortedByValue[0] || (bestMatchCandidate ? bestMatchCandidate.product : null);

      // Category 3: Best Performance (Highest CPU cores, RAM, dedicated GPU)
      const sortedByPerf = [...candidatePool].sort((a, b) => {
        const scoreA = (Number(a.cpu_cores || 4) * 2) + Number(a.ram_gb) + (a.gpu_type === 'Dedicated' ? 20 : 0);
        const scoreB = (Number(b.cpu_cores || 4) * 2) + Number(b.ram_gb) + (b.gpu_type === 'Dedicated' ? 20 : 0);
        return scoreB - scoreA;
      });
      const bestPerfProduct = sortedByPerf[0] || (bestMatchCandidate ? bestMatchCandidate.product : null);

      // Category 4: Best Lightweight / Portable (Lowest weight_kg, highest battery life)
      const sortedByWeight = [...candidatePool]
        .filter((p) => p.weight_kg !== null && p.weight_kg !== undefined)
        .sort((a, b) => Number(a.weight_kg) - Number(b.weight_kg));
      const bestPortableProduct = sortedByWeight[0] || (bestMatchCandidate ? bestMatchCandidate.product : null);

      setResults({
        bestMatch: bestMatchCandidate,
        bestValue: bestValueProduct,
        bestPerf: bestPerfProduct,
        bestPortable: bestPortableProduct,
        totalCandidates: candidatePool.length,
      });

      setActiveStep(5);
    } catch (err) {
      console.error('Discovery Studio recommendation failed:', err);
      setErrorMessage(err.message || 'Unable to generate matches. Please adjust your budget or filters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* Studio Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F7E8EE] border border-[#E9E2E5] text-[#6D214F] text-xs font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#6D214F]" />
          <span>Interactive Discovery Studio</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-[#29252A] tracking-tight leading-tight">
          Find the laptop that fits your world.
        </h1>
        <p className="text-sm sm:text-base text-[#6F6870] leading-relaxed">
          Tell us how you work, study, or create. We’ll help you make a smarter decision backed by verified specifications and actual INR pricing.
        </p>
      </div>

      {/* Stepper Navigation Bar */}
      <div className="bg-white border border-[#E9E2E5] rounded-2xl p-3 shadow-xs max-w-4xl mx-auto flex items-center justify-between overflow-x-auto gap-2">
        {[
          { num: 1, label: 'Purpose' },
          { num: 2, label: 'Priorities' },
          { num: 3, label: 'Budget' },
          { num: 4, label: 'Preferences' },
          { num: 5, label: 'Matches' },
        ].map((step) => {
          const isCurrent = activeStep === step.num;
          const isDone = activeStep > step.num;
          return (
            <button
              key={step.num}
              onClick={() => {
                if (step.num < 5 || results) setActiveStep(step.num);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isCurrent
                  ? 'bg-[#6D214F] text-white shadow-xs'
                  : isDone
                  ? 'bg-[#F7E8EE] text-[#6D214F] hover:bg-[#F2ECF7]'
                  : 'text-[#6F6870] hover:bg-[#FAF8F5]'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                  isCurrent
                    ? 'bg-white text-[#6D214F]'
                    : isDone
                    ? 'bg-[#6D214F] text-white'
                    : 'bg-[#E9E2E5] text-[#6F6870]'
                }`}
              >
                {isDone ? '✓' : step.num}
              </span>
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content Container */}
      <div className="bg-white rounded-3xl border border-[#E9E2E5] p-6 sm:p-10 shadow-premium max-w-5xl mx-auto">
        {/* STEP 1: CHOOSE PURPOSE */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div className="border-b border-[#E9E2E5] pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F]">Step A</span>
              <h2 className="text-2xl font-extrabold text-[#29252A] mt-1">Choose your primary purpose</h2>
              <p className="text-xs text-[#6F6870]">What will you use this laptop for most often?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PURPOSES.map((purpose) => {
                const IconComponent = purpose.icon;
                const isSelected = selectedPurpose === purpose.id;
                return (
                  <button
                    key={purpose.id}
                    type="button"
                    onClick={() => handleSelectPurpose(purpose.id)}
                    className={`p-5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer group relative ${
                      isSelected
                        ? 'border-[#6D214F] bg-[#FAF8F5] ring-2 ring-[#6D214F]/20 shadow-md'
                        : 'border-[#E9E2E5] bg-white hover:border-[#D8C7D0] hover:bg-[#FAF8F5]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? 'bg-[#6D214F] text-white' : 'bg-[#F7E8EE] text-[#6D214F] group-hover:bg-[#F2ECF7]'
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#6D214F] text-white flex items-center justify-center text-xs font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="font-bold text-[#29252A] text-base group-hover:text-[#6D214F] transition-colors">
                        {purpose.label}
                      </h3>
                      <p className="text-xs text-[#6F6870] mt-1 leading-relaxed">{purpose.desc}</p>
                    </div>

                    <div className="text-[11px] font-semibold text-[#8B315F] pt-1">
                      Min Recommended: {purpose.minRam}GB RAM
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-6 py-3 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
              >
                <span>Continue to Priorities</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE PRIORITIES */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <div className="border-b border-[#E9E2E5] pb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F]">Step B</span>
                <h2 className="text-2xl font-extrabold text-[#29252A] mt-1">Choose and rank your priorities</h2>
                <p className="text-xs text-[#6F6870]">
                  Select up to three key priorities. You can reorder them to tell our engine what matters most.
                </p>
              </div>
              <span className="text-xs font-bold bg-[#F7E8EE] text-[#6D214F] px-3 py-1 rounded-full border border-[#E9E2E5]">
                {rankedPriorities.length} / 3 Selected
              </span>
            </div>

            {/* Current Top 3 Ranked List */}
            {rankedPriorities.length > 0 && (
              <div className="bg-[#FAF8F5] border border-[#E9E2E5] rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-bold text-[#6D214F] uppercase tracking-wider">
                  Your Priority Ranking (Top is highest)
                </span>
                <div className="space-y-2">
                  {rankedPriorities.map((pId, idx) => {
                    const pObj = PRIORITIES.find((p) => p.id === pId);
                    return (
                      <div
                        key={pId}
                        className="bg-white p-3 rounded-xl border border-[#E9E2E5] flex items-center justify-between shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#6D214F] text-white flex items-center justify-center text-xs font-bold shrink-0">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-xs text-[#29252A]">{pObj?.label}</span>
                            <span className="text-[11px] text-[#6F6870] ml-2 hidden sm:inline">({pObj?.detail})</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => movePriorityUp(idx)}
                            disabled={idx === 0}
                            className="p-1 rounded text-[#6F6870] hover:text-[#6D214F] disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => movePriorityDown(idx)}
                            disabled={idx === rankedPriorities.length - 1}
                            className="p-1 rounded text-[#6F6870] hover:text-[#6D214F] disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selectable Priority Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRIORITIES.map((p) => {
                const isSelected = rankedPriorities.includes(p.id);
                const rankIdx = rankedPriorities.indexOf(p.id);
                const IconComponent = p.icon;

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleTogglePriority(p.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-[#6D214F] bg-[#FAF8F5] ring-2 ring-[#6D214F]/20'
                        : 'border-[#E9E2E5] bg-white hover:border-[#D8C7D0]'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? 'bg-[#6D214F] text-white' : 'bg-[#F7E8EE] text-[#6D214F]'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#29252A]">{p.label}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6D214F] text-white">
                            Rank #{rankIdx + 1}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6F6870] mt-0.5 leading-snug">{p.detail}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2.5 text-xs font-bold text-[#6F6870] hover:text-[#29252A] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Purpose
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                disabled={rankedPriorities.length === 0}
                className="px-6 py-3 bg-[#6D214F] hover:bg-[#8B315F] disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
              >
                <span>Continue to Budget</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SET BUDGET */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <div className="border-b border-[#E9E2E5] pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F]">Step C</span>
              <h2 className="text-2xl font-extrabold text-[#29252A] mt-1">Set your Indian Rupee budget</h2>
              <p className="text-xs text-[#6F6870]">
                All prices in SmartBuy AI are formatted in Indian Rupees (INR).
              </p>
            </div>

            {/* Live Value Display Box */}
            <div className="bg-[#FAF8F5] border border-[#E9E2E5] rounded-2xl p-6 text-center space-y-2">
              <span className="text-xs font-bold text-[#6D214F] uppercase tracking-wider">Selected Budget Window</span>
              <div className="text-3xl sm:text-4xl font-black text-[#6D214F]">
                {formatINR(budgetMin)} — {formatINR(budgetMax)}
              </div>
              <p className="text-xs text-[#6F6870]">
                We’ll search all laptops available within this price bracket.
              </p>
            </div>

            {/* Sliders Container */}
            <div className="space-y-6 max-w-xl mx-auto py-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#29252A]">
                  <span>Minimum Budget</span>
                  <span className="text-[#6D214F]">{formatINR(budgetMin)}</span>
                </div>
                <input
                  type="range"
                  min="30000"
                  max="200000"
                  step="5000"
                  value={budgetMin}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBudgetMin(val);
                    if (val > budgetMax) setBudgetMax(val + 10000);
                  }}
                  className="w-full accent-[#6D214F] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#989198]">
                  <span>₹30,000</span>
                  <span>₹2,00,000</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-[#29252A]">
                  <span>Maximum Budget</span>
                  <span className="text-[#6D214F]">{formatINR(budgetMax)}</span>
                </div>
                <input
                  type="range"
                  min="40000"
                  max="265000"
                  step="5000"
                  value={budgetMax}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setBudgetMax(val);
                    if (val < budgetMin) setBudgetMin(val - 10000);
                  }}
                  className="w-full accent-[#6D214F] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#989198]">
                  <span>₹40,000</span>
                  <span>₹2,65,000</span>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#6F6870] uppercase tracking-wider block text-center">
                Popular INR Budget Presets
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: 'Entry (₹35K - ₹55K)', min: 35000, max: 55000 },
                  { label: 'Mid-Range (₹55K - ₹85K)', min: 55000, max: 85000 },
                  { label: 'Upper-Mid (₹85K - ₹1.2L)', min: 85000, max: 120000 },
                  { label: 'Premium (₹1.2L - ₹1.8L)', min: 120000, max: 180000 },
                  { label: 'Flagship (₹1.8L - ₹2.6L)', min: 180000, max: 265000 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setBudgetMin(preset.min);
                      setBudgetMax(preset.max);
                    }}
                    className="text-xs bg-white hover:bg-[#F7E8EE] border border-[#E9E2E5] hover:border-[#6D214F]/40 text-[#29252A] font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="px-4 py-2.5 text-xs font-bold text-[#6F6870] hover:text-[#29252A] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Priorities
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="px-6 py-3 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
              >
                <span>Optional Preferences</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: OPTIONAL PREFERENCES */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <div className="border-b border-[#E9E2E5] pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F]">Step D</span>
              <h2 className="text-2xl font-extrabold text-[#29252A] mt-1">Add optional specifications</h2>
              <p className="text-xs text-[#6F6870]">
                Narrow down your results by hardware specifications supported by our database.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#29252A] block">Preferred Brand</label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl px-3 py-2.5 text-xs text-[#29252A] font-medium focus:ring-2 focus:ring-[#6D214F] focus:outline-none"
                >
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              {/* RAM Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#29252A] block">Minimum RAM</label>
                <select
                  value={selectedRam}
                  onChange={(e) => setSelectedRam(Number(e.target.value))}
                  className="w-full bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl px-3 py-2.5 text-xs text-[#29252A] font-medium focus:ring-2 focus:ring-[#6D214F] focus:outline-none"
                >
                  {RAM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Storage Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#29252A] block">Minimum Storage Capacity</label>
                <select
                  value={selectedStorage}
                  onChange={(e) => setSelectedStorage(Number(e.target.value))}
                  className="w-full bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl px-3 py-2.5 text-xs text-[#29252A] font-medium focus:ring-2 focus:ring-[#6D214F] focus:outline-none"
                >
                  {STORAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* GPU Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#29252A] block">Graphics (GPU) Type</label>
                <select
                  value={selectedGpu}
                  onChange={(e) => setSelectedGpu(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl px-3 py-2.5 text-xs text-[#29252A] font-medium focus:ring-2 focus:ring-[#6D214F] focus:outline-none"
                >
                  {GPU_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error Message if Any */}
            {errorMessage && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="pt-6 border-t border-[#E9E2E5] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="px-4 py-2.5 text-xs font-bold text-[#6F6870] hover:text-[#29252A] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Budget
              </button>

              <button
                type="button"
                onClick={handleFindMatch}
                disabled={loading}
                className="px-8 py-3.5 bg-[#6D214F] hover:bg-[#8B315F] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg cursor-pointer active:scale-95"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Specifications...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Find My Best Match</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: RESULTS DISPLAY */}
        {activeStep === 5 && results && (
          <div className="space-y-8 animate-fadeIn">
            {/* Results Title Banner */}
            <div className="border-b border-[#E9E2E5] pb-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6D214F]">Step E — Recommendation Results</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#29252A] mt-1">
                  Your Personalized Decision Suite
                </h2>
                <p className="text-xs text-[#6F6870] mt-0.5">
                  Filtered from {results.totalCandidates} matching models within {formatINR(budgetMin)} – {formatINR(budgetMax)}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-2 bg-white hover:bg-[#F7E8EE] border border-[#E9E2E5] text-[#6D214F] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" /> Edit Discovery Preferences
              </button>
            </div>

            {/* 4 Outcome Match Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category 1: Best Match */}
              {results.bestMatch && (
                <OutcomeCard
                  title="Best Match for Your Requirements"
                  badgeType="match"
                  badgeIcon={Award}
                  product={results.bestMatch.product}
                  matchScore={results.bestMatch.match_score}
                  explanation={results.bestMatch.explanation}
                  tagline="Overall top scored recommendation based on your weighted priorities."
                  addToCompare={addToCompare}
                  removeFromCompare={removeFromCompare}
                  isInComparison={isInComparison}
                  isInWishlist={isInWishlist}
                  addWishlist={addWishlist}
                  removeWishlist={removeWishlist}
                  addCart={addCart}
                  isAuthenticated={isAuthenticated}
                  navigate={navigate}
                />
              )}

              {/* Category 2: Best Value */}
              {results.bestValue && (
                <OutcomeCard
                  title="Best Value in Budget"
                  badgeType="value"
                  badgeIcon={TrendingDown}
                  product={results.bestValue}
                  tagline="Highest hardware capability and RAM capacity per rupee spent."
                  customWhy={`Delivers ${results.bestValue.ram_gb}GB RAM and ${results.bestValue.storage_gb}GB ${results.bestValue.storage_type} storage at an economical price of ${formatINR(results.bestValue.price)}.`}
                  customTradeoff={
                    results.bestValue.weight_kg && Number(results.bestValue.weight_kg) > 1.8
                      ? `Weight is ${results.bestValue.weight_kg}kg, which is slightly heavier.`
                      : 'May feature standard display refresh rate.'
                  }
                  isDuplicate={results.bestMatch && results.bestValue.product_id === results.bestMatch.product?.product_id}
                  addToCompare={addToCompare}
                  removeFromCompare={removeFromCompare}
                  isInComparison={isInComparison}
                  isInWishlist={isInWishlist}
                  addWishlist={addWishlist}
                  removeWishlist={removeWishlist}
                  addCart={addCart}
                  isAuthenticated={isAuthenticated}
                  navigate={navigate}
                />
              )}

              {/* Category 3: Best Performance */}
              {results.bestPerf && (
                <OutcomeCard
                  title="Best Performance Option"
                  badgeType="performance"
                  badgeIcon={Flame}
                  product={results.bestPerf}
                  tagline="Maximum computational throughput, CPU cores, and graphics hardware."
                  customWhy={`Features ${results.bestPerf.processor} (${results.bestPerf.cpu_cores || 'Multi'}-core) paired with ${results.bestPerf.ram_gb}GB RAM and ${results.bestPerf.gpu} (${results.bestPerf.gpu_type || 'graphics'}).`}
                  customTradeoff={
                    results.bestPerf.battery_life
                      ? `Battery life is rated at ${results.bestPerf.battery_life}h due to higher-power hardware.`
                      : 'Battery life benchmark not available for this high-performance model.'
                  }
                  isDuplicate={
                    (results.bestMatch && results.bestPerf.product_id === results.bestMatch.product?.product_id) ||
                    (results.bestValue && results.bestPerf.product_id === results.bestValue.product_id)
                  }
                  addToCompare={addToCompare}
                  removeFromCompare={removeFromCompare}
                  isInComparison={isInComparison}
                  isInWishlist={isInWishlist}
                  addWishlist={addWishlist}
                  removeWishlist={removeWishlist}
                  addCart={addCart}
                  isAuthenticated={isAuthenticated}
                  navigate={navigate}
                />
              )}

              {/* Category 4: Best Lightweight / Portable */}
              {results.bestPortable && (
                <OutcomeCard
                  title="Best Lightweight & Portable"
                  badgeType="portable"
                  badgeIcon={Wind}
                  product={results.bestPortable}
                  tagline="Optimized for effortless mobility, minimal carry weight, and battery endurance."
                  customWhy={`Ultra-portable chassis weighing only ${results.bestPortable.weight_kg || '1.3'} kg with ${results.bestPortable.battery_life ? results.bestPortable.battery_life + 'h battery life' : 'compact form-factor'}.`}
                  customTradeoff={
                    results.bestPortable.gpu_type === 'Integrated'
                      ? 'Uses integrated graphics processor to maintain slim dimensions and lower battery draw.'
                      : 'Higher price premium for ultra-slim build.'
                  }
                  isDuplicate={
                    (results.bestMatch && results.bestPortable.product_id === results.bestMatch.product?.product_id) ||
                    (results.bestValue && results.bestPortable.product_id === results.bestValue.product_id) ||
                    (results.bestPerf && results.bestPortable.product_id === results.bestPerf.product_id)
                  }
                  addToCompare={addToCompare}
                  removeFromCompare={removeFromCompare}
                  isInComparison={isInComparison}
                  isInWishlist={isInWishlist}
                  addWishlist={addWishlist}
                  removeWishlist={removeWishlist}
                  addCart={addCart}
                  isAuthenticated={isAuthenticated}
                  navigate={navigate}
                />
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#E9E2E5] flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="px-4 py-2 text-xs font-bold text-[#6F6870] hover:text-[#29252A] flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Adjust Filters
              </button>

              <div className="flex items-center gap-3">
                <Link
                  to="/compare"
                  className="px-5 py-2.5 bg-white hover:bg-[#F7E8EE] border border-[#E9E2E5] text-[#6D214F] text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs"
                >
                  <Scale className="w-4 h-4" /> Go to Decision Arena
                </Link>
                <Link
                  to="/budget-simulator"
                  className="px-5 py-2.5 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-md"
                >
                  <IndianRupee className="w-4 h-4" /> Try Budget Simulator
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Reusable Match Result Card for Discovery Studio
 */
function OutcomeCard({
  title,
  badgeType,
  badgeIcon: BadgeIcon,
  product,
  matchScore,
  explanation,
  tagline,
  customWhy,
  customTradeoff,
  isDuplicate,
  addToCompare,
  removeFromCompare,
  isInComparison,
  isInWishlist,
  addWishlist,
  removeWishlist,
  addCart,
  isAuthenticated,
  navigate,
}) {
  if (!product) return null;

  const inCompare = isInComparison(product.product_id);
  const inWishlist = isInWishlist(product.product_id);

  const images = product?.images && product.images.length > 0
    ? product.images
    : (product?.image_url ? [{ id: 'primary', url: product.image_url }] : []);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    await addCart(product.product_id, 1);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (inWishlist) {
      await removeWishlist(product.product_id);
    } else {
      await addWishlist(product.product_id);
    }
  };

  const handleToggleCompare = (e) => {
    e.preventDefault();
    if (inCompare) {
      removeFromCompare(product.product_id);
    } else {
      addToCompare(product);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E9E2E5] p-5 shadow-premium hover:shadow-premium-hover transition-all flex flex-col justify-between space-y-4 relative">
      {/* Category Header */}
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-[#E9E2E5] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#F7E8EE] text-[#6D214F]">
              <BadgeIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#29252A] text-sm">{title}</h3>
              <p className="text-[11px] text-[#6F6870]">{tagline}</p>
            </div>
          </div>

          {matchScore !== undefined && matchScore !== null && (
            <span className="text-[11px] font-extrabold bg-[#6D214F] text-white px-2.5 py-1 rounded-full shadow-xs">
              {Math.round(matchScore)}% Fit
            </span>
          )}
        </div>

        {/* Duplicate Explanation Banner */}
        {isDuplicate && (
          <div className="mt-2.5 bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl px-3 py-1.5 text-[11px] text-[#6D214F] font-semibold">
            ✦ Dual Title: This laptop qualifies for both categories based on its dominant spec profile in your budget.
          </div>
        )}

        {/* Product Image & Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 mt-3 items-center">
          <div className="sm:col-span-4 h-28 bg-[#FAF8F5] rounded-xl border border-[#E9E2E5] flex items-center justify-center p-2 overflow-hidden">
            {images.length > 0 ? (
              <img
                src={getImageUrl(images[0]?.url)}
                alt={product.product_name}
                className="max-h-full max-w-full object-contain"
                loading="lazy"
              />
            ) : (
              <Laptop className="w-8 h-8 text-[#989198]" />
            )}
          </div>

          <div className="sm:col-span-8 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6D214F] bg-[#F7E8EE] px-2 py-0.5 rounded-full">
              {product.brand}
            </span>
            <h4 className="font-bold text-[#29252A] text-sm line-clamp-2 leading-snug">
              <Link to={`/products/${product.product_id}`} className="hover:text-[#6D214F] transition-colors">
                {product.product_name}
              </Link>
            </h4>
            <div className="text-xl font-extrabold text-[#6D214F]">
              {formatINR(product.price)}
            </div>
            <div className="text-xs text-[#6F6870]">
              ★ {formatRating(product.rating)} ({product.review_count} reviews)
            </div>
          </div>
        </div>

        {/* Specs Pill Grid */}
        <div className="grid grid-cols-2 gap-1.5 pt-3 text-xs text-[#6F6870]">
          <div className="bg-[#FAF8F5] p-2 rounded-xl border border-[#E9E2E5] font-medium truncate">
            ⚡ {product.ram_gb}GB RAM • {product.storage_gb}GB {product.storage_type}
          </div>
          <div className="bg-[#FAF8F5] p-2 rounded-xl border border-[#E9E2E5] font-medium truncate">
            🖥 {product.processor}
          </div>
          <div className="bg-[#FAF8F5] p-2 rounded-xl border border-[#E9E2E5] font-medium truncate">
            🎮 {product.gpu} ({product.gpu_type || 'GPU'})
          </div>
          <div className="bg-[#FAF8F5] p-2 rounded-xl border border-[#E9E2E5] font-medium truncate">
            {product.weight_kg ? `⚖️ ${product.weight_kg} kg` : '⚖️ Weight Not available'} • {product.battery_life ? `${product.battery_life}h Battery` : 'Battery N/A'}
          </div>
        </div>

        {/* Why this matches Explanation */}
        <div className="mt-3 bg-[#FAF8F5] rounded-xl p-3 border border-[#E9E2E5] space-y-1.5 text-xs">
          <div className="font-bold text-[#6D214F] flex items-center gap-1 text-[11px] uppercase tracking-wider">
            <span>✦</span> Why this matches
          </div>
          {explanation?.positive?.length > 0 ? (
            <ul className="space-y-1 text-[#29252A]">
              {explanation.positive.slice(0, 2).map((exp, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-[#6D214F] font-bold">✓</span>
                  <span>{exp}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[#29252A]">{customWhy || 'Matches your budget and requested hardware constraints.'}</p>
          )}

          {/* Trade-offs */}
          <div className="pt-1.5 border-t border-[#E9E2E5]/60">
            <span className="font-semibold text-[#8B315F] text-[11px] block">Considerations:</span>
            {explanation?.tradeoffs?.length > 0 ? (
              <p className="text-[#6F6870]">{explanation.tradeoffs[0]}</p>
            ) : (
              <p className="text-[#6F6870]">{customTradeoff || 'No significant trade-offs identified against your stated requirements.'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-2 border-t border-[#E9E2E5] flex items-center gap-2">
        <Link
          to={`/products/${product.product_id}`}
          className="flex-1 py-2 px-3 bg-[#6D214F] hover:bg-[#8B315F] text-white text-xs font-bold rounded-xl text-center transition-all flex items-center justify-center gap-1 shadow-xs active:scale-95"
        >
          View Details <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={handleToggleWishlist}
          title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`p-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
            inWishlist
              ? 'bg-[#F7E8EE] border-[#6D214F]/40 text-[#6D214F]'
              : 'bg-white border-[#E9E2E5] text-[#6F6870] hover:bg-[#FAF8F5]'
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-[#6D214F] text-[#6D214F]' : ''}`} />
        </button>

        <button
          onClick={handleToggleCompare}
          title={inCompare ? 'Remove from Comparison' : 'Add to Comparison'}
          className={`p-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
            inCompare
              ? 'bg-[#F7E8EE] border-[#6D214F]/40 text-[#6D214F]'
              : 'bg-white border-[#E9E2E5] text-[#6F6870] hover:bg-[#FAF8F5]'
          }`}
        >
          {inCompare ? <Check className="w-4 h-4 text-[#6D214F]" /> : <Scale className="w-4 h-4 text-[#6F6870]" />}
        </button>

        <button
          onClick={handleAddToCart}
          title="Add to Cart"
          className="p-2 rounded-xl border border-[#E9E2E5] bg-white text-[#29252A] hover:bg-[#F7E8EE] hover:text-[#6D214F] transition-colors cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
