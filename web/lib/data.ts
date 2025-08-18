import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getInterviews() {
  const { userId } = auth();
  if (!userId) return { items: [] };
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('interviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return { items: data || [] };
}


