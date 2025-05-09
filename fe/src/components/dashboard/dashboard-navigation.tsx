"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, Settings, PlusCircle, LogOut, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';
import { ThemeToggle } from '@/components/custom/theme-toggle';
import { Logo } from '@/components/custom/logo';

/**
 * Dashboard navigation component
 * Includes responsive sidebar with collapsible menu for mobile
 */
export function DashboardNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    // No need to redirect, middleware will handle it
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      name: 'Posts',
      href: '/dashboard/posts',
      icon: MessageSquare,
    },
    {
      name: 'Create Post',
      href: '/dashboard/create-post',
      icon: PlusCircle,
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile navigation overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex h-16 items-center bg-white px-4 shadow-sm lg:hidden">
        <button
          onClick={toggleSidebar}
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="mx-auto">
          <Link href="/dashboard" className="flex items-center">
            <Logo size={24} />
          </Link>
        </div>
      </div>

      {/* Sidebar (mobile + desktop) */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform overflow-y-auto bg-white shadow-lg transition-transform duration-300 lg:translate-x-0 lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between border-b px-6">
          <Link href="/dashboard" className="flex items-center">
            <Logo size={24} />
          </Link>
          <button
            onClick={toggleSidebar}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="border-b px-6 py-4">
          <div className="mb-2 text-sm font-medium text-gray-900">
            {user?.name}
          </div>
          <div className="text-xs text-gray-500">{user?.email}</div>
        </div>

        {/* Navigation links */}
        <nav className="px-4 py-4">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md px-4 py-2 text-sm transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            ))}

            {/* Logout button */}
            <li className="mt-6">
              <button
                onClick={handleLogout}
                className="flex w-full items-center rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Desktop content wrapper - pushes content to the right */}
      <div className="lg:pl-64">
        {/* Desktop top bar */}
        <div className="sticky top-0 z-10 hidden h-16 items-center bg-white shadow-sm lg:flex">
          <div className="flex items-center justify-between flex-1 px-6">
            <div className="text-2xl font-semibold">
              {navigationItems.find((item) => item.href === pathname)?.name || 'Dashboard'}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
