import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Custom session handling - this would need to be replaced with your actual authentication solution
type User = {
  id: string;
  linkedinAccessToken?: string;
  linkedinTokenExpiry?: Date;
};

type Session = {
  user?: User;
};

// Environment variables
const BE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// SIMPLIFIED AUTH FOR DEMONSTRATION
// In a production app, this would use your actual auth library and database
const getSession = async (): Promise<Session | null> => {
  // This is a mock implementation
  // In production, you would get the real session
  try {
    // Simulate getting session from cookie or token
    // This is where you would call getServerSession with authOptions
    return {
      user: {
        id: 'mock-user-id',
        // Real implementations would fetch these from database
        linkedinAccessToken: process.env.LINKEDIN_ACCESS_TOKEN,
        linkedinTokenExpiry: new Date(Date.now() + 86400000) // 24 hours from now
      }
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// Mock DB access function to simulate Prisma
const fetchUserTokens = async (userId: string): Promise<User | null> => {
  // In a real implementation, this would be a database query
  // This is a simplified mock
  if (!userId) return null;
  
  return {
    id: userId,
    linkedinAccessToken: process.env.LINKEDIN_ACCESS_TOKEN,
    linkedinTokenExpiry: new Date(Date.now() + 86400000) // 24 hours from now
  };
};

// Error handling helper
const handleApiError = (error: unknown) => {
  console.error('LinkedIn API error:', error);
  
  // Determine error type and return appropriate response
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || 'Unknown error';
    
    // Handle specific error types
    if (status === 401) {
      return { status: 401, message: 'LinkedIn authentication required. Please reconnect your account.' };
    } else if (status === 403) {
      return { status: 403, message: 'Insufficient permissions. Your LinkedIn connection may need additional scopes.' };
    }
    
    return { status, message };
  }
  
  return { status: 500, message: error instanceof Error ? error.message : 'Unknown error occurred' };
};

/**
 * Fetches posts from the backend LinkedIn service
 */
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch LinkedIn token
    const user = await fetchUserTokens(session.user.id);

    if (!user?.linkedinAccessToken) {
      return NextResponse.json(
        { error: 'LinkedIn account not connected', posts: [] },
        { status: 200 } // Return 200 with empty posts instead of error
      );
    }
    
    // Check if token might be expired
    const tokenExpired = user.linkedinTokenExpiry && new Date(user.linkedinTokenExpiry) < new Date();
    if (tokenExpired) {
      // For simplicity, we'll just return an error - we could implement token refresh here
      return NextResponse.json(
        { 
          error: 'LinkedIn token expired', 
          message: 'Your LinkedIn connection has expired. Please reconnect your account.',
          posts: [] 
        },
        { status: 200 } // Return 200 with message instead of error
      );
    }

    // Get posts from LinkedIn API via backend
    const response = await axios.get(`${BE_URL}/api/linkedin/posts`, {
      headers: {
        Authorization: `Bearer ${user.linkedinAccessToken}`
      }
    });

    return NextResponse.json(response.data);
  } catch (error) {
    const { status, message } = handleApiError(error);
    
    // Return the appropriate error response
    return NextResponse.json(
      { 
        error: 'Failed to fetch LinkedIn posts', 
        message,
        posts: [] // Always return posts array (empty) for type consistency
      },
      { status }
    );
  }
}

/**
 * Publishes a new post to LinkedIn
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get post data from request
    const postData = await req.json();
    
    // Validate the post data
    if (!postData.text && !postData.content) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      );
    }

    // Fetch LinkedIn token
    const user = await fetchUserTokens(session.user.id);

    if (!user?.linkedinAccessToken) {
      return NextResponse.json(
        { error: 'LinkedIn account not connected' },
        { status: 400 }
      );
    }
    
    // Check if token might be expired
    const tokenExpired = user.linkedinTokenExpiry && new Date(user.linkedinTokenExpiry) < new Date();
    if (tokenExpired) {
      return NextResponse.json(
        { error: 'LinkedIn token expired. Please reconnect your account.' },
        { status: 401 }
      );
    }

    // Create post via backend
    const response = await axios.post(
      `${BE_URL}/api/linkedin/posts`,
      {
        // Ensure we're using the right format expected by backend
        ...postData,
        text: postData.text || postData.content, // Support both formats
      },
      {
        headers: {
          Authorization: `Bearer ${user.linkedinAccessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Post created successfully',
      postDetails: response.data
    });
  } catch (error) {
    const { status, message } = handleApiError(error);
    
    return NextResponse.json(
      { error: 'Failed to create LinkedIn post', message },
      { status }
    );
  }
}
