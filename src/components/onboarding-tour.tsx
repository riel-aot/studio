'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, CheckCircle2, Sparkles, LayoutDashboard, FilePlus } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    title: "Welcome to Athena",
    description: "Athena is your academic command center. Let's take a quick look at how to manage your classroom efficiently.",
    icon: <Sparkles className="h-8 w-8 text-[#2F5BEA]" />,
  },
  {
    title: "Track Your Pulse",
    description: "These KPI cards give you an instant overview of pending reviews, active drafts, and your weekly progress.",
    icon: <LayoutDashboard className="h-8 w-8 text-[#2F5BEA]" />,
  },
  {
    title: "Clear Your Queue",
    description: "The 'To Review' section is where you'll find student submissions ready for your expert feedback and AI assistance.",
    icon: <CheckCircle2 className="h-8 w-8 text-[#2F5BEA]" />,
  },
  {
    title: "Start Something New",
    description: "Ready to grade? Use 'Quick Actions' to create new assignments and distribute them to your students instantly.",
    icon: <FilePlus className="h-8 w-8 text-[#2F5BEA]" />,
  },
];

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('athena_onboarding_complete');
    // Always show in development, or if not seen in production
    if (process.env.NODE_ENV === 'development' || !hasSeenTour) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    localStorage.setItem('athena_onboarding_complete', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-[440px]"
        >
          <Card className="shadow-2xl border-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  {steps[currentStep].icon}
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#111827]">
                    {steps[currentStep].title}
                  </CardTitle>
                  <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider mt-0.5">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={completeTour}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-[#6B7280] leading-relaxed">
                {steps[currentStep].description}
              </p>
              
              <div className="flex gap-1.5 mt-6">
                {steps.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? 'w-8 bg-[#2F5BEA]' : 'w-2 bg-slate-200'
                    }`} 
                  />
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between pt-2">
              <Button variant="ghost" onClick={completeTour} className="text-[#6B7280]">
                Skip Tour
              </Button>
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                )}
                <Button onClick={handleNext} className="bg-[#2F5BEA] hover:bg-[#2447C6]">
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
