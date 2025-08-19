import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    // Check if this is a request from the extension
    const isExtension = request.headers.get('X-Extension-Request') === 'true';
    
    if (!isExtension) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the current user from Clerk
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, saving to local storage only');
      return NextResponse.json({ 
        success: true, 
        message: 'Interview saved locally (database not configured)',
        interview: { ...body, id: Date.now().toString() }
      });
    }
    
    // Get the Supabase user
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();
    
    if (userError || !dbUser) {
      // User doesn't exist in Supabase yet, create them
      const { data: newUser, error: createError } = await supabase.rpc('upsert_user_from_clerk', {
        p_clerk_user_id: user.id,
        p_email: user.emailAddresses[0]?.emailAddress || '',
        p_name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || null,
        p_avatar_url: user.imageUrl || null
      });
      
      if (createError) {
        console.error('Error creating user in Supabase:', createError);
        return NextResponse.json({ 
          error: 'Failed to create user in database',
          details: createError.message 
        }, { status: 500 });
      }
    }
    
    // Get the user ID (either existing or newly created)
    const { data: finalUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', user.id)
      .single();
    
    if (!finalUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Prepare interview data
    const interviewData = {
      user_id: finalUser.id,
      title: body.title || 'Untitled Interview',
      interviewee_name: body.interviewee_name || null,
      interviewee_email: body.interviewee_email || null,
      interviewee_company: body.interviewee_company || null,
      interviewee_role: body.interviewee_role || null,
      transcript: body.transcript || null,
      notes: body.notes || [],
      ai_suggestions: body.ai_suggestions || [],
      summary: body.summary || {},
      started_at: body.started_at || new Date().toISOString(),
      ended_at: body.ended_at || null,
      duration_seconds: body.duration_seconds || null,
      status: body.status || 'draft',
      source: 'extension',
      extension_session_id: body.session_id || null
    };
    
    // Save interview to Supabase
    const { data: interview, error: interviewError } = await supabase
      .from('interviews')
      .insert(interviewData)
      .select()
      .single();
    
    if (interviewError) {
      console.error('Error saving interview:', interviewError);
      return NextResponse.json({ 
        error: 'Failed to save interview',
        details: interviewError.message 
      }, { status: 500 });
    }
    
    // Save interview segments if provided
    if (body.segments && body.segments.length > 0) {
      const segments = body.segments.map((segment: any) => ({
        interview_id: interview.id,
        speaker: segment.speaker || 'unknown',
        text: segment.text,
        timestamp_ms: segment.timestamp_ms || 0,
        ai_notes: segment.ai_notes || [],
        sentiment: segment.sentiment || null,
        topics: segment.topics || []
      }));
      
      const { error: segmentsError } = await supabase
        .from('interview_segments')
        .insert(segments);
      
      if (segmentsError) {
        console.error('Error saving segments:', segmentsError);
        // Don't fail the whole request if segments fail
      }
    }
    
    return NextResponse.json({ 
      success: true,
      interview: interview
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
      }
    });
    
  } catch (error) {
    console.error('Error in save-interview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { 
        status: 500,
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Extension-Request, Content-Type',
      'Access-Control-Allow-Credentials': 'true',
    }
  });
}