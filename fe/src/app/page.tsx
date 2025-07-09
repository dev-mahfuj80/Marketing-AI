"use client";

import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { EnhancedNavbar } from "@/components/home-page/enhanced-navbar";
import {
  CtaSection,
  FeaturesSection,
  HeroSection,
  PricingSection,
  SiteFooter,
} from "@/components/home-page/home-page";

// Default Export function
export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}

// Component that uses search params wrapped in Suspense
function HomeContent() {
  return (
    <main className="flex min-h-screen flex-col">
      <EnhancedNavbar />
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
      <PricingSection />
      <SiteFooter />
    </main>
  );
}
