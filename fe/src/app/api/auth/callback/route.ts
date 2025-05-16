import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Enable debug logging in development
const debug = process.env.NODE_ENV !== 'production';

export async function GET(request: NextRequest) {
  if (debug) {
    console.log('=== LinkedIn Callback Debug ===');
    console.log('Request URL:', request.url);
  }
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (debug) {
    console.log('Callback parameters:', { code, state, error, errorDescription });
  }

  // Handle OAuth errors
  if (error) {
    if (debug) {
      console.error('OAuth error:', { error, errorDescription });
    }
    return NextResponse.redirect(
      new URL(
        `/login?error=linkedin_auth_failed&message=${encodeURIComponent(
          errorDescription || error
        )}`,
        request.url
      )
    );
  }

  if (!code || !state) {
    if (debug) {
      console.error('Missing required parameters:', { code, state });
    }
    return NextResponse.redirect(
      new URL(
        '/login?error=invalid_request&message=Missing required parameters',
        request.url
      )
    );
  }

  try {
    // Exchange the authorization code for an access token
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/callback/linkedin?code=${code}&state=${state}`;
    
    if (debug) {
      console.log('Calling backend API:', backendUrl);
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (debug) {
      console.log('Backend response status:', response.status);
    }

    let data;
    try {
      data = await response.json();
      if (debug) {
        console.log('Backend response data:', data);
      }
    } catch (parseError) {
      console.error('Failed to parse backend response:', parseError);
      throw new Error('Invalid response from authentication server');
    }

    if (!response.ok) {
      const errorMessage = data?.message || 'Failed to authenticate with LinkedIn';
      if (debug) {
        console.error('Backend authentication failed:', errorMessage);
      }
      throw new Error(errorMessage);
    }

    // Redirect based on the state parameter
    const redirectUrl = state === 'login' ? '/dashboard' : '/dashboard/settings?platform=linkedin&status=success';
    const finalRedirectUrl = new URL(redirectUrl, request.url);
    
    if (debug) {
      console.log('Authentication successful, redirecting to:', finalRedirectUrl.toString());
    }
    
    return NextResponse.redirect(finalRedirectUrl);
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    const errorUrl = new URL(
      `/login?error=linkedin_auth_failed&message=${encodeURIComponent(errorMessage)}`,
      request.url
    );
    
    if (debug) {
      console.log('Redirecting to error page:', errorUrl.toString());
    }
    
    return NextResponse.redirect(errorUrl);
  }
}
