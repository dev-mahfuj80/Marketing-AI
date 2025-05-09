"use client";

import React from 'react';
import { BarChart, Layout, Calendar, Users, Share2, Sparkles, ChartBar } from 'lucide-react';
import { cn } from "@/lib/utils";

interface DashboardIconProps {
  type: 'analytics' | 'content' | 'scheduling' | 'chart' | 'calendar' | 'users' | 'share' | 'sparkles';
  size?: number;
  className?: string;
}

export function DashboardIcon({ type, size = 24, className = '' }: DashboardIconProps) {
  // We'll let the parent component handle the container in the updated design
  switch (type) {
    case 'analytics':
      return <BarChart size={size} className={cn(className)} />;
    case 'content':
      return <Layout size={size} className={cn(className)} />;
    case 'scheduling':
      return <Calendar size={size} className={cn(className)} />;
    case 'chart':
      return <ChartBar size={size} className={cn(className)} />;
    case 'calendar':
      return <Calendar size={size} className={cn(className)} />;
    case 'users':
      return <Users size={size} className={cn(className)} />;
    case 'share':
      return <Share2 size={size} className={cn(className)} />;
    case 'sparkles':
      return <Sparkles size={size} className={cn(className)} />;
    default:
      return null;
  }
}
