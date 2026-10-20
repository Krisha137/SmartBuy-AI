import React from 'react';
import { Cpu, HardDrive, Monitor, Battery } from 'lucide-react';

export default function SpecGrid({ product }) {
  if (!product) return null;

  const specSections = [
    {
      title: "Performance & Processor",
      icon: Cpu,
      items: [
        { label: "Processor", value: product.processor },
        { label: "CPU Cores", value: product.cpu_cores ? `${product.cpu_cores} Cores` : null },
        { label: "System RAM", value: product.ram_gb ? `${product.ram_gb} GB` : null },
        { label: "Operating System", value: product.operating_system },
      ]
    },
    {
      title: "Storage & Memory",
      icon: HardDrive,
      items: [
        { label: "Storage Capacity", value: product.storage_gb ? `${product.storage_gb} GB` : null },
        { label: "Storage Type", value: product.storage_type },
        { label: "RAM Capacity", value: product.ram_gb ? `${product.ram_gb} GB` : null },
      ]
    },
    {
      title: "Graphics & Display",
      icon: Monitor,
      items: [
        { label: "Graphics Processor", value: product.gpu },
        { label: "GPU Type", value: product.gpu_type },
        { label: "Display Size", value: product.display_size ? `${product.display_size}"` : null },
        { label: "Resolution", value: product.display_resolution },
        { label: "Display Technology", value: product.display_type },
        { label: "Refresh Rate", value: product.refresh_rate ? `${product.refresh_rate} Hz` : null },
      ]
    },
    {
      title: "Battery & Mobility",
      icon: Battery,
      items: [
        { label: "Battery Capacity", value: product.battery_wh ? `${product.battery_wh} Wh` : null },
        { label: "Listed Battery Life", value: product.battery_life ? `${product.battery_life} Hours` : null },
        { label: "Weight", value: product.weight_kg ? `${product.weight_kg} kg` : null },
        { label: "Product Segment", value: product.product_segment },
        { label: "Release Year", value: product.release_year },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#E9E2E5] pb-3">
        <h3 className="text-lg font-bold text-[#29252A] flex items-center gap-2">
          <span className="text-[#6D214F] text-lg font-bold">✦</span>
          Key Specifications
        </h3>
        <span className="text-xs text-[#6F6870] font-medium">Verified PostgreSQL Specifications</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {specSections.map((sec, idx) => {
          const IconComponent = sec.icon;
          const validItems = sec.items.filter(item => item.value !== null && item.value !== undefined && item.value !== '');
          if (validItems.length === 0) return null;

          return (
            <div key={idx} className="bg-white rounded-2xl border border-[#E9E2E5] p-5 shadow-premium space-y-3">
              <div className="flex items-center gap-2 text-[#6D214F] font-bold text-sm border-b border-[#E9E2E5] pb-2">
                <IconComponent className="w-4 h-4 text-[#6D214F]" />
                <span>{sec.title}</span>
              </div>
              
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs">
                {validItems.map((item, i) => (
                  <div key={i} className="space-y-0.5 bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E9E2E5]">
                    <dt className="text-[#6F6870] font-medium text-[11px]">{item.label}</dt>
                    <dd className="text-[#29252A] font-bold break-words">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          );
        })}
      </div>
    </div>
  );
}
