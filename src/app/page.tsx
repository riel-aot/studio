'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function AthΞnaLandingPage() {
  return (
    <main className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#FDFBF7]">
      {/* Ambient Background Elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-100/40 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, 60, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-24 -right-24 w-[30rem] h-[30rem] rounded-full bg-amber-50/50 blur-3xl"
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-4xl px-6 text-center md:text-left md:px-12">
        <div className="flex flex-col gap-8 items-center md:items-start">
          
          <div className="space-y-1">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-7xl md:text-8xl font-serif tracking-tight text-slate-900 flex items-baseline justify-center md:justify-start"
            >
              <span>Ath</span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  textShadow: [
                    "0 0 0px rgba(59, 130, 246, 0)",
                    "0 0 15px rgba(59, 130, 246, 0.3)",
                    "0 0 0px rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{ 
                  delay: 0.5, 
                  duration: 2, 
                  textShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
                className="text-blue-600/90 inline-block mx-1"
              >
                Ξ
              </motion.span>
              <span>na</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1 }}
              className="text-sm uppercase tracking-[0.3em] font-medium text-slate-500 ml-1"
            >
              by ClassPulse
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="space-y-8"
          >
            <p className="text-xl md:text-2xl text-slate-600 max-w-md font-light leading-relaxed">
              A calmer, smarter way to manage teaching.
            </p>

            <motion.div
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Button 
                asChild 
                size="lg" 
                className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 text-lg rounded-full shadow-xl shadow-slate-200 transition-all duration-300"
              >
                <Link href="/login">
                  Enter Portal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Decorative footer element */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 2.5, duration: 1.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0"
      >
        <div className="flex gap-8 text-[10px] uppercase tracking-[0.4em] text-slate-400 font-semibold">
          <span>Focus</span>
          <span>Efficiency</span>
          <span>Insight</span>
        </div>
      </motion.div>
    </main>
  );
}