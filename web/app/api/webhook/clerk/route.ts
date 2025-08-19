import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    const email = email_addresses[0]?.email_address;
    if (!email) {
      return new Response('No email found', { status: 400 });
    }

    const name = [first_name, last_name].filter(Boolean).join(' ') || null;

    try {
      // Use the upsert function we created in the database
      const { data, error } = await supabase.rpc('upsert_user_from_clerk', {
        p_clerk_user_id: id,
        p_email: email,
        p_name: name,
        p_avatar_url: image_url || null
      });

      if (error) {
        console.error('Error upserting user:', error);
        return new Response('Database error', { status: 500 });
      }

      console.log(`User ${eventType === 'user.created' ? 'created' : 'updated'} successfully:`, id);
    } catch (error) {
      console.error('Error processing webhook:', error);
      return new Response('Processing error', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}