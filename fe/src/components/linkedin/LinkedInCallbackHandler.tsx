"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { linkedinApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

export function LinkedInCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing your LinkedIn authentication...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const error_description = searchParams.get('error_description');

    if (error) {
      setStatus('error');
      setMessage('LinkedIn authentication failed');
      setError(error_description || 'LinkedIn declined the authorization request');
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setMessage('Invalid callback parameters');
      setError('Missing required parameters for LinkedIn authentication');
      return;
    }

    // Process the OAuth callback
    const processCallback = async () => {
      try {
        await linkedinApi.handleCallback(code, state);
        setStatus('success');
        setMessage('LinkedIn account connected successfully!');
        
        // Automatically redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard?linkedin=success');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage('Failed to complete LinkedIn authentication');
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    };

    processCallback();
  }, [searchParams, router]);

  return (
    <Card className="p-6 max-w-md mx-auto my-12">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <RefreshCw className="h-12 w-12 text-blue-600 mx-auto animate-spin" />
            <h2 className="text-xl font-medium mt-4 mb-2">Connecting your LinkedIn Account</h2>
            <p className="text-muted-foreground">Please wait while we complete the authorization process...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <h2 className="text-xl font-medium mt-4 mb-2">Success!</h2>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground mt-4">Redirecting you to the dashboard...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-600 mx-auto" />
            <h2 className="text-xl font-medium mt-4 mb-2">Authentication Failed</h2>
            <p className="text-muted-foreground">{message}</p>
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-md">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="ml-3 text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}
            <div className="mt-6">
              <Button onClick={() => router.push('/dashboard/settings')} className="mr-2">
                Go to Settings
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
