"use client";

import React from 'react';
import { BarChart, Layout, Calendar, Users, Share2, Sparkles, ChartBar } from 'lucide-react';

interface DashboardIconProps {
  type: 'analytics' | 'content' | 'scheduling' | 'chart' | 'calendar' | 'users' | 'share' | 'sparkles';
  size?: number;
  className?: string;
}

export function DashboardIcon({ type, size = 24, className = '' }: DashboardIconProps) {
  // We'll let the parent component handle the container in the updated design
  switch (type) {
    case 'analytics':
      return <BarChart size={size} className={className} />;
    case 'content':
      return <Layout size={size} className={className} />;
    case 'scheduling':
      return <Calendar size={size} className={className} />;
    case 'chart':
      return <ChartBar size={size} className={className} />;
    case 'calendar':
      return <Calendar size={size} className={className} />;
    case 'users':
      return <Users size={size} className={className} />;
    case 'share':
      return <Share2 size={size} className={className} />;
    case 'sparkles':
      return <Sparkles size={size} className={className} />;
    default:
      return null;
  }
}
