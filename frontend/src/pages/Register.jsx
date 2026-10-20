import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, RefreshCw, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !email.trim() || !password || !passwordConfirm) return;

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        password_confirm: passwordConfirm
      });
      navigate(next);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto my-12 px-4 sm:px-6 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-[#E9E2E5] shadow-premium overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
        
        {/* LEFT COLUMN: Split Brand Message Hero */}
        <div className="md:col-span-6 bg-gradient-to-br from-[#F7E8EE] via-[#F2ECF7] to-[#FAF8F5] p-8 sm:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E9E2E5] relative overflow-hidden">
          
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 border border-[#E9E2E5] text-[#6D214F] text-xs font-bold shadow-xs">
              <span>✦</span> SmartBuy Intelligence
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#29252A] leading-tight">
                Shop smarter.<br />
                <span className="text-[#6D214F]">Choose with confidence.</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#6F6870] leading-relaxed">
                Create an account to save favorite laptops, build wishlist collections, and manage orders.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-8 relative z-10 text-xs text-[#29252A] border-t border-[#E9E2E5]/80">
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="w-4 h-4 text-[#6D214F]" /> Natural Language Requirement Parser
            </div>
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#6D214F]" /> Verified PostgreSQL Database Specs
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Clean Register Form */}
        <div className="md:col-span-6 p-8 sm:p-12 flex flex-col justify-center space-y-6 bg-white">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-[#29252A]">Create Account</h1>
            <p className="text-xs text-[#6F6870]">Join SmartBuy AI for a personalized experience</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-[#F7E8EE] border border-[#A85578]/40 rounded-xl text-xs text-[#6D214F] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#A85578] shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#29252A] uppercase tracking-wider block">Username</label>
              <input
                type="text"
                required
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xs sm:text-sm bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#29252A] uppercase tracking-wider block">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs sm:text-sm bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#29252A] uppercase tracking-wider block">Password</label>
              <input
                type="password"
                required
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs sm:text-sm bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A] transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#29252A] uppercase tracking-wider block">Confirm Password</label>
              <input
                type="password"
                required
                placeholder="Re-enter your password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full text-xs sm:text-sm bg-[#FAF8F5] border border-[#E9E2E5] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#6D214F] focus:bg-white text-[#29252A] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim() || !email.trim() || !password}
              className="w-full py-3.5 bg-[#6D214F] hover:bg-[#8B315F] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Registering...
                </>
              ) : (
                <>
                  Register Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs text-[#6F6870] pt-2 border-t border-[#E9E2E5]">
            Already have an account?{' '}
            <Link to={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-bold text-[#6D214F] hover:underline">
              Sign in here
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
