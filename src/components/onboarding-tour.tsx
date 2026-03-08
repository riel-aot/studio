'use client';

import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, LayoutDashboard, Users, FileText, Sparkles, PlusCircle, BarChart3 } from 'lucide-react';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  targetId?: string;
}

const TOUR_CONFIG: Record<string, Step[]> = {
  '/teacher/dashboard': [
    {
      title: "Welcome to Athena",
      description: "Your academic command center. Let's briefly walk through your new workflow.",
      icon: <Sparkles className="h-6 w-6 text-[#2F5BEA]" />,
    },
    {
      title: "The Athena Pulse",
      description: "Monitor real-time progress and pending reviews across all your classes instantly.",
      icon: <LayoutDashboard className="h-6 w-6 text-[#2F5BEA]" />,
      targetId: "onboarding-kpis",
    },
    {
      title: "Action Queue",
      description: "Your high-priority list. Review submissions and provide AI-assisted feedback here.",
      icon: <FileText className="h-6 w-6 text-[#2F5BEA]" />,
      targetId: "onboarding-review-queue",
    },
    {
      title: "Quick Actions",
      description: "Ready to grade? Launch new assignments and distribute them to students in seconds.",
      icon: <Sparkles className="h-6 w-6 text-[#2F5BEA]" />,
      targetId: "onboarding-quick-actions",
    },
    {
      title: "Navigation Hub",
      description: "Effortless access to your student roster, academic reports, and system settings.",
      icon: <Users className="h-6 w-6 text-[#2F5BEA]" />,
      targetId: "onboarding-sidebar",
    },
  ],
  '/teacher/students': [
    {
      title: "Student Roster",
      description: "Manage your entire class list here. Click any student to view their individual progress.",
      icon: <Users className="h-6 w-6 text-[#2F5BEA]" />,
      targetId: "onboarding-student-list",
    },
    {
      title: "Enrollment",
      description: "Add new students manually or use the import tool to sync your entire classroom at once.",
      icon: <PlusCircle className="h-6 w-6 text-[#2F5BEA]" />,
      targetId: "onboarding-add-student",
    }
  ],
  '/teacher/assessments': [
    {
      title: "Assignments Inbox",
      description: "Track all active and past assignments. Filter by status to see what needs your attention.",
      icon: <FileText className="h-6 w-6 text-[#2F5BEA]" />,
      targetId: "onboarding-assessment-list",
    },
    {
      title: "New Assignment",
      description: "Create a new learning objective or test. You can assign it to specific students or the whole class.",
      icon: <PlusCircle className="h-6 w-6 text-[#2F5BEA]" />,
      targetId: "onboarding-new-assessment",
    }
  ],
  '/teacher/reports': [
    {
      title: "Academic Reports",
      description: "Generate comprehensive progress reports for parents. Athena synthesizes past performance into clear insights.",
      icon: <BarChart3 className="h-6 w-6 text-[#2F5BEA]" />,
      targetId: "onboarding-report-history",
    }
  ]
};

export function OnboardingTour() {
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const steps = useMemo(() => TOUR_CONFIG[pathname] || [], [pathname]);
  const storageKey = `athena_tour_seen_${pathname.replace(/\//g, '_')}`;

  const updateSpotlight = useCallback(() => {
    if (!steps[currentStep]) return;
    const targetId = steps[currentStep].targetId;
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        setSpotlightRect(el.getBoundingClientRect());
        return;
      }
    }
    setSpotlightRect(null);
  }, [currentStep, steps]);

  // Handle initialization separately to prevent reset loops
  useEffect(() => {
    if (steps.length === 0) return;
    
    const hasSeenTour = localStorage.getItem(storageKey);
    // Always show in dev for easy testing
    if (process.env.NODE_ENV === 'development' || !hasSeenTour) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setCurrentStep(0);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pathname, storageKey, steps.length]);

  // Handle spotlight sync whenever step changes
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
  }, [isVisible, currentStep, updateSpotlight]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeTour = () => {
    setIsVisible(false);
    localStorage.setItem(storageKey, 'true');
  };

  const getCardPosition = () => {
    const cardWidth = 360;
    const cardHeight = 240; // Conservative estimate
    const padding = 24;
    const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

    if (!spotlightRect) {
      return { 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        position: 'fixed' as const
      };
    }

    const { top, bottom, left, right, width } = spotlightRect;
    
    let cardLeft = left + width / 2 - cardWidth / 2;
    let cardTop = bottom + padding;

    // Viewport clamping and intelligent flipping
    
    // If spotlight is on the left (e.g. sidebar), place to the right of it
    if (left < 300) {
      cardLeft = right + padding;
      cardTop = top;
    }
    // If spotlight is on the far right, place to the left of it
    else if (right > windowWidth - 300) {
      cardLeft = left - cardWidth - padding;
      cardTop = top;
    }
    // If the spotlight is at the bottom, flip card to top
    else if (cardTop + cardHeight > windowHeight - padding) {
      cardTop = top - cardHeight - padding;
    }

    // Final safety clamping to keep card within viewport
    cardLeft = Math.max(padding, Math.min(cardLeft, windowWidth - cardWidth - padding));
    cardTop = Math.max(padding, Math.min(cardTop, windowHeight - cardHeight - padding));

    return {
      position: 'fixed' as const,
      top: cardTop,
      left: cardLeft,
      transform: 'none',
      zIndex: 110,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    };
  };

  if (!isVisible || steps.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <motion.rect
                initial={false}
                animate={{
                  x: spotlightRect.left - 12,
                  y: spotlightRect.top - 12,
                  width: spotlightRect.width + 24,
                  height: spotlightRect.height + 24,
                  rx: 16,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
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
          fill="rgba(15, 23, 42, 0.6)"
          mask="url(#spotlight-mask)"
          className="backdrop-blur-[3px]"
        />
      </svg>

      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname + currentStep}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 250, damping: 25 }}
            className="w-full max-w-[360px] pointer-events-auto"
            style={getCardPosition()}
          >
            <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-none ring-1 ring-black/5 bg-white overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-4 pb-2 space-y-0 bg-slate-50/50">
                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                  {steps[currentStep].icon}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-[#2F5BEA] uppercase tracking-[0.15em] mb-0.5">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                  <CardTitle className="text-base font-bold text-slate-900 leading-tight">
                    {steps[currentStep].title}
                  </CardTitle>
                </div>
                <button 
                  onClick={completeTour}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors self-start"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-slate-600 text-sm leading-relaxed">
                  {steps[currentStep].description}
                </p>
                
                <div className="flex gap-1 mt-6">
                  {steps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-500 ${
                        i === currentStep ? 'w-8 bg-[#2F5BEA]' : 'w-1.5 bg-slate-200'
                      }`} 
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between pt-2 border-t border-slate-50">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={completeTour} 
                  className="text-slate-400 hover:text-slate-900 text-xs font-semibold px-0 hover:bg-transparent"
                >
                  Skip
                </Button>
                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleBack} 
                      className="h-8 border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                    >
                      <ChevronLeft className="mr-1 h-3 w-3" /> Back
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    onClick={handleNext} 
                    className="h-8 bg-[#2F5BEA] hover:bg-[#2447C6] text-xs font-bold px-4 shadow-md shadow-blue-500/20"
                  >
                    {currentStep === steps.length - 1 ? 'Finish' : 'Continue'}
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
