import { NextResponse } from "next/server";

// Simpler implementation without relying on cookies
export async function GET() {
  try {
    console.log('Frontend: Checking LinkedIn connection status directly');
    
    // Direct server-to-server request to the LinkedIn status endpoint
    // This endpoint is now public and doesn't require authentication
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/linkedin/status`;
    console.log(`Fetching from: ${apiUrl}`);
    
    // Make direct fetch without authentication - the backend endpoint is now public
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });
    
    console.log(`LinkedIn status response code: ${response.status}`);
    
    // Simple error handling
    if (!response.ok) {
      throw new Error(`LinkedIn API returned status ${response.status}`);
    }

    // Parse the response
    const data = await response.json();
    console.log('LinkedIn connection data:', data);
    
    // Return the direct response from the backend API without modifying it
    // This ensures we get the correct validation status and any error messages
    return NextResponse.json(data);
  } catch (error) {
    console.error("LinkedIn connection check failed:", error);
    
    // Return a fallback response
    return NextResponse.json({
      connected: false,
      lastSync: null,
      credentialsValid: false,
      message: 'Could not verify LinkedIn connection',
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
