'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import type { UserRole } from '@/lib/auth';
import Image from 'next/image';

/**
 * Brand component: ATHENA in bold blue sans-serif (Inter).
 */
function AthenaBrand({ isSmall = false, layoutId = "brand" }: { isSmall?: boolean; layoutId?: string }) {
  return (
    <motion.div
      layoutId={layoutId}
      className="flex flex-col"
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isSmall ? 'text-3xl' : 'text-7xl md:text-9xl'} font-black text-[#3b7ddd] tracking-tight leading-none font-sans`}
      >
        ATHENA
      </motion.span>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-slate-400 font-medium mt-1 text-sm font-sans"
      >
        by ClassPulse
      </motion.span>
    </motion.div>
  );
}

export default function AthenaLandingPage() {
  const [stage, setStage] = useState<'intro' | 'login'>('intro');
  const [role] = useState<UserRole>('teacher');
  const { login } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setStage('login'), 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
  };

  const isIntro = stage === 'intro';

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#e9ecef] p-4 md:p-8 font-sans">
      <AnimatePresence mode="wait">
        {isIntro ? (
          <motion.div
            key="intro-container"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="flex items-center justify-center h-screen"
          >
            <AthenaBrand />
          </motion.div>
        ) : (
          <motion.div
            key="login-container"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="bg-white rounded-[2rem] shadow-2xl overflow-hidden grid lg:grid-cols-2 max-w-[1400px] w-full min-h-[750px] border border-slate-100"
          >
            {/* Left Column: Value Proposition */}
            <div className="p-10 md:p-16 flex flex-col justify-between">
              <div className="space-y-8">
                <AthenaBrand isSmall />

                <div className="space-y-4">
                  <h1 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight leading-tight">
                    Smarter grading starts here.
                  </h1>
                  <p className="text-slate-500 max-w-lg text-lg leading-relaxed font-medium">
                    Athena helps teachers grade faster, track student progress, and gain insights from their classroom data.
                  </p>

                  <ul className="space-y-4 pt-4">
                    {[
                      "AI-assisted grading",
                      "Student progress insights",
                      "Simple classroom management"
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-slate-700 text-lg font-medium">
                        <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <Check className="text-emerald-600 h-4 w-4 stroke-[3]" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-12 relative h-72 md:h-96 w-full">
                <Image 
                  src="https://picsum.photos/seed/athena-classroom/1000/800" 
                  alt="Athena Education Illustration"
                  fill
                  className="object-contain"
                  priority
                  data-ai-hint="classroom illustration"
                />
              </div>
            </div>

            {/* Right Column: Login Card Area */}
            <div className="bg-slate-50/50 p-8 md:p-16 flex flex-col items-center justify-center">
              <div className="w-full max-w-[460px] space-y-8">
                <div className="bg-white p-10 rounded-[1.5rem] shadow-xl border border-slate-100/50">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Welcome Back!</h2>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-bold text-sm">Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="Enter your email" 
                          className="h-14 rounded-xl bg-white border-slate-200 focus:border-[#3b7ddd] focus:ring-[#3b7ddd] transition-all px-4 text-base" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-700 font-bold text-sm">Password</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="Enter your password" 
                          className="h-14 rounded-xl bg-white border-slate-200 focus:border-[#3b7ddd] focus:ring-[#3b7ddd] transition-all px-4 text-base" 
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-[#3b7ddd] hover:bg-[#326abf] h-14 text-lg font-bold rounded-xl transition-all shadow-md">
                      Sign In
                    </Button>

                    <div className="text-center">
                      <button type="button" className="text-sm font-semibold text-[#3b7ddd] hover:underline">
                        Forgot password?
                      </button>
                    </div>

                    <div className="relative py-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-100"></span>
                      </div>
                      <div className="relative flex justify-center text-xs">
                        <span className="bg-white px-4 text-slate-400 font-medium uppercase tracking-wider">Or sign in with</span>
                      </div>
                    </div>

                    <Button variant="outline" type="button" className="w-full h-14 rounded-xl border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-3 font-semibold text-slate-600 shadow-sm text-base">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Sign in with Google
                    </Button>

                    <div className="text-center space-y-1">
                      <p className="text-[11px] text-slate-400 font-medium">
                        Your data is protected and securely encrypted.
                      </p>
                    </div>
                  </form>
                </div>

                <footer className="text-center text-xs text-slate-400 font-medium">
                  <span>© 2026 Athena | </span>
                  <button className="hover:text-slate-600 transition-colors">Privacy</button> | 
                  <button className="hover:text-slate-600 transition-colors"> Terms</button> | 
                  <button className="hover:text-slate-600 transition-colors"> Support</button>
                </footer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
