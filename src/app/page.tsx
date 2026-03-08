'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { UserRole } from '@/lib/auth';

export default function AthenaIntroPage() {
  const [stage, setStage] = useState<'intro' | 'transitioning' | 'login'>('intro');
  const [role, setRole] = useState<UserRole>('teacher');
  const { login } = useAuth();

  useEffect(() => {
    // Stage 1: Reveal central brand (Intro)
    const timer1 = setTimeout(() => setStage('transitioning'), 2500);
    // Stage 2: Move to side and reveal login
    const timer2 = setTimeout(() => setStage('login'), 3200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
  };

  // Animation variants for the "writing" effect
  const wordVariants = {
    hidden: { clipPath: 'inset(0 100% 0 0)' },
    visible: {
      clipPath: 'inset(0 0% 0 0)',
      transition: { duration: 1.5, ease: [0.45, 0.05, 0.55, 0.95] }
    }
  };

  const isIntro = stage === 'intro';
  const isLogin = stage === 'login' || stage === 'transitioning';

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#FDFBF7]">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            opacity: isLogin ? 0.4 : 0.2,
            scale: isLogin ? 1.2 : 1,
          }}
          className="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full bg-blue-50/30 blur-[100px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6">
        <div className="flex flex-col items-center justify-center">
          {/* The "AthΞna" Brand Component that moves */}
          <motion.div
            layout
            transition={{
              layout: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
            }}
            style={{
              position: isIntro ? 'relative' : 'absolute',
              top: isIntro ? 'auto' : '2rem',
              left: isIntro ? 'auto' : '2rem',
              transform: isIntro ? 'none' : 'none',
            }}
            className="flex flex-col items-center md:items-start"
          >
            <div className="flex items-baseline">
              <motion.span
                initial="hidden"
                animate="visible"
                variants={wordVariants}
                style={{ fontFamily: "'Pinyon Script', cursive" }}
                className={`${isIntro ? 'text-7xl md:text-9xl' : 'text-3xl md:text-4xl'} text-slate-900 pr-1 transition-all duration-700`}
              >
                Ath
              </motion.span>
              
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className={`${isIntro ? 'text-6xl md:text-8xl' : 'text-2xl md:text-3xl'} text-blue-600/80 font-serif leading-none transition-all duration-700`}
              >
                Ξ
              </motion.span>

              <motion.span
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { clipPath: 'inset(0 100% 0 0)' },
                  visible: {
                    clipPath: 'inset(0 0% 0 0)',
                    transition: { delay: 1, duration: 1, ease: [0.45, 0.05, 0.55, 0.95] }
                  }
                }}
                style={{ fontFamily: "'Pinyon Script', cursive" }}
                className={`${isIntro ? 'text-7xl md:text-9xl' : 'text-3xl md:text-4xl'} text-slate-900 pl-0.5 transition-all duration-700`}
              >
                na
              </motion.span>
            </div>
          </motion.div>

          {/* Login Content - Fades in after AthΞna moves */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLogin ? 1 : 0, y: isLogin ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full mt-24"
          >
            {isLogin && (
              <div className="grid w-full max-w-4xl gap-6 md:grid-cols-2 mx-auto">
                <Card className="flex flex-col justify-center p-8 bg-white/50 backdrop-blur-sm border-slate-100">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-400 uppercase tracking-widest">Portal</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
                      Student progress. Clear communication.
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                      Built for schools, teachers, and families.
                    </p>
                  </CardContent>
                </Card>

                <Card className="p-2 sm:p-6 shadow-xl shadow-slate-200/50 border-slate-100">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-slate-800">Welcome back</CardTitle>
                    <CardDescription>Sign in to continue</CardDescription>
                  </CardHeader>
                  <form onSubmit={handleLogin}>
                    <CardContent className="grid gap-4">
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
                            className="flex h-full flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary transition-all cursor-pointer"
                          >
                            Teacher
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="parent" id="parent" className="peer sr-only" />
                          <Label
                            htmlFor="parent"
                            className="flex h-full flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary transition-all cursor-pointer"
                          >
                            Parent
                          </Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                      <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 h-12 text-base rounded-full transition-all duration-300">
                        Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        Demo access enabled.
                      </p>
                    </CardFooter>
                  </form>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Branded accent line */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isLogin ? 1 : 0 }}
        transition={{ duration: 1.5 }}
        className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-blue-100 to-transparent opacity-30"
      />
    </main>
  );
}
