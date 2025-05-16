import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Enable DEBUG to get additional logging
const debug = true;

export async function GET(request: NextRequest) {
  if (debug) {
    console.log('=== LinkedIn Callback Debug ===');
    console.log('Request URL:', request.url);
  }

  try {
    // Extract the code and state from the URL
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (debug) {
      console.log('Callback parameters:', { code, state, error, errorDescription });
    }

    // If there's an error, redirect to the error page
    if (error) {
      const errorMsg = errorDescription || 'Authentication failed';
      return NextResponse.redirect(
        `${url.origin}/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorMsg)}`
      );
    }

    // If there's no code, redirect to the error page
    if (!code) {
      return NextResponse.redirect(
        `${url.origin}/login?error=missing_code&message=Authorization code missing from callback`
      );
    }

    // Call the backend API to exchange the code for an access token
    // Make sure the backend server is running
    if (!process.env.NEXT_PUBLIC_API_URL) {
      throw new Error('Backend API URL not configured');
    }

    const backendUrl = new URL(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/callback/linkedin`
    );
    
    // Add the code and state to the URL
    backendUrl.searchParams.append('code', code);
    if (state) {
      backendUrl.searchParams.append('state', state);
    }

    if (debug) {
      console.log('Calling backend API:', backendUrl.toString());
    }

    try {
      const response = await fetch(backendUrl.toString(), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      
      if (debug) {
        console.log('Backend response status:', response.status);
      }

      let data;
      try {
        // Check if the response is JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
          if (debug) {
            console.log('Backend response data:', data);
          }
        } else {
          // If it's not JSON, try to handle it
          const text = await response.text();
          console.error('Non-JSON response received:', text.substring(0, 500) + '...');
          
          if (response.ok) {
            // If response was successful despite not being JSON, continue with flow
            console.log('Response was successful despite not being JSON, continuing...');
            
            // Success! Redirect based on the state parameter
            if (state && state.startsWith('http')) {
              // If state is a URL, use it directly
              if (debug) {
                console.log(`Authentication successful! Redirecting to state URL: ${state}`);
              }
              return NextResponse.redirect(state);
            } else {
              const redirectUrl = state === 'login' 
                ? '/dashboard' 
                : state === 'settings' 
                  ? '/dashboard/settings' 
                  : '/';

              if (debug) {
                console.log(`Authentication successful! Redirecting to ${redirectUrl}`);
              }
              return NextResponse.redirect(`${url.origin}${redirectUrl}`);
            }
          } else {
            // For failed responses, redirect to login with an error
            return NextResponse.redirect(
              `${url.origin}/login?error=linkedin_auth_failed&message=${encodeURIComponent('Backend returned invalid response format')}`
            );
          }
        }
      } catch (parseError) {
        console.error('Failed to parse backend response:', parseError);
        return NextResponse.redirect(
          `${url.origin}/login?error=linkedin_auth_failed&message=${encodeURIComponent('Failed to parse backend response')}`
        );
      }

      if (!response.ok) {
        const errorMessage = data?.message || 'Authentication failed';
        console.error('LinkedIn callback error from backend:', errorMessage);
        return NextResponse.redirect(
          `${url.origin}/login?error=linkedin_auth_failed&message=${encodeURIComponent(errorMessage)}`
        );
      }

      // Success! Redirect based on the state parameter
      const redirectUrl = state === 'login' 
        ? '/dashboard' 
        : state === 'settings' 
          ? '/dashboard/settings' 
          : '/';

      if (debug) {
        console.log(`Authentication successful! Redirecting to ${redirectUrl}`);
      }

      return NextResponse.redirect(`${url.origin}${redirectUrl}`);
    } catch (fetchError: unknown) {
      const handleError = (error: unknown) => {
        if (error instanceof Error) {
          return error.message;
        } else if (typeof error === 'string') {
          return error;
        } else {
          return 'Unknown error';
        }
      };
      const errorMessage = handleError(fetchError);
      console.error('Error fetching from backend:', errorMessage);
      
      // Create a more user-friendly error message
      let userFriendlyErrorMessage = 'Could not connect to authentication server';
      if (fetchError instanceof Error && 
          fetchError.cause && 
          typeof fetchError.cause === 'object' && 
          'code' in fetchError.cause && 
          (fetchError.cause.code === 'ECONNREFUSED' || fetchError.cause.code === 'ECONNRESET')) {
        userFriendlyErrorMessage = 'Authentication server is not running or unreachable';
      }
      
      return NextResponse.redirect(
        `${url.origin}/login?error=linkedin_auth_failed&message=${encodeURIComponent(userFriendlyErrorMessage)}`
      );
    }
  } catch (error: unknown) {
    const handleAuthError = (error: unknown) => {
      if (error instanceof Error) {
        return error.message;
      } else if (typeof error === 'string') {
        return error;
      } else {
        return 'Unknown error';
      }
    };
    const errorMessage = handleAuthError(error);
    console.error('LinkedIn callback error:', errorMessage);
    
    // Get the URL origin for redirection
    const url = new URL(request.url);
    
    // Redirect to the login page with an error message
    console.log('Redirecting to error page:', `${url.origin}/login?error=linkedin_auth_failed&message=${encodeURIComponent(errorMessage)}`);
    return NextResponse.redirect(
      `${url.origin}/login?error=linkedin_auth_failed&message=${encodeURIComponent(errorMessage)}`
    );
  }
}
