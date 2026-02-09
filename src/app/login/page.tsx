'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { UserRole } from '@/lib/auth';
import { Logo } from '@/components/logo';
import { Check } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>('teacher');
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
  };
  
  const featurePoints = [
      "View student progress",
      "Clear teacher feedback",
      "Simple reports for families"
  ]

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <div className="w-full max-w-6xl overflow-hidden rounded-2xl border shadow-sm">
            <div className="grid md:grid-cols-2">
                {/* Left Panel */}
                <div className="hidden bg-muted/30 p-10 md:flex md:flex-col">
                    <Logo />
                    <div className="my-auto">
                        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
                            Student progress. Clear communication.
                        </h1>
                        <ul className="mt-6 space-y-4">
                            {featurePoints.map((point, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Check className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="text-muted-foreground">{point}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                
                {/* Right Panel */}
                <div className="flex items-center justify-center bg-background p-8">
                     <Card className="w-full max-w-sm border-0 shadow-none">
                        <CardHeader className="text-left">
                            <CardTitle className="text-2xl">Welcome back</CardTitle>
                            <CardDescription>
                                Sign in to continue
                            </CardDescription>
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
                                className="flex h-full flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                Teacher
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="parent" id="parent" className="peer sr-only" />
                                <Label
                                htmlFor="parent"
                                className="flex h-full flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                Parent
                                </Label>
                            </div>
                            </RadioGroup>
                        </CardContent>
                        <CardFooter className="flex flex-col items-start gap-4">
                            <Button type="submit" className="w-full">
                            Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
                            </Button>
                             <p className="w-full text-center text-xs text-muted-foreground">
                                Demo login for project preview.
                            </p>
                        </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    </main>
  );
}
