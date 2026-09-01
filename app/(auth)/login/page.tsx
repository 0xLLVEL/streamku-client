'use client';

import { useActionState, useState } from 'react';
import { loginAction } from '@/app/actions/auth';
import Link from 'next/link';
import { tmdbImageUrl } from '@/lib/config';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-black">
      {/* Full-screen Background Image with Heavy Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={tmdbImageUrl('/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg', 'w1280') ?? ''} 
          alt="Background" 
          className="w-full h-full object-cover opacity-60 scale-105 blur-[2px]"
        />
        <div className="absolute inset-0 bg-black/60 bg-gradient-to-t from-black via-black/40 to-black/60" />
      </div>

      <div className="relative z-10 w-full max-w-7xl px-8 py-12 flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-24">
        
        {/* Left Side: Marketing Copy */}
        <div className="flex-1 text-left">
          <Link href="/" className="inline-flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/30">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
            <span className="text-4xl font-black text-red-600 tracking-tighter drop-shadow-lg">
              STREAMKU
            </span>
          </Link>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[1.1] drop-shadow-2xl">
            Your next favourite <br/> is waiting.
          </h1>
          <p className="text-xl text-white/70 font-medium max-w-lg mb-10 leading-relaxed drop-shadow-md">
            Thousands of movies and series, all in one place. Jump back into your watchlist or discover something new.
          </p>

          <div className="flex items-center gap-8 text-sm font-bold text-white/50">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Unlimited streaming
            </span>
            <span className="flex items-center gap-2 text-green-500">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              No commitments
            </span>
          </div>
        </div>

        {/* Right Side: Login Card (Liquid Glass) */}
        <div className="w-full max-w-[480px] p-10 liquid-glass rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-white/10">
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-white/50 text-sm font-medium">Your watchlist missed you. Pick up where you left off.</p>
          </div>

          {state?.error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm font-medium backdrop-blur-md">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-white/50 mb-2 uppercase tracking-widest">Email or Username</label>
              <input 
                type="email" 
                name="email" 
                required 
                className="w-full px-5 py-4 bg-black/40 border border-white/5 focus:bg-black/60 focus:border-white/20 backdrop-blur-md outline-none text-white rounded-xl transition-all shadow-inner"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-[11px] font-bold text-white/50 uppercase tracking-widest">Password</label>
                <Link href="#" className="text-xs font-bold text-white/40 hover:text-white transition-colors">Forgot password?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  required 
                  className="w-full px-5 py-4 bg-black/40 border border-white/5 focus:bg-black/60 focus:border-white/20 backdrop-blur-md outline-none text-white rounded-xl transition-all shadow-inner pr-12"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full py-4 mt-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50"
            >
              {isPending ? 'Signing In...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 text-center text-white/40 text-sm font-medium">
            New to Streamku?{' '}
            <Link href="/register" className="text-red-500 hover:text-red-400 font-bold transition-colors">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
