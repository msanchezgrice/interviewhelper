import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';

function svc() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.SUPABASE_SERVICE_ROLE_KEY as string, { auth: { persistSession: false } });
}

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ items: [] }, { status: 200 });
    const supabase = svc();
    const { data, error } = await supabase.from('interviews').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    return NextResponse.json({ items: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 });
    const body = await req.json();
    const row = {
      id: body.id || undefined,
      user_id: userId,
      title: body.title || null,
      interviewee: body.interviewee || null,
      goal: body.goal || null,
      transcript: body.transcript || [],
      suggestions: body.suggestions || [],
      notes: body.notes || [],
      summary: body.summary || {},
      duration_seconds: body.duration_seconds || null,
      start_time: body.start_time || null,
      end_time: body.end_time || null
    };
    const supabase = svc();
    const { data, error } = await supabase.from('interviews').insert(row).select('*').single();
    if (error) throw error;
    return NextResponse.json({ ok: true, interview: data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'error' }, { status: 500 });
  }
}


