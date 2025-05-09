"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Settings, PenSquare, Menu, X } from "lucide-react";

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
      className="w-full justify-start gap-2">
      {icon}
      <span>{label}</span>
    </Button>
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Avoid hydration mismatch by checking if we're on the client
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Determine active path for navigation highlighting
  const getIsActive = (path: string) => {
    if (!isClient) return false;
    return pathname === path;
  };

  const handleLogout = async () => {
    try {
      // Call your logout API here
      // await useAuthStore.getState().logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />
    },
    {
      path: "/dashboard/create-post",
      label: "Create Post",
      icon: <PenSquare size={18} />
    },
    {
      path: "/dashboard/settings",
      label: "Settings",
      icon: <Settings size={18} />
    }
  ];

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r bg-card p-4">
        <div className="flex items-center justify-center py-4 mb-8">
          <h1 className="text-xl font-bold">Marketing AI</h1>
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
        
        <div className="mt-auto pt-4">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
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
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}