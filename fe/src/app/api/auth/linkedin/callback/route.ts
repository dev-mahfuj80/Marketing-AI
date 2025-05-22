import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code is required" },
      { status: 400 }
    );
  }

  try {
    // Forward the authentication code to your backend API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/linkedin/callback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code, state }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to authenticate with LinkedIn");
    }

    // Return the data from your backend
    return NextResponse.json(data);
  } catch (error) {
    console.error("LinkedIn callback error:", error);
    return NextResponse.json(
      { error: "Failed to process LinkedIn authentication" },
      { status: 500 }
    );
  }
}
