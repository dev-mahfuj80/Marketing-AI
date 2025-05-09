"use client";

import Link from "next/link";
import { Facebook, Linkedin, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PlaceholderImage } from "@/components/ui/placeholder-image";
import { Logo } from "@/components/ui/logo";
import { DashboardIcon } from "@/components/ui/dashboard-icon";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <div className="flex items-center space-x-2">
              <Logo size={28} />
              <span className="font-bold">Marketing AI</span>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="/" className="text-sm font-medium text-foreground transition-colors hover:text-primary">Home</Link>
              <Link href="/#features" className="text-sm font-medium text-foreground transition-colors hover:text-primary">Features</Link>
              <Link href="/#testimonials" className="text-sm font-medium text-foreground transition-colors hover:text-primary">Testimonials</Link>
              <Link href="/login" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">Login</Link>
              <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                Get Started
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <span className="animate-pulse rounded-full bg-primary/60 mr-1.5 h-1.5 w-1.5"></span>
                New Features Released
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-foreground">
                Simplify Your Social Media Marketing
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Connect, create, and schedule posts to all your social platforms from one intuitive dashboard.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row mt-6">
                <Link href="/register" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  Start For Free
                </Link>
                <Link href="/#features" className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                  Learn More
                </Link>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <Facebook className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <Linkedin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Supports multiple social media platforms</p>
              </div>
            </div>
            <div className="mx-auto max-w-[600px] hidden lg:block">
              <div className="bg-card p-4 rounded-lg shadow-lg border border-border overflow-hidden">
                <PlaceholderImage
                  text="Marketing AI Dashboard"
                  width={600}
                  height={400}
                  className="rounded-md border border-border/50"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30" id="features">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features for Social Media Success</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform provides all the tools you need to manage and grow your social media presence.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3 mt-8">
            {/* Content Management Feature */}
            <div className="grid gap-1 bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <DashboardIcon type="analytics" className="text-blue-600 dark:text-blue-400 h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold">Content Management</h3>
              <p className="text-sm text-muted-foreground">
                Create and manage posts for all your connected social platforms.
              </p>
            </div>
            
            {/* Post Scheduling Feature */}
            <div className="grid gap-1 bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <DashboardIcon type="calendar" className="text-green-600 dark:text-green-400 h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold">Content Scheduling</h3>
              <p className="text-sm text-muted-foreground">
                Plan and schedule your posts for optimal engagement times.
              </p>
            </div>
            
            {/* Analytics Feature */}
            <div className="grid gap-1 bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <DashboardIcon type="chart" className="text-purple-600 dark:text-purple-400 h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold">Performance Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track engagement and measure the success of your social media campaigns.
              </p>
            </div>
            
            {/* AI Content Generation */}
            <div className="grid gap-1 bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="mb-4">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                  <DashboardIcon type="sparkles" className="text-amber-600 dark:text-amber-400 h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold">AI Content Creation</h3>
              <p className="text-sm text-muted-foreground">
                Generate engaging content with our AI-powered writing assistant.
              </p>
            </div>
            
            {/* Audience Insights */}
            <div className="grid gap-1 bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="mb-4">
                <div className="w-12 h-12 bg-sky-100 dark:bg-sky-900/20 rounded-lg flex items-center justify-center">
                  <DashboardIcon type="users" className="text-sky-600 dark:text-sky-400 h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold">Audience Insights</h3>
              <p className="text-sm text-muted-foreground">
                Understand your audience with detailed demographic analytics.
              </p>
            </div>
            
            {/* Multi-platform Management */}
            <div className="grid gap-1 bg-card p-6 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="mb-4">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/20 rounded-lg flex items-center justify-center">
                  <DashboardIcon type="share" className="text-rose-600 dark:text-rose-400 h-6 w-6" />
                </div>
              </div>
              <h3 className="text-lg font-bold">Multi-platform Integration</h3>
              <p className="text-sm text-muted-foreground">
                Connect and manage all your social media accounts in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-tr from-primary/10 via-primary/5 to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-2">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Ready to Transform Your Social Media Strategy?</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed">
                Join thousands of marketers who have simplified their workflow with our platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Link 
                href="/register" 
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                Get Started For Free
              </Link>
              <Link 
                href="/#features" 
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-all hover:bg-accent hover:text-accent-foreground hover:shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
              >
                See All Features
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card text-card-foreground border-t border-border">
        <div className="container px-4 md:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <Logo size={24} />
                <span className="font-bold">Marketing AI</span>
              </div>
              <p className="text-sm text-muted-foreground">Simplify your social media marketing workflow with our powerful tools.</p>
            </div>
            
            <div>
              <h3 className="text-base font-medium mb-3">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/#" className="text-muted-foreground hover:text-primary transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base font-medium mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#" className="text-muted-foreground hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="/#" className="text-muted-foreground hover:text-primary transition-colors">Tutorials</Link></li>
                <li><Link href="/#" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base font-medium mb-3">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#" className="text-muted-foreground hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="/#" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} Marketing AI. All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link href="/#" className="text-muted-foreground hover:text-primary transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60">
                  <Facebook className="h-4 w-4" />
                </div>
              </Link>
              <Link href="/#" className="text-muted-foreground hover:text-primary transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted/60">
                  <Linkedin className="h-4 w-4" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
