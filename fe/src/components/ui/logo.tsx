"use client";

import React from 'react';
import { Share2 } from 'lucide-react';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 24, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="bg-primary text-white p-1.5 rounded-md flex items-center justify-center">
        <Share2 size={size} strokeWidth={2} />
      </div>
      <span className="font-bold">Marketing AI</span>
    </div>
  );
}
