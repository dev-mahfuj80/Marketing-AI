"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface PlaceholderImageProps {
  text: string;
  width: number;
  height: number;
  className?: string;
}

export function PlaceholderImage({ text, width, height, className = '' }: PlaceholderImageProps) {
  return (
    <div 
      className={cn("bg-muted text-muted-foreground flex items-center justify-center rounded-lg font-medium", className)}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
      }}
    >
      {text}
    </div>
  );
}
