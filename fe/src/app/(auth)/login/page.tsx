"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { useEffect, Suspense } from "react";
import { AlertCircle } from "lucide-react";

// Form schema using Zod
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

// Content component that uses searchParams (needs to be wrapped in Suspense)
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams?.get("redirect") || "/dashboard";

  // Type-safe state selectors
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const resetError = useAuthStore((state) => state.resetError);

  // Handle OAuth errors and redirects
  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      router.push(redirectUrl);
      return;
    }

    // Check for OAuth errors in URL parameters
    const error = searchParams?.get("error");
    const errorMessage = searchParams?.get("message");

    if (error) {
      // Map specific LinkedIn OAuth errors to user-friendly messages
      const errorMessages: Record<string, string> = {
        access_denied: "Login was cancelled. Please try again.",
        invalid_request: "Invalid authentication request. Please try again.",
        unauthorized_client:
          "Authentication not authorized. Please contact support.",
        unsupported_response_type:
          "Unsupported response type. Please contact support.",
        invalid_scope: "Invalid permissions requested. Please contact support.",
        server_error:
          "Server error during authentication. Please try again later.",
        temporarily_unavailable:
          "Authentication service is temporarily unavailable. Please try again later.",
        linkedin_scope_error:
          "LinkedIn permissions issue. Please ensure all requested permissions are approved in the LinkedIn Developer Portal.",
        linkedin_auth_failed:
          "LinkedIn authentication failed. Please try again.",
      };

      // Use the specific error message if available, otherwise use the generic one
      const errorMsg =
        errorMessages[error] ||
        errorMessage ||
        "An error occurred during login. Please try again.";

      // Set the error in the auth store to display it
      useAuthStore.setState({ error: errorMsg });

      // Clean up the URL to prevent showing the error again on refresh
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [isAuthenticated, router, redirectUrl, searchParams]);

  // React Hook Form with Zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Reset any previous errors
    resetError();

    try {
      // Use our centralized auth store login function
      await login(values.email, values.password);

      // If no error was thrown, redirect to the intended URL or dashboard
      router.push(redirectUrl);
    } catch (error) {
      // Error is already handled by the auth store
      console.error("Login failed:", error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to your Marketing AI Dashboard
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md flex items-start gap-3">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Authentication Error</p>
              <p className="text-sm">{error}</p>
              {error.includes("LinkedIn") && (
                <div className="mt-2 text-sm bg-white/50 dark:bg-gray-800/50 p-2 rounded border border-red-100 dark:border-red-900">
                  <p className="font-medium">Need help?</p>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    <li>
                      Ensure you&apos;re using the correct LinkedIn account
                    </li>
                    <li>
                      Check if you&apos;ve granted all required permissions
                    </li>
                    <li>Try again in a few minutes if the issue persists</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      autoComplete="username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel>Password</FormLabel>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>

          {/* Social login buttons have been removed in favor of direct API approach */}
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
