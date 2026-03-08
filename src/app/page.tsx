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
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
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
        className={`${isSmall ? 'text-3xl md:text-4xl' : 'text-7xl md:text-9xl'} font-bold text-slate-900 tracking-tight`}
      >
        Ath
      </motion.span>
      
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className={`${isSmall ? 'text-2xl md:text-3xl' : 'text-6xl md:text-8xl'} text-blue-600 font-serif leading-none mx-0.5`}
      >
        Ξ
      </motion.span>

      <motion.span
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { delay: 0.6, duration: 0.8, ease: [0.4, 0, 0.2, 1] }
          }
        }}
        style={{ fontFamily: "'Playfair Display', serif" }}
        className={`${isSmall ? 'text-3xl md:text-4xl' : 'text-7xl md:text-9xl'} font-bold text-slate-900 tracking-tight`}
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
    <main className="min-h-screen w-full flex items-center justify-center bg-[#F8F9FA] p-4 md:p-8">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden grid lg:grid-cols-2 min-h-[750px] border border-slate-100"
            >
              {/* Left Column: Branding & Info */}
              <div className="p-8 md:p-16 flex flex-col justify-between bg-white">
                <div className="space-y-10">
                  <div>
                    <AthΞnaBrand isSmall />
                    <p className="text-slate-400 font-medium mt-1 ml-1 text-sm tracking-wide uppercase">
                      by ClassPulse
                    </p>
                  </div>

                  <div className="space-y-6">
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                      Smarter grading <br />starts here.
                    </h1>
                    <p className="text-lg text-slate-500 max-w-md font-medium leading-relaxed">
                      Athena provides high-end AI assistance to help teachers gain deeper insights from student work while saving hours every week.
                    </p>

                    <ul className="space-y-5 pt-6">
                      {[
                        "Institutional-grade AI review",
                        "Visual student progress insights",
                        "Modern classroom orchestration"
                      ].map((item) => (
                        <li key={item} className="flex items-center gap-4 text-slate-700 font-semibold">
                          <div className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center">
                            <CheckCircle2 className="text-emerald-500 h-4 w-4" />
                          </div>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-12 relative h-72 md:h-96 w-full overflow-hidden rounded-3xl bg-slate-50 border border-slate-100">
                  <Image 
                    src="https://picsum.photos/seed/athena-edu/800/1000" 
                    alt="Classroom background"
                    fill
                    className="object-cover"
                    priority
                    data-ai-hint="modern classroom"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                </div>
              </div>

              {/* Right Column: Login Form */}
              <div className="bg-[#FAFBFC] p-8 md:p-16 flex flex-col items-center justify-center">
                <div className="w-full max-w-[460px]">
                  <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white p-10 md:p-12 rounded-[2.5rem]">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                      <p className="text-slate-400 mt-2 font-medium">Please enter your credentials</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-8">
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
                              className="flex h-full flex-col items-center justify-between rounded-2xl border-2 border-slate-50 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/20 transition-all cursor-pointer text-center font-bold text-slate-500 peer-data-[state=checked]:text-blue-600"
                            >
                              Teacher
                            </Label>
                          </div>
                          <div>
                            <RadioGroupItem value="parent" id="parent" className="peer sr-only" />
                            <Label
                              htmlFor="parent"
                              className="flex h-full flex-col items-center justify-between rounded-2xl border-2 border-slate-50 bg-white p-4 hover:bg-slate-50 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/20 transition-all cursor-pointer text-center font-bold text-slate-500 peer-data-[state=checked]:text-blue-600"
                            >
                              Parent
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-5">
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-700 font-bold ml-1 text-sm">Email Address</Label>
                          <Input id="email" type="email" placeholder="e.reed@school.edu" className="h-14 rounded-2xl bg-slate-50 border-transparent focus:border-blue-600 focus:bg-white transition-all px-5" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center ml-1">
                            <Label htmlFor="password" className="text-slate-700 font-bold text-sm">Password</Label>
                            <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                              Forgot?
                            </button>
                          </div>
                          <Input id="password" type="password" placeholder="••••••••" className="h-14 rounded-2xl bg-slate-50 border-transparent focus:border-blue-600 focus:bg-white transition-all px-5" />
                        </div>
                      </div>

                      <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 h-16 text-lg font-bold rounded-2xl transition-all shadow-xl shadow-slate-200">
                        Sign In
                      </Button>

                      <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-slate-100"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-4 text-slate-300 font-bold tracking-widest">Or</span>
                        </div>
                      </div>

                      <Button variant="outline" type="button" className="w-full h-14 rounded-2xl border-slate-100 hover:bg-slate-50 flex items-center justify-center gap-3 font-bold text-slate-600">
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                      </Button>

                      <div className="text-center space-y-2">
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                          Secured with institutional encryption
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                          <span className="h-1 w-1 bg-emerald-500 rounded-full" /> FERPA compliant
                        </p>
                      </div>
                    </form>
                  </Card>
                </div>

                <footer className="mt-12 text-[11px] text-slate-400 flex gap-6 font-bold uppercase tracking-widest">
                  <span>© 2026 AthΞna</span>
                  <button className="hover:text-slate-600 transition-colors">Privacy</button>
                  <button className="hover:text-slate-600 transition-colors">Terms</button>
                  <button className="hover:text-slate-600 transition-colors">Support</button>
                </footer>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
