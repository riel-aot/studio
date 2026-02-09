'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { UserRole } from '@/lib/auth';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>('teacher');
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would trigger the MS Entra ID OIDC flow.
    // Here, we're using our mock login function.
    login(role);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Select your role to sign in to your dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <p className="text-sm font-medium text-muted-foreground">This is a mock login for demonstration.</p>
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
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Teacher
                </Label>
              </div>
              <div>
                <RadioGroupItem value="parent" id="parent" className="peer sr-only" />
                <Label
                  htmlFor="parent"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  Parent
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <p className="mt-4 text-xs text-muted-foreground">
        In a real application, this page would redirect to Microsoft for authentication.
      </p>
    </main>
  );
}
