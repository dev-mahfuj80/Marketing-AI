"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CheckCircle2,
  Share2,
  BarChart2,
  Loader2,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore, AuthState } from "@/lib/store/auth-store";
import { useEffect, useState, Suspense } from "react";
import { EnhancedNavbar } from "@/components/enhanced-navbar";
import { SiteFooter } from "@/components/site-footer";

// The main exported component that wraps the content in Suspense
export default function Home() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>}>
      <HomeContent />
    </Suspense>
  );
}

// Component that uses search params wrapped in Suspense
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams?.get('code');
  const state = searchParams?.get('state');
  const error = searchParams?.get('error');
  const errorDescription = searchParams?.get('error_description');
  
  // Use individual selectors to avoid recreating objects on every render
  const isAuthenticated = useAuthStore(
    (state: AuthState) => state.isAuthenticated
  );
  const isLoading = useAuthStore((state: AuthState) => state.isLoading);
  const [isClient, setIsClient] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // Handle LinkedIn OAuth callback
  useEffect(() => {
    // Check for OAuth errors first
    if (error) {
      console.error('LinkedIn OAuth error:', { error, errorDescription });
      
      // Handle specific LinkedIn OAuth errors
      if (error === 'unauthorized_scope_error') {
        router.push('/login?error=linkedin_scope_error&message=' + 
          encodeURIComponent('Required LinkedIn permissions not granted. Please ensure all requested permissions are approved in the LinkedIn Developer Portal.'));
      } else {
        router.push(`/login?error=linkedin_auth_failed&message=${encodeURIComponent(errorDescription || error)}`);
      }
      return;
    }
    
    // Handle successful OAuth callback with code
    if (code && (state === 'login' || state === 'linkedin')) {
      console.log('LinkedIn OAuth callback detected:', { code, state });
      setIsRedirecting(true);
      
      // Forward the auth code to our backend
      const handleLinkedInCallback = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/auth/callback/linkedin?code=${code}&state=${state}`,
            { credentials: 'include' } // Important for cookies
          );
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.success) {
            // If successful login/connection, redirect accordingly
            if (state === 'login') {
              router.push('/dashboard');
            } else {
              router.push('/dashboard/settings?platform=linkedin&status=success');
            }
          } else {
            // If error, redirect to login with error message
            router.push(`/login?error=${encodeURIComponent(data.message || 'LinkedIn authentication failed')}`);
          }
        } catch (error) {
          console.error('LinkedIn callback handling error:', error);
          router.push('/login?error=linkedin_auth_failed&message=' + 
            encodeURIComponent('Failed to process LinkedIn authentication. Please try again.'));
        } finally {
          setIsRedirecting(false);
        }
      };
      
      handleLinkedInCallback();
    }
    
    // Set isClient to true after component mounts
    setIsClient(true);
    console.log("isAuthenticated", isAuthenticated);
  }, [code, state, isAuthenticated, router, error, errorDescription]);

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
      <EnhancedNavbar />

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

      {/* Pricing Section */}
      <section id="pricing" className="py-12 md:py-20 px-4 md:px-6 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-screen-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
              Choose the perfect plan for your social media needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold">Free</h3>
                <p className="text-3xl font-bold mt-2">$0<span className="text-base font-normal text-muted-foreground">/month</span></p>
              </div>
              <p className="text-muted-foreground mb-6">Perfect for personal use and testing the platform</p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>Connect 1 social account</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>Up to 10 posts per month</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>Basic analytics</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-auto">Get Started</Button>
            </div>

            {/* Pro Plan */}
            <div className="bg-primary/5 dark:bg-gray-800 p-6 rounded-xl shadow-md border border-primary/20 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold py-1 px-3 rounded-bl-lg">
                POPULAR
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-bold">Pro</h3>
                <p className="text-3xl font-bold mt-2">$29<span className="text-base font-normal text-muted-foreground">/month</span></p>
              </div>
              <p className="text-muted-foreground mb-6">Ideal for businesses growing their social presence</p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>Connect up to 5 social accounts</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>Unlimited posts</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>Content calendar</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>AI content suggestions</span>
                </li>
              </ul>
              <Button className="w-full mt-auto">Subscribe Now</Button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border flex flex-col">
              <div className="mb-4">
                <h3 className="text-xl font-bold">Enterprise</h3>
                <p className="text-3xl font-bold mt-2">$99<span className="text-base font-normal text-muted-foreground">/month</span></p>
              </div>
              <p className="text-muted-foreground mb-6">For larger teams and enterprises</p>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>Connect unlimited social accounts</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>Unlimited posts</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>Comprehensive analytics and reports</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>Team collaboration tools</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>API access</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span>Dedicated account manager</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full mt-auto">Contact Sales</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-12 md:py-20 px-4 md:px-6">
        <div className="container mx-auto max-w-screen-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
              Don&apos;t just take our word for it - hear from some of our satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                  <span className="font-bold text-primary">SB</span>
                </div>
                <div>
                  <h4 className="font-bold">Sarah Brown</h4>
                  <p className="text-sm text-muted-foreground">Marketing Director</p>
                </div>
              </div>
              <div className="flex text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground">
                &quot;Marketing AI has transformed how we manage our social media. The AI-generated content ideas save us hours each week, and the analytics help us understand what&apos;s working.&quot;</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                  <span className="font-bold text-primary">MJ</span>
                </div>
                <div>
                  <h4 className="font-bold">Michael Johnson</h4>
                  <p className="text-sm text-muted-foreground">Small Business Owner</p>
                </div>
              </div>
              <div className="flex text-amber-400 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground">
                &quot;As a small business owner, I don&apos;t have time to manage multiple social platforms. This tool lets me schedule content for the entire month in just an hour. Absolute game-changer!&quot;</p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                  <span className="font-bold text-primary">AL</span>
                </div>
                <div>
                  <h4 className="font-bold">Amy Lee</h4>
                  <p className="text-sm text-muted-foreground">Social Media Consultant</p>
                </div>
              </div>
              <div className="flex text-amber-400 mb-2">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
                <Star className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                &quot;I manage social media for multiple clients, and this platform helps me keep everything organized. The content generation features are impressive and save me tons of time crafting posts.&quot;</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 md:py-20 px-4 md:px-6 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-screen-xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
              Find answers to common questions about our platform
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* FAQ Item 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-bold mb-2">How does the AI content generation work?</h3>
              <p className="text-muted-foreground">Our AI content generation uses advanced machine learning algorithms trained on successful social media posts. Simply provide a topic or keyword, and our AI will generate engaging content ideas, complete with hashtags and call-to-actions tailored to your audience.</p>
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-bold mb-2">Can I connect multiple social media accounts?</h3>
              <p className="text-muted-foreground">Yes! Depending on your plan, you can connect multiple Facebook, LinkedIn, Twitter, and Instagram accounts. The Pro plan supports up to 5 accounts, while the Enterprise plan allows unlimited connections.</p>
            </div>

            {/* FAQ Item 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-bold mb-2">How far in advance can I schedule posts?</h3>
              <p className="text-muted-foreground">You can schedule posts up to 6 months in advance on all plans. Our calendar interface makes it easy to visualize your content schedule and maintain a consistent posting cadence.</p>
            </div>

            {/* FAQ Item 4 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border">
              <h3 className="text-lg font-bold mb-2">Do you offer a free trial?</h3>
              <p className="text-muted-foreground">Yes, we offer a 14-day free trial of our Pro plan so you can experience all the features before committing. No credit card required to sign up for the trial.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <SiteFooter />
    </main>
  );
}
