"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import {
  ArrowRight,
  CheckCircle2,
  Share2,
  BarChart2,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuthStore, AuthState } from "@/lib/store/auth-store";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  // Use individual selectors to avoid recreating objects on every render
  const isAuthenticated = useAuthStore(
    (state: AuthState) => state.isAuthenticated
  );
  const isLoading = useAuthStore((state: AuthState) => state.isLoading);
  // const checkAuthStatus = useAuthStore((state: AuthState) => state.checkAuthStatus);
  const [isClient, setIsClient] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Set isClient to true after component mounts and check auth status
  useEffect(() => {
    setIsClient(true);
    // checkAuthStatus().catch((err) =>
    //   console.error("Failed to check auth status:", err)
    // );
    console.log("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

  const handleGetStarted = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRedirecting(true);

    try {
      // Double-check authentication status before redirecting
      // await checkAuthStatus();

      if (isAuthenticated) {
        console.log("User is authenticated");
        router.push("/dashboard");
      } else {
        console.log("User is not authenticated");
        router.push("/login?redirect=/dashboard");
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      router.push("/login?redirect=/dashboard");
    } finally {
      setIsRedirecting(false);
    }
  };
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />

      {/* Hero Section */}
      <section
        id="hero"
        className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 md:px-6 mt-16"
      >
        <div className="container mx-auto max-w-screen-xl">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Automate Your Social Media Marketing with AI
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                Connect your social media accounts, create engaging content with
                AI, and schedule posts - all from one dashboard.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  size="lg"
                  onClick={isClient ? handleGetStarted : undefined}
                  disabled={!isClient || isRedirecting || isLoading}
                  asChild={false}
                >
                  <div className="flex items-center">
                    {isRedirecting || isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isAuthenticated
                          ? "Going to Dashboard..."
                          : "Redirecting..."}
                      </>
                    ) : (
                      <>
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </div>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild={!isRedirecting && !isLoading}
                  disabled={isRedirecting || isLoading}
                >
                  {isRedirecting || isLoading ? (
                    <div>Please wait...</div>
                  ) : (
                    <Link href="/login">Login to Dashboard</Link>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-2 border shadow-xl">
                <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                  <Image
                    src="/dashboard-preview.png"
                    alt="Marketing AI Dashboard Preview"
                    width={1200}
                    height={600}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      // Fallback to a colored background
                      e.currentTarget.parentElement!.style.backgroundColor =
                        "#1f2937";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-12 md:py-20 px-4 md:px-6 bg-gray-50 dark:bg-gray-900"
      >
        <div className="container mx-auto max-w-screen-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
              Everything you need to manage and automate your social media
              presence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Share2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Multi-Platform Posting</h3>
              <p className="text-muted-foreground">
                Connect Facebook and LinkedIn accounts and publish content
                across all platforms with a single click.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <BarChart2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Performance Analytics</h3>
              <p className="text-muted-foreground">
                Track engagement, reach, and conversions with comprehensive
                analytics dashboards for all your posts.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border flex flex-col items-center text-center">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Content Generation</h3>
              <p className="text-muted-foreground">
                Generate engaging content with our AI assistant. Perfect
                captions, hashtags, and post ideas in seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-12 md:py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-screen-xl">
          <div className="bg-primary/5 border rounded-xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <h2 className="text-3xl font-bold">
                Ready to transform your social media strategy?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of marketers who are saving time and increasing
                engagement with Marketing AI.
              </p>
              <div className="pt-4">
                <Button size="lg" asChild>
                  <Link href="/register">Get Started Today</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
