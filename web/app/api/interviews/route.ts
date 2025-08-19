import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';

// Check if Supabase is configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase not configured - database operations will not work');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ interviews: [] });
  }

  // Get or create user in Supabase
  let { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', user.id)
    .single();

  // If user doesn't exist, create them
  if (!dbUser) {
    const email = user.emailAddresses?.[0]?.emailAddress || `${user.id}@placeholder.com`;
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || null;
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        clerk_user_id: user.id,
        email: email,
        name: name,
        avatar_url: user.imageUrl || null
      })
      .select('id')
      .single();
    
    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
    
    dbUser = newUser;
  }

  // Get interviews
  const { data: interviews, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', dbUser.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ interviews: interviews || [] });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const body = await request.json();

  // Get or create user in Supabase
  let { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', user.id)
    .single();

  // If user doesn't exist, create them
  if (!dbUser) {
    const email = user.emailAddresses?.[0]?.emailAddress || `${user.id}@placeholder.com`;
    const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || null;
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        clerk_user_id: user.id,
        email: email,
        name: name,
        avatar_url: user.imageUrl || null
      })
      .select('id')
      .single();
    
    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
    
    dbUser = newUser;
  }

  // Create interview
  const { data: interview, error } = await supabase
    .from('interviews')
    .insert({
      user_id: dbUser.id,
      ...body
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ interview });
}


