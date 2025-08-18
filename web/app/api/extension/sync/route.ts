import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// This endpoint allows the extension to sync interview data
export async function POST(request: NextRequest) {
  try {
    // Get the authorization token from headers
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authorization.replace('Bearer ', '');
    
    // Decode and validate the token
    // In production, you'd validate this properly
    let tokenData;
    try {
      tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Get the interview data from the request
    const data = await request.json();
    
    // Here you would save the interview data to Supabase
    // For now, we'll just acknowledge receipt
    console.log('Received interview data from extension:', {
      userId: tokenData.userId,
      interview: data
    });
    
    // If Supabase is configured, save the data
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // TODO: Save to Supabase
      // const supabase = createClient(...)
      // await supabase.from('interviews').insert(...)
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Interview data received',
      interviewId: `interview_${Date.now()}`
    });
  } catch (error) {
    console.error('Error syncing extension data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// This endpoint allows the extension to fetch user's interviews
export async function GET(request: NextRequest) {
  try {
    // Get the authorization token from headers
    const headersList = headers();
    const authorization = headersList.get('authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authorization.replace('Bearer ', '');
    
    // Decode and validate the token
    let tokenData;
    try {
      tokenData = JSON.parse(Buffer.from(token, 'base64').toString());
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    // Here you would fetch the user's interviews from Supabase
    // For now, return empty array
    const interviews: any[] = [];
    
    return NextResponse.json({ 
      success: true,
      interviews: interviews
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}