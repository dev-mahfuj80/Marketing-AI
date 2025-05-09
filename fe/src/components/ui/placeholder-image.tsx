"use client";

import React from 'react';

interface PlaceholderImageProps {
  text: string;
  width: number;
  height: number;
  className?: string;
}

export function PlaceholderImage({ text, width, height, className = '' }: PlaceholderImageProps) {
  return (
    <div 
      className={`placeholder-image ${className}`}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
      }}
    >
      {text}
    </div>
  );
}
