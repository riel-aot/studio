'use client';

import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, LayoutDashboard, Users, FileText, BarChart, Sparkles } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  targetId?: string; // ID of the element to highlight
}

const steps: Step[] = [
  {
    title: "Welcome to Athena",
    description: "Athena is your academic command center. Let's take a quick look at how to manage your classroom efficiently.",
    icon: <Sparkles className="h-8 w-8 text-[#2F5BEA]" />,
  },
  {
    title: "Track Student Pulse",
    description: "These KPI cards give you an instant overview of pending reviews, active drafts, and your weekly progress across all classes.",
    icon: <LayoutDashboard className="h-8 w-8 text-[#2F5BEA]" />,
    targetId: "onboarding-kpis",
  },
  {
    title: "Manage Your Queue",
    description: "The 'To Review' section is your primary workspace. This is where student submissions wait for your feedback and AI assistance.",
    icon: <FileText className="h-8 w-8 text-[#2F5BEA]" />,
    targetId: "onboarding-review-queue",
  },
  {
    title: "Start New Assignments",
    description: "Ready to grade? Use Quick Actions to create new assignments and distribute them to your students instantly.",
    icon: <Sparkles className="h-8 w-8 text-[#2F5BEA]" />,
    targetId: "onboarding-quick-actions",
  },
  {
    title: "The Navigation Hub",
    description: "Use the sidebar to jump between your Student Roster, Assessment History, and detailed Academic Reports.",
    icon: <Users className="h-8 w-8 text-[#2F5BEA]" />,
    targetId: "onboarding-sidebar",
  },
];

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const updateSpotlight = useCallback(() => {
    const targetId = steps[currentStep].targetId;
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        setSpotlightRect(el.getBoundingClientRect());
        return;
      }
    }
    setSpotlightRect(null);
  }, [currentStep]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('athena_onboarding_complete');
    if (process.env.NODE_ENV === 'development' || !hasSeenTour) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        updateSpotlight();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [updateSpotlight]);

  useLayoutEffect(() => {
    if (isVisible) {
      updateSpotlight();
      window.addEventListener('resize', updateSpotlight);
      window.addEventListener('scroll', updateSpotlight);
      return () => {
        window.removeEventListener('resize', updateSpotlight);
        window.removeEventListener('scroll', updateSpotlight);
      };
    }
  }, [isVisible, updateSpotlight]);

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
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
      {/* SVG Mask for Spotlight */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <motion.rect
                initial={false}
                animate={{
                  x: spotlightRect.left - 8,
                  y: spotlightRect.top - 8,
                  width: spotlightRect.width + 16,
                  height: spotlightRect.height + 16,
                  rx: 12,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.5)"
          mask="url(#spotlight-mask)"
          className="backdrop-blur-[2px]"
        />
      </svg>

      {/* Popover Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: spotlightRect ? 0 : 0,
              // If there's a spotlight, we might want to position the card relative to it
              // but for a clean look, staying centered or slightly offset is often better
              // unless we use a strict "floating" logic. 
            }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-[420px] pointer-events-auto p-4"
            style={spotlightRect ? {
              position: 'absolute',
              // Logic to move the card away from the spotlighted area
              top: spotlightRect.top > window.innerHeight / 2 ? 'auto' : 'auto',
              bottom: spotlightRect.top > window.innerHeight / 2 ? window.innerHeight - spotlightRect.top + 20 : 'auto',
              left: '50%',
              transform: 'translateX(-50%)'
            } : {}}
          >
            <Card className="shadow-2xl border-none ring-1 ring-black/5 bg-white">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {steps[currentStep].icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-[#111827]">
                      {steps[currentStep].title}
                    </CardTitle>
                    <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.1em] mt-0.5">
                      Step {currentStep + 1} of {steps.length}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={completeTour}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-[#6B7280] leading-relaxed text-sm">
                  {steps[currentStep].description}
                </p>
                
                <div className="flex gap-1.5 mt-6">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-300 ${
                        i === currentStep ? 'w-6 bg-[#2F5BEA]' : 'w-1.5 bg-slate-200'
                      }`} 
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-2">
                <Button variant="ghost" onClick={completeTour} className="text-[#6B7280] text-xs font-semibold">
                  Skip
                </Button>
                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <Button variant="outline" size="sm" onClick={handleBack} className="text-xs font-bold">
                      <ChevronLeft className="mr-1 h-3 w-3" /> Back
                    </Button>
                  )}
                  <Button size="sm" onClick={handleNext} className="bg-[#2F5BEA] hover:bg-[#2447C6] text-xs font-bold px-4">
                    {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
