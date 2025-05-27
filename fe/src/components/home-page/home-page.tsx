import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BarChart2,
  CheckCircle2,
  Github,
  Linkedin,
  Share2,
  Star,
  Twitter,
} from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/lib/store/auth-store";

// Scroll to section smoothly
const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

export function HeroSection() {
  const user = useAuthStore((state) => state.user);
  return (
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
              <Button size="lg" variant="outline">
                <Link href={user ? "/dashboard" : "/login"}>
                  {user ? "Dashboard" : "Get Started"}
                </Link>
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
  );
}

export function FeaturesSection() {
  return (
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
              Connect Facebook and LinkedIn accounts and publish content across
              all platforms with a single click.
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
              Generate engaging content with our AI assistant. Perfect captions,
              hashtags, and post ideas in seconds.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
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
  );
}

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="py-12 md:py-20 px-4 md:px-6 bg-gray-50 dark:bg-gray-900"
    >
      <div className="container mx-auto max-w-screen-xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
            Choose the perfect plan for your social media needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold">Free</h3>
              <p className="text-3xl font-bold mt-2">
                $0
                <span className="text-base font-normal text-muted-foreground">
                  /month
                </span>
              </p>
            </div>
            <p className="text-muted-foreground mb-6">
              Perfect for personal use and testing the platform
            </p>
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
            <Button variant="outline" className="w-full mt-auto">
              Get Started
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-primary/5 dark:bg-gray-800 p-6 rounded-xl shadow-md border border-primary/20 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold py-1 px-3 rounded-bl-lg">
              POPULAR
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Pro</h3>
              <p className="text-3xl font-bold mt-2">
                $29
                <span className="text-base font-normal text-muted-foreground">
                  /month
                </span>
              </p>
            </div>
            <p className="text-muted-foreground mb-6">
              Ideal for businesses growing their social presence
            </p>
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
              <p className="text-3xl font-bold mt-2">
                $99
                <span className="text-base font-normal text-muted-foreground">
                  /month
                </span>
              </p>
            </div>
            <p className="text-muted-foreground mb-6">
              For larger teams and enterprises
            </p>
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
            <Button variant="outline" className="w-full mt-auto">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-12 md:py-20 px-4 md:px-6">
      <div className="container mx-auto max-w-screen-xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
            Don&apos;t just take our word for it - hear from some of our
            satisfied customers
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
                <p className="text-sm text-muted-foreground">
                  Marketing Director
                </p>
              </div>
            </div>
            <div className="flex text-amber-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="text-muted-foreground">
              &quot;Marketing AI has transformed how we manage our social media.
              The AI-generated content ideas save us hours each week, and the
              analytics help us understand what&apos;s working.&quot;
            </p>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                <span className="font-bold text-primary">MJ</span>
              </div>
              <div>
                <h4 className="font-bold">Michael Johnson</h4>
                <p className="text-sm text-muted-foreground">
                  Small Business Owner
                </p>
              </div>
            </div>
            <div className="flex text-amber-400 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="text-muted-foreground">
              &quot;As a small business owner, I don&apos;t have time to manage
              multiple social platforms. This tool lets me schedule content for
              the entire month in just an hour. Absolute game-changer!&quot;
            </p>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border">
            <div className="flex items-center mb-4">
              <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mr-4">
                <span className="font-bold text-primary">AL</span>
              </div>
              <div>
                <h4 className="font-bold">Amy Lee</h4>
                <p className="text-sm text-muted-foreground">
                  Social Media Consultant
                </p>
              </div>
            </div>
            <div className="flex text-amber-400 mb-2">
              {[...Array(4)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <Star className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              &quot;I manage social media for multiple clients, and this
              platform helps me keep everything organized. The content
              generation features are impressive and save me tons of time
              crafting posts.&quot;
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-12 px-4 mt-auto">
      <div className="container mx-auto max-w-screen-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Marketing AI</h3>
            <p className="text-muted-foreground mb-4">
              Automate your social media marketing with the power of AI. Save
              time, increase engagement, and grow your online presence.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Github className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </button>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </button>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-8 text-center">
          <p className="text-muted-foreground text-sm">
            &copy; {currentYear} Marketing AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
