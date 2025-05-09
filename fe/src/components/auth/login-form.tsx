"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useAuthStore } from '@/lib/store/auth-store';

// Login form validation schema using zod
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: LoginFormValues) => {
    clearError();
    await login(data.email, data.password);
    
    // Check if login was successful by checking the auth store state
    if (useAuthStore.getState().isAuthenticated) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Welcome back</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your credentials to sign in to your account
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4">
          {error}
        </div>
      )}

      <Form form={form} onSubmit={onSubmit}>
        <div className="space-y-4">
          <FormField name="email">
            <FormLabel className="text-foreground">Email</FormLabel>
            <FormControl>
              <Input 
                className="bg-background border-input focus:border-primary"
                type="email" 
                placeholder="name@example.com" 
                {...form.register('email')} 
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage name="email" />
          </FormField>

          <FormField name="password">
            <div className="flex items-center justify-between">
              <FormLabel className="text-foreground">Password</FormLabel>
              <Link href="/forgot-password" className="text-xs text-primary hover:underline transition-colors">
                Forgot password?
              </Link>
            </div>
            <FormControl>
              <Input 
                className="bg-background border-input focus:border-primary"
                type="password" 
                placeholder="••••••••"
                {...form.register('password')} 
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage name="password" />
          </FormField>

          <Button 
            type="submit" 
            className="w-full mt-6" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </div>
      </Form>

      <div className="text-center text-sm mt-6 text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary font-medium hover:underline transition-colors">
          Sign up
        </Link>
      </div>
    </div>
  );
}
