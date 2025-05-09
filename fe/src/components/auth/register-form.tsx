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

// Registration form validation schema using zod
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();

  // Initialize form with react-hook-form and zod validation
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Form submission handler
  const onSubmit = async (data: RegisterFormValues) => {
    clearError();
    await registerUser(data.name, data.email, data.password);
    
    // Check if registration was successful by checking the auth store state
    if (useAuthStore.getState().isAuthenticated) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create an account</h1>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your information to create an account
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm mb-4">
          {error}
        </div>
      )}

      <Form form={form} onSubmit={onSubmit}>
        <div className="space-y-4">
          <FormField name="name">
            <FormLabel className="text-foreground">Full Name</FormLabel>
            <FormControl>
              <Input 
                className="bg-background border-input focus:border-primary"
                placeholder="John Doe" 
                {...form.register('name')} 
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage name="name" />
          </FormField>

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
            <FormLabel className="text-foreground">Password</FormLabel>
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

          <FormField name="confirmPassword">
            <FormLabel className="text-foreground">Confirm Password</FormLabel>
            <FormControl>
              <Input 
                className="bg-background border-input focus:border-primary"
                type="password" 
                placeholder="••••••••"
                {...form.register('confirmPassword')} 
                disabled={isLoading}
              />
            </FormControl>
            <FormMessage name="confirmPassword" />
          </FormField>

          <Button 
            type="submit" 
            className="w-full mt-6" 
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>
        </div>
      </Form>

      <div className="text-center text-sm mt-6 text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  );
}
