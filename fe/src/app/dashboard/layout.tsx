// This is a client component
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle, MobileThemeToggle } from "@/components/theme-toggle";
import {
  LogOut,
  LayoutDashboard,
  Settings,
  PenSquare,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";
import { AuthGuard } from "@/components/auth-guard";

interface NavItemProps {
  path: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const NavItem = ({ path, label, icon, isActive }: NavItemProps) => (
  <Link href={path} className="w-full">
    <Button
      variant={isActive ? "default" : "ghost"}
      className="w-full justify-start gap-2"
    >
      {icon}
      <span>{label}</span>
    </Button>
  </Link>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Authentication state - use direct selector to avoid recreating objects
  const logout = useAuthStore((state) => state.logout);

  // UI state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Determine active path for navigation highlighting
  const getIsActive = (path: string) => {
    return pathname === path;
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const success = await logout();
      if (success) {
        // Clear any client-side storage
        localStorage.removeItem("auth-storage");
        sessionStorage.clear();
        // Redirect to home page
        router.push("/");
        // Force a full page reload to ensure all state is cleared
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      path: "/dashboard/create-post",
      label: "Create Post",
      icon: <PenSquare size={18} />,
    },
    {
      path: "/dashboard/settings",
      label: "Settings",
      icon: <Settings size={18} />,
    },
  ];

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-64 flex-col border-r bg-card p-4">
          <div className="flex items-center justify-center py-4 mb-8">
            <Link href="/" className="text-xl font-bold">
              Marketing AI
            </Link>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavItem
                key={item.path}
                path={item.path}
                label={item.label}
                icon={item.icon}
                isActive={getIsActive(item.path)}
              />
            ))}
          </nav>

          <div className="mt-auto pt-4 space-y-2">
            {/* Dark mode toggle */}
            <div className="flex items-center justify-between px-3 py-2 rounded-md border border-input">
              <span className="text-sm font-medium">Dark Mode</span>
              <ThemeToggle />
            </div>

            {/* Logout button */}
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut size={18} />
              )}
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </Button>
          </div>
        </div>

        {/* Mobile header and menu */}
        <div className="flex flex-col flex-1">
          <header className="md:hidden flex items-center justify-between border-b p-4">
            <h1 className="text-lg font-bold">Marketing AI</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </header>

          {/* Mobile Sidebar */}
          {isMobileMenuOpen && (
            <div className="md:hidden flex flex-col p-4 border-b">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavItem
                    key={item.path}
                    path={item.path}
                    label={item.label}
                    icon={item.icon}
                    isActive={getIsActive(item.path)}
                  />
                ))}
                {/* Mobile theme toggle */}
                <div className="mt-2">
                  <MobileThemeToggle />
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </Button>
              </nav>
            </div>
          )}

          {/* Main Content */}
          <main className="flex-1 p-4 md:px-8 max-h-screen overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
