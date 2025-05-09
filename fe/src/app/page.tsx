import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex w-full max-w-3xl flex-col items-center justify-center text-center">
        <h1 className="mb-6 text-5xl font-bold tracking-tight">
          Marketing AI Dashboard
        </h1>
        <p className="mb-10 max-w-[42rem] text-lg text-muted-foreground">
          Manage your Facebook and LinkedIn posts in one place. Create, schedule, and track your social media content easily.
        </p>
        
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/register">Register</Link>
          </Button>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 text-left">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-medium">Unified Posts</h3>
            <p className="text-sm text-muted-foreground">
              View all your Facebook and LinkedIn posts in a single dashboard
            </p>
          </div>
          
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-medium">Easy Publishing</h3>
            <p className="text-sm text-muted-foreground">
              Create and publish posts to multiple platforms at once
            </p>
          </div>
          
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 text-lg font-medium">Install as App</h3>
            <p className="text-sm text-muted-foreground">
              Use as a Progressive Web App on your desktop or mobile device
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
