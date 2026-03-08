'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function AthΞnaLandingPage() {
  // Animation variants for the "writing" effect
  const wordVariants = {
    hidden: { clipPath: 'inset(0 100% 0 0)' },
    visible: {
      clipPath: 'inset(0 0% 0 0)',
      transition: { duration: 2, ease: [0.45, 0.05, 0.55, 0.95] }
    }
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#FDFBF7]">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.3, 0.2],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-24 -left-24 w-[40rem] h-[40rem] rounded-full bg-blue-50/30 blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.15, 0.25, 0.15],
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-24 -right-24 w-[35rem] h-[35rem] rounded-full bg-amber-50/40 blur-[100px]"
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-4xl px-6 text-center md:text-left md:px-12">
        <div className="flex flex-col gap-10 items-center md:items-start">
          
          <div className="space-y-0.5">
            <div className="flex items-baseline justify-center md:justify-start">
              <motion.span
                initial="hidden"
                animate="visible"
                variants={wordVariants}
                style={{ fontFamily: "'Pinyon Script', cursive" }}
                className="text-7xl md:text-9xl text-slate-900 pr-2"
              >
                Ath
              </motion.span>
              
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  textShadow: [
                    "0 0 0px rgba(59, 130, 246, 0)",
                    "0 0 20px rgba(59, 130, 246, 0.2)",
                    "0 0 0px rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{ 
                  delay: 1.2, 
                  duration: 1.5, 
                  textShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                }}
                className="text-6xl md:text-8xl text-blue-600/80 font-serif leading-none"
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
                    transition: { delay: 1.5, duration: 1.5, ease: [0.45, 0.05, 0.55, 0.95] }
                  }
                }}
                style={{ fontFamily: "'Pinyon Script', cursive" }}
                className="text-7xl md:text-9xl text-slate-900 pl-1"
              >
                na
              </motion.span>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.8, duration: 1.2 }}
              className="text-[10px] md:text-xs uppercase tracking-[0.5em] font-medium text-slate-400 mt-[-10px] md:mt-[-20px] ml-2"
            >
              by ClassPulse
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.2, duration: 1 }}
            className="space-y-10"
          >
            <p className="text-lg md:text-xl text-slate-500 max-w-sm font-light leading-relaxed tracking-wide italic">
              A calmer, smarter way to manage teaching.
            </p>

            <motion.div
              whileHover={{ x: 8 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Button 
                asChild 
                size="lg" 
                className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-7 text-lg rounded-full shadow-2xl shadow-slate-200 transition-all duration-500 group"
              >
                <Link href="/login" className="flex items-center">
                  Enter Portal
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </motion.span>
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Branded accent line */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 3.5, duration: 2, ease: "circOut" }}
        className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-blue-100 to-transparent opacity-30"
      />

      {/* Quiet Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 4, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0"
      >
        <div className="flex gap-10 text-[9px] uppercase tracking-[0.6em] text-slate-400 font-bold">
          <span>Focus</span>
          <span>Efficiency</span>
          <span>Insight</span>
        </div>
      </motion.div>
    </main>
  );
}
