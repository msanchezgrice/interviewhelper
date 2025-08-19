import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

// This endpoint allows the extension to check if user is authenticated
export async function GET(request: NextRequest) {
  try {
    // Check if this is a request from the extension
    const isExtension = request.headers.get('X-Extension-Request') === 'true';
    
    if (!isExtension) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the current user from Clerk
    const user = await currentUser();
    
    if (user) {
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
        }
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        }
      });
    } else {
      return NextResponse.json({
        authenticated: false,
        user: null
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        }
      });
    }
  } catch (error) {
    console.error('Error checking auth status:', error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Extension-Request, Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    }
  });
}