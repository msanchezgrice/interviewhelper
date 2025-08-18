import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

function svc() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, { auth: { persistSession: false } });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    const supabase = svc();
    const { data, error } = await supabase.from('interviews').select('*').eq('user_id', userId).eq('id', params.id).maybeSingle();
    if (error) throw error;
    return NextResponse.json({ interview: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}


