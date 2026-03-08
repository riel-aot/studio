'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import type { UserRole } from '@/lib/auth';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

/**
 * Brand component: ATHENA in modern semi-bold sans-serif (Inter).
 */
function AthenaBrand({ isSmall = false }: { isSmall?: boolean }) {
  return (
    <div className="flex flex-col">
      <span
        className={cn(
          isSmall ? 'text-lg' : 'text-3xl md:text-4xl',
          "font-semibold text-[#3b7ddd] tracking-tight leading-none font-sans"
        )}
      >
        ATHENA
      </span>
      <span className="text-slate-400 font-medium mt-1 text-[9px] md:text-[10px] font-sans uppercase tracking-widest">
        by ClassPulse
      </span>
    </div>
  );
}

export default function AthenaLandingPage() {
  const [role, setRole] = useState<UserRole>('teacher');
  const [rotation, setRotation] = useState(0);
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
  };

  const toggleRole = (newRole: UserRole) => {
    if (newRole === role) return;
    
    // Set rotation for the 3D vertical spin effect
    if (newRole === 'parent') {
      setRotation(prev => prev + 360);
    } else {
      setRotation(prev => prev - 360);
    }
    setRole(newRole);
  };

  const heroImage = PlaceHolderImages.find(img => img.id === 'athena-classroom-hero');

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-[#e9ecef] p-4 md:p-8 font-sans overflow-hidden">
      <div
        className="bg-white rounded-[2rem] shadow-2xl overflow-hidden grid lg:grid-cols-2 max-w-[1400px] w-full min-h-[750px] border border-slate-100"
      >
        {/* Left Column: Value Proposition */}
        <div className="pt-10 md:pt-16 px-10 md:px-16 pb-0 flex flex-col justify-between">
          <div className="space-y-8">
            <AthenaBrand />

            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-bold text-slate-800 tracking-tight leading-tight">
                Smarter grading starts here.
              </h1>
              <p className="text-slate-500 max-w-lg text-lg leading-relaxed font-medium">
                Athena helps {role === 'teacher' ? 'teachers' : 'parents'} {role === 'teacher' ? 'grade faster, track student progress,' : 'track their child\'s progress'} and gain insights from classroom data.
              </p>

              <ul className="space-y-4 pt-4">
                {[
                  role === 'teacher' ? "AI-assisted grading" : "Real-time grade updates",
                  role === 'teacher' ? "Student progress insights" : "Performance trends",
                  role === 'teacher' ? "Simple classroom management" : "Direct teacher communication"
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

          {/* Image Container flush with bottom */}
          <div className="relative h-72 md:h-96 w-full mt-auto flex items-end">
            <Image 
              src={heroImage?.imageUrl || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop"} 
              alt={heroImage?.description || "Athena Education"}
              fill
              className="object-contain object-bottom scale-[1.8] origin-bottom"
              priority
              data-ai-hint="classroom data"
            />
          </div>
        </div>

        {/* Right Column: Login Card Area */}
        <div 
          className="bg-slate-50/50 p-8 md:p-16 flex flex-col items-center justify-center relative"
          style={{ perspective: '1200px' }}
        >
          
          {/* Role Switcher Pill */}
          <div className="absolute top-12 flex bg-white p-1 rounded-full shadow-md border border-slate-200 z-10">
            <button
              onClick={() => toggleRole('teacher')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all",
                role === 'teacher' ? "bg-[#3b7ddd] text-white" : "text-slate-500 hover:text-slate-800"
              )}
            >
              Teacher
            </button>
            <button
              onClick={() => toggleRole('parent')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all",
                role === 'parent' ? "bg-[#3b7ddd] text-white" : "text-slate-500 hover:text-slate-800"
              )}
            >
              Parent
            </button>
          </div>

          <motion.div 
            animate={{ rotateY: rotation }}
            transition={{ 
              type: "spring", 
              stiffness: 70, 
              damping: 18,
              mass: 1.2
            }}
            className="w-full max-w-[460px] space-y-8 mt-12"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div className="bg-white p-10 rounded-[1.5rem] shadow-xl border border-slate-100/50" style={{ backfaceVisibility: 'hidden' }}>
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                  Login as {role === 'teacher' ? 'Teacher' : 'Parent'}
                </h2>
                <p className="text-slate-400 text-sm mt-2 font-medium">Welcome back to Athena</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-bold text-sm">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder={role === 'teacher' ? "Teacher email" : "Parent email"}
                      className="h-14 rounded-xl bg-white border-slate-200 focus:border-[#3b7ddd] focus:ring-[#3b7ddd] transition-all px-4 text-base" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-700 font-bold text-sm">Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
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
              </form>
            </div>

            <footer className="text-center text-xs text-slate-400 font-medium">
              <span>© 2026 Athena | </span>
              <button className="hover:text-slate-600 transition-colors">Privacy</button> | 
              <button className="hover:text-slate-600 transition-colors"> Terms</button> | 
              <button className="hover:text-slate-600 transition-colors"> Support</button>
            </footer>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
