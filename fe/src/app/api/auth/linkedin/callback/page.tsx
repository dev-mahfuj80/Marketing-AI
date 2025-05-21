"use client";

import { LinkedInCallbackHandler } from "@/components/linkedin/LinkedInCallbackHandler";

export default function LinkedInCallbackPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold text-center mb-6">LinkedIn Authorization</h1>
      <LinkedInCallbackHandler />
    </div>
  );
}
