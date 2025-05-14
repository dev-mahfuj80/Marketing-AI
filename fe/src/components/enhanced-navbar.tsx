"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useAuthStore, AuthState } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export function EnhancedNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = useAuthStore((state: AuthState) => state.user);
  const isAuthenticated = useAuthStore((state: AuthState) => state.isAuthenticated);
  const logout = useAuthStore((state: AuthState) => state.logout);
  const router = useRouter();
  
  // Handle scroll to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to section smoothly
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false); // Close menu after clicking
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      router.refresh(); // Refresh the page to ensure clean state
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setIsMobileMenuOpen(false); // Close menu after clicking
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">Marketing AI</Link>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                className="w-6 h-6"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                />
              </svg>
            </Button>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button onClick={() => scrollToSection('features')} className="text-muted-foreground hover:text-foreground transition-colors">Features</button>
            <button onClick={() => scrollToSection('pricing')} className="text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
            <button onClick={() => scrollToSection('testimonials')} className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</button>
            <button onClick={() => scrollToSection('faq')} className="text-muted-foreground hover:text-foreground transition-colors">FAQ</button>
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src="/avatar-placeholder.png"
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:flex flex-col">
                  <span className="text-sm font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Link href="/dashboard">
                    <Button variant="ghost" size="sm">Dashboard</Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center gap-1"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Logout</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
        
        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 bg-background border-t">
            <nav className="flex flex-col space-y-4">
              <button onClick={() => scrollToSection('features')} className="text-muted-foreground hover:text-foreground transition-colors">Features</button>
              <button onClick={() => scrollToSection('pricing')} className="text-muted-foreground hover:text-foreground transition-colors">Pricing</button>
              <button onClick={() => scrollToSection('testimonials')} className="text-muted-foreground hover:text-foreground transition-colors">Testimonials</button>
              <button onClick={() => scrollToSection('faq')} className="text-muted-foreground hover:text-foreground transition-colors">FAQ</button>
              <div className="flex flex-col pt-4 border-t space-y-4">
                <div className="flex items-center justify-between">
                  <ThemeToggle />
                  <span className="text-sm text-muted-foreground">Toggle dark mode</span>
                </div>
                
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src="/avatar-placeholder.png"
                          alt={user?.name || "User"}
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link href="/dashboard" className="w-full">
                        <Button variant="outline" className="w-full" size="sm">Dashboard</Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleLogout}
                        className="w-full"
                      >
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/login" className="w-full">
                      <Button variant="outline" className="w-full" size="sm">Login</Button>
                    </Link>
                    <Link href="/register" className="w-full">
                      <Button className="w-full" size="sm">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
