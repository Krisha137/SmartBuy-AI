import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Database, Zap } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white text-[#6F6870] text-xs border-t border-[#E9E2E5] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#6D214F] text-white flex items-center justify-center font-bold text-sm">
                ✦
              </div>
              <span className="font-bold text-base text-[#29252A]">SmartBuy AI</span>
            </div>
            <p className="text-[#6F6870] text-xs leading-relaxed max-w-md">
              SmartBuy AI helps you find the right laptop based on natural-language requirement understanding, deterministic matching algorithms, and precomputed customer review intelligence.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E9E2E5] text-[#29252A] text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6D214F]" /> Evidence-Based AI
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E9E2E5] text-[#29252A] text-[11px] font-semibold">
                <Database className="w-3.5 h-3.5 text-[#8B315F]" /> PostgreSQL Database
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E9E2E5] text-[#29252A] text-[11px] font-semibold">
                <Zap className="w-3.5 h-3.5 text-[#C9A227]" /> INR (₹) Prices
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-[#29252A] font-bold text-xs uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-1.5 text-xs text-[#6F6870]">
              <li><Link to="/" className="hover:text-[#6D214F] transition-colors">✦ AI Requirement Search</Link></li>
              <li><Link to="/explore" className="hover:text-[#6D214F] transition-colors">Explore Product Catalog</Link></li>
              <li><Link to="/compare" className="hover:text-[#6D214F] transition-colors">Laptop Comparison Engine</Link></li>
              <li><Link to="/wishlist" className="hover:text-[#6D214F] transition-colors">My Wishlist</Link></li>
              <li><Link to="/cart" className="hover:text-[#6D214F] transition-colors">Shopping Cart</Link></li>
            </ul>
          </div>

          {/* System info */}
          <div className="space-y-2.5">
            <h4 className="text-[#29252A] font-bold text-xs uppercase tracking-wider">Product Intelligence</h4>
            <ul className="space-y-1.5 text-xs text-[#6F6870]">
              <li>• Natural Language Requirement Parser</li>
              <li>• Deterministic Spec Matcher</li>
              <li>• Customer Sentiment Analytics</li>
              <li>• Real-Time Product Q&A</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#E9E2E5] mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#989198] gap-2">
          <div>© {new Date().getFullYear()} SmartBuy AI. All rights reserved. Premium AI Shopping Experience.</div>
          <div>All prices in Indian Rupees (₹ / INR).</div>
        </div>
      </div>
    </footer>
  );
}
