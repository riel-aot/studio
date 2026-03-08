'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CheckCircle2 } from 'lucide-react';
import type { UserRole } from '@/lib/auth';
import Image from 'next/image';

/**
 * Reusable Brand component with a refined serif reveal animation
 */
function AthΞnaBrand({ isSmall = false, layoutId = "brand" }: { isSmall?: boolean; layoutId?: string }) {
  const wordVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
    }
  };

  return (
    <motion.div
      layoutId={layoutId}
      className="flex items-baseline"
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.span
        initial="hidden"
        animate="visible"
        variants={wordVariants}
        style={{ fontFamily: "'Playfair Display', serif" }}
        className={`${isSmall ? 'text-3xl md:text-4xl' : 'text-7xl md:text-9xl'} font-bold text-blue-600 tracking-tight`}
      >
        Ath
      </motion.span>
      
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className={`${isSmall ? 'text-2xl md:text-3xl' : 'text-6xl md:text-8xl'} text-blue-500 font-serif leading-none mx-0.5`}
      >
        Ξ
      </motion.span>

      <motion.span
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, x: 10 },
          visible: {
            opacity: 1,
            x: 0,
            transition: { delay: 0.6, duration: 0.8, ease: [0.4, 0, 0.2, 1] }
          }
        }}
        style={{ fontFamily: "'Playfair Display', serif" }}
        className={`${isSmall ? 'text-3xl md:text-4xl' : 'text-7xl md:text-9xl'} font-bold text-blue-600 tracking-tight`}
      >
        na
      </motion.span>
    </motion.div>
  );
}

export default function AthenaIntroPage() {
  const [stage, setStage] = useState<'intro' | 'login'>('intro');
  const [role, setRole] = useState<UserRole>('teacher');
  const { login } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setStage('login'), 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
  };

  const isIntro = stage === 'intro';

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#F0F2F5] p-4 md:p-8">
      <div className="w-full max-w-6xl">
        <AnimatePresence mode="wait">
          {isIntro ? (
            <motion.div
              key="intro-container"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              className="flex items-center justify-center h-screen"
            >
              <AthΞnaBrand />
            </motion.div>
          ) : (
            <motion.div
              key="login-container"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white rounded-[2rem] shadow-2xl overflow-hidden grid lg:grid-cols-2 min-h-[700px]"
            >
              {/* Left Column: Branding & Info */}
              <div className="p-8 md:p-12 flex flex-col justify-between bg-white">
                <div className="space-y-8">
                  <div>
                    <AthΞnaBrand isSmall />
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                      className="text-slate-500 font-medium mt-1 ml-1"
                    >
                      by ClassPulse
                    </motion.p>
                  </div>

                  <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
                      Smarter grading starts here.
                    </h1>
                    <p className="text-lg text-slate-600 max-w-md">
                      Athena helps teachers grade faster, track student progress, and gain insights from their classroom data.
                    </p>

                    <ul className="space-y-4 pt-4">
                      {[
                        "AI-assisted grading",
                        "Student progress insights",
                        "Simple classroom management"
                      ].map((item, i) => (
                        <motion.li 
                          key={item}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1 + i * 0.1 }}
                          className="flex items-center gap-3 text-slate-700 font-medium"
                        >
                          <CheckCircle2 className="text-emerald-500 h-6 w-6" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-12 relative h-64 md:h-80 w-full overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                  <Image 
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1000" 
                    alt="Classroom technology illustration"
                    fill
                    className="object-cover opacity-80"
                    data-ai-hint="classroom technology"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent" />
                </div>
              </div>

              {/* Right Column: Login Form */}
              <div className="bg-[#F8FAFC] p-8 md:p-12 flex flex-col items-center justify-center relative">
                <Card className="w-full max-w-[440px] border-none shadow-lg bg-white p-8 md:p-10 rounded-3xl">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-slate-900">Welcome Back!</h2>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                      <RadioGroup
                        defaultValue="teacher"
                        className="grid grid-cols-2 gap-4"
                        value={role}
                        onValueChange={(value: UserRole) => setRole(value)}
                      >
                        <div>
                          <RadioGroupItem value="teacher" id="teacher" className="peer sr-only" />
                          <Label
                            htmlFor="teacher"
                            className="flex h-full flex-col items-center justify-between rounded-xl border-2 border-slate-100 bg-white p-3 hover:bg-slate-50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50/30 transition-all cursor-pointer text-center font-semibold text-slate-600 peer-data-[state=checked]:text-blue-600"
                          >
                            Teacher
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="parent" id="parent" className="peer sr-only" />
                          <Label
                            htmlFor="parent"
                            className="flex h-full flex-col items-center justify-between rounded-xl border-2 border-slate-100 bg-white p-3 hover:bg-slate-50 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-50/30 transition-all cursor-pointer text-center font-semibold text-slate-600 peer-data-[state=checked]:text-blue-600"
                          >
                            Parent
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-semibold ml-1">Email</Label>
                        <Input id="email" type="email" placeholder="Enter your email" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-700 font-semibold ml-1">Password</Label>
                        <Input id="password" type="password" placeholder="Enter your password" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all" />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button type="button" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                        Forgot password?
                      </button>
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold rounded-xl transition-all shadow-md shadow-blue-200">
                      Sign In
                    </Button>

                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-slate-400 font-medium">Or sign in with</span>
                      </div>
                    </div>

                    <Button variant="outline" type="button" className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-3 font-semibold text-slate-700">
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Sign in with Google
                    </Button>

                    <div className="text-center space-y-1">
                      <p className="text-[10px] text-slate-400 font-medium">
                        Your data is protected and securely encrypted.
                      </p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        FERPA compliant.
                      </p>
                    </div>
                  </form>
                </Card>

                <footer className="mt-8 text-[11px] text-slate-400 flex gap-4 font-medium">
                  <span>© 2026 Athena</span>
                  <button className="hover:text-slate-600">Privacy</button>
                  <button className="hover:text-slate-600">Terms</button>
                  <button className="hover:text-slate-600">Support</button>
                </footer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
