import { NextResponse } from "next/server";

// Simpler implementation without relying on cookies
export async function GET() {
  try {
    console.log('Frontend: Checking Facebook connection status directly');
    
    // Direct server-to-server request to the Facebook status endpoint
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/facebook/status`;
    console.log(`Fetching from: ${apiUrl}`);
    
    // Make direct fetch without authentication
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store"
    });
    
    console.log(`Facebook status response code: ${response.status}`);
    
    // Simple error handling
    if (!response.ok) {
      throw new Error(`Facebook API returned status ${response.status}`);
    }

    // Parse the response
    const data = await response.json();
    console.log('Facebook connection data:', data);
    
    // Return the processed response
    return NextResponse.json({
      connected: !!data.connected,
      lastSync: data.lastSync || new Date().toISOString(),
      credentialsValid: data.credentialsValid ?? !!data.connected,
      message: data.message || 'Connection status checked successfully'
    });
  } catch (error) {
    console.error("Facebook connection check failed:", error);
    
    // Return a fallback response
    return NextResponse.json({
      connected: false,
      lastSync: null,
      credentialsValid: false,
      message: 'Could not verify Facebook connection',
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
