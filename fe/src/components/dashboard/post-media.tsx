'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface PostMediaProps {
  mediaUrl: string;
}

export function PostMedia({ mediaUrl }: PostMediaProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null; // Don't render anything if there's an error
  }

  return (
    <div className="mb-4 overflow-hidden rounded-md">
      <div className="relative h-48 w-full">
        <Image 
          src={mediaUrl} 
          alt="Post media" 
          fill
          className="object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
}
