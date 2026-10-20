import React from 'react';
import { formatINR } from '../../utils/formatters';
import { Info } from 'lucide-react';

export default function RequirementSummaryBadge({ requirement }) {
  if (!requirement) return null;

  const req = requirement.requirements || requirement;

  const items = [];
  if (req.use_case) items.push({ label: 'Use Case', value: req.use_case });
  if (req.budget_max) items.push({ label: 'Max Budget', value: formatINR(req.budget_max) });
  if (req.minimum_ram) items.push({ label: 'Min RAM', value: `${req.minimum_ram} GB` });
  if (req.minimum_storage) items.push({ label: 'Min Storage', value: `${req.minimum_storage} GB ${req.preferred_storage_type || ''}` });
  if (req.brand_preference) items.push({ label: 'Preferred Brand', value: req.brand_preference });
  if (req.battery_priority === 'high') items.push({ label: 'Battery', value: 'High Priority' });
  if (req.weight_priority === 'high') items.push({ label: 'Weight', value: 'Lightweight Priority' });
  if (req.performance_priority === 'high') items.push({ label: 'Performance', value: 'High Priority' });

  return (
    <div className="bg-[#F2ECF7] border border-[#E9E2E5] text-[#29252A] rounded-2xl p-6 shadow-premium space-y-4">
      <div className="flex items-center justify-between border-b border-[#E9E2E5] pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[#6D214F] text-lg font-bold">✦</span>
          <h3 className="font-bold text-base text-[#29252A]">SmartBuy Intelligence Requirements Breakdown</h3>
        </div>
        <span className="text-xs bg-white text-[#6D214F] border border-[#E9E2E5] px-3 py-1 rounded-full font-bold">
          Validated Constraints
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="bg-white border border-[#E9E2E5] px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs">
            <span className="text-[#6F6870] font-medium">{item.label}:</span>
            <span className="font-bold text-[#6D214F]">{item.value}</span>
          </div>
        ))}
      </div>

      {requirement.unsupported_requirements && requirement.unsupported_requirements.length > 0 && (
        <div className="text-xs bg-white/80 p-3 rounded-xl border border-[#E9E2E5] text-[#6F6870] flex items-start gap-2">
          <Info className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#29252A]">Note: </span>
            {requirement.unsupported_requirements.join(', ')} (Filtered strictly against database specs).
          </div>
        </div>
      )}
    </div>
  );
}
