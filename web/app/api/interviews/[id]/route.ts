import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';

function svc() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, { auth: { persistSession: false } });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    
    const supabase = svc();
    
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
    
    const { data, error } = await supabase
      .from('interviews')
      .select('*')
      .eq('user_id', dbUser.id)
      .eq('id', params.id)
      .maybeSingle();
      
    if (error) throw error;
    return NextResponse.json({ interview: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}


