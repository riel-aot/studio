'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { UserRole } from '@/lib/auth';

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
        className={`${isSmall ? 'text-2xl md:text-3xl' : 'text-7xl md:text-9xl'} font-bold text-slate-900 tracking-tight`}
      >
        Ath
      </motion.span>
      
      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className={`${isSmall ? 'text-xl md:text-2xl' : 'text-6xl md:text-8xl'} text-blue-600/80 font-serif leading-none mx-0.5`}
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
        className={`${isSmall ? 'text-2xl md:text-3xl' : 'text-7xl md:text-9xl'} font-bold text-slate-900 tracking-tight`}
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
    // Reveal central brand first, then transition to login layout
    const timer = setTimeout(() => setStage('login'), 2200);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
  };

  const isIntro = stage === 'intro';

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#FDFBF7]">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            opacity: stage === 'login' ? 0.4 : 0.2,
            scale: stage === 'login' ? 1.2 : 1,
          }}
          className="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full bg-blue-50/30 blur-[100px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl px-6">
        <AnimatePresence mode="wait">
          {isIntro ? (
            <motion.div
              key="intro-container"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              className="flex items-center justify-center"
            >
              <AthΞnaBrand />
            </motion.div>
          ) : (
            <motion.div
              key="login-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid w-full max-w-4xl gap-6 md:grid-cols-2"
            >
              {/* Branding Card */}
              <Card className="flex flex-col justify-center p-8 bg-white/50 backdrop-blur-sm border-slate-100">
                <CardHeader className="px-0">
                  <div className="flex items-center h-12">
                    {/* The brand "lands" here */}
                    <AthΞnaBrand isSmall />
                  </div>
                </CardHeader>
                <CardContent className="px-0">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-800">
                    Student progress. Clear communication.
                  </h1>
                  <p className="mt-2 text-muted-foreground">
                    Built for schools, teachers, and families.
                  </p>
                </CardContent>
              </Card>

              {/* Login Card */}
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
                          className="flex h-full flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary transition-all cursor-pointer text-center"
                        >
                          Teacher
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="parent" id="parent" className="peer sr-only" />
                        <Label
                          htmlFor="parent"
                          className="flex h-full flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary transition-all cursor-pointer text-center"
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Branded accent line */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: stage === 'login' ? 1 : 0 }}
        transition={{ duration: 1.5 }}
        className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-blue-100 to-transparent opacity-30"
      />
    </main>
  );
}
