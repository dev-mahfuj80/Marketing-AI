'use client';

import Image, { ImageProps } from 'next/image';
import React from 'react';

// Client-side image component wrapper that can handle events
export function ClientImage(props: ImageProps) {
  return <Image {...props} />;
}
