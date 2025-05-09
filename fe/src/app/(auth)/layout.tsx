"use client";

import { ReactNode } from 'react';
import { Logo } from '@/components/ui/logo';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-2">
          <Logo size={40} />
        </div>
        <h1 className="text-2xl font-bold">Marketing AI Dashboard</h1>
        <p className="text-sm text-slate-500">Your social media marketing assistant</p>
      </div>

      <div className="w-full max-w-md rounded-lg border bg-white p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
