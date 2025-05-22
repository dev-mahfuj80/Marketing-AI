"use client";

import { Suspense } from "react";
import { LinkedInCallbackHandler } from "@/components/linkedin/LinkedInCallbackHandler";

function LinkedInCallbackContent() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold text-center mb-6">
        LinkedIn Authorization
      </h1>
      <LinkedInCallbackHandler />
    </div>
  );
}

export default function LinkedInCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-8 text-center">
          Loading LinkedIn authorization...
        </div>
      }
    >
      <LinkedInCallbackContent />
    </Suspense>
  );
}
