# Database Integration Guide for Idea Feedback

## Overview
This guide explains how to fully integrate Supabase with your Idea Feedback application to enable data persistence, user management, and syncing between the Chrome extension and web dashboard.

## Prerequisites
- Supabase account (free tier is sufficient)
- Clerk account (already configured)
- Access to Vercel environment variables

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Configure:
   - **Project Name**: `idea-feedback` (or your preference)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier to start

## Step 2: Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `SUPABASE_COMPLETE_SCHEMA.sql`
4. Paste and click **Run**
5. You should see "Success. No rows returned"

## Step 3: Get Your API Keys

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **Anon/Public Key**: `eyJ...` (long string)
   - **Service Role Key**: `eyJ...` (different long string - keep secret!)

## Step 4: Configure Environment Variables

### In Vercel Dashboard:

1. Go to your project settings
2. Navigate to **Environment Variables**
3. Add these variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (your service role key - keep secret!)

# Already configured (verify these exist)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

4. Click **Save** and trigger a new deployment

## Step 5: Set Up Clerk → Supabase Sync

### Create a Webhook in Clerk:

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **Webhooks** → **Add Endpoint**
4. Configure:
   - **Endpoint URL**: `https://ideafeedback.co/api/webhooks/clerk`
   - **Events to listen**: 
     - `user.created`
     - `user.updated`
     - `user.deleted`
5. Copy the **Signing Secret**
6. Add to Vercel environment variables:
   ```env
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

## Step 6: Create Webhook Handler

Create `/web/app/api/webhooks/clerk/route.ts`:

```typescript
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET to .env');
  }

  // Get headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', { status: 400 });
  }

  // Handle the event
  const eventType = evt.type;
  
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    const email = email_addresses[0]?.email_address;
    const name = `${first_name || ''} ${last_name || ''}`.trim();
    
    // Upsert user in Supabase
    const { error } = await supabase.rpc('upsert_user_from_clerk', {
      p_clerk_user_id: id,
      p_email: email,
      p_name: name || null,
      p_avatar_url: image_url || null
    });
    
    if (error) {
      console.error('Error syncing user to Supabase:', error);
      return new Response('Database error', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
```

## Step 7: Update API Routes to Use Supabase

Update `/web/app/api/interviews/route.ts` to actually use Supabase:

```typescript
import { createClient } from '@supabase/supabase-js';
import { currentUser } from '@clerk/nextjs/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user from Supabase
  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', user.id)
    .single();

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

  return NextResponse.json({ interviews });
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Get user from Supabase
  const { data: dbUser } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', user.id)
    .single();

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
```

## Step 8: Test the Integration

1. **Test User Sync**:
   - Sign up for a new account on ideafeedback.co
   - Check Supabase dashboard → Table Editor → users table
   - You should see the new user

2. **Test Interview Creation**:
   - Use the Chrome extension to record an interview
   - Check Supabase dashboard → interviews table
   - The interview should be saved

3. **Test Data Retrieval**:
   - Go to ideafeedback.co/dashboard
   - Your interviews should appear

## Step 9: Enable Realtime (Optional)

For real-time updates between extension and dashboard:

1. In Supabase Dashboard, go to **Database** → **Replication**
2. Enable replication for:
   - `interviews` table
   - `interview_segments` table
3. Update your frontend to use Supabase realtime subscriptions

## Troubleshooting

### Common Issues:

1. **"User not found" errors**:
   - Ensure Clerk webhook is properly configured
   - Check webhook logs in Clerk dashboard
   - Manually sync existing users

2. **RLS (Row Level Security) errors**:
   - Verify auth tokens are being passed correctly
   - Check RLS policies in Supabase

3. **CORS errors from extension**:
   - Add extension origin to Supabase allowed origins
   - Settings → API → CORS Configuration

### Manual User Sync (for existing users):

Run this in Supabase SQL Editor for each existing user:
```sql
SELECT upsert_user_from_clerk(
  'clerk_user_id_here',
  'user@email.com',
  'User Name',
  null
);
```

## Security Checklist

- [ ] Service role key is ONLY in server-side environment variables
- [ ] Never expose service role key to client/browser
- [ ] RLS policies are enabled on all tables
- [ ] Webhook endpoint validates signatures
- [ ] API keys are rotated periodically
- [ ] SSL/TLS enabled on all connections

## Next Steps

Once integrated:
1. Monitor usage in Supabase dashboard
2. Set up database backups (Production)
3. Configure rate limiting if needed
4. Add database indexes for frequently queried fields
5. Set up monitoring/alerts for database errors

## Support

- Supabase Documentation: https://supabase.com/docs
- Clerk Documentation: https://clerk.com/docs
- Your app issues: support@ideafeedback.co