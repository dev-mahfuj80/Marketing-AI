"use client";

import React from 'react';
import { Share2 } from 'lucide-react';
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 24, className = '' }: LogoProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="bg-primary text-primary-foreground p-1.5 rounded-md flex items-center justify-center">
        <Share2 size={size} strokeWidth={2} />
      </div>
    </div>
  );
}
