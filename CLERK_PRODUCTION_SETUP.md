# Clerk Production Mode Setup

## Current Status
Your app is currently in Clerk Development mode. To switch to Production:

## Steps to Enable Production Mode

### 1. Go to Clerk Dashboard
Visit [Clerk Dashboard](https://dashboard.clerk.com)

### 2. Navigate to Your Application
Select your "Idea Feedback" application

### 3. Switch to Production

1. Go to **Settings** → **Environment**
2. Click on **"Enable Production"** button
3. You'll be prompted to:
   - Add your production domain(s)
   - Configure security settings

### 4. Add Production Domain

Add your Vercel domain:
- Primary: `ideafeedback.co`
- Also add: `www.ideafeedback.co` (if applicable)

### 5. Get Production API Keys

After enabling production:
1. Go to **API Keys** section
2. Copy the new Production keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 6. Update Vercel Environment Variables

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update these variables with Production values:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
```

### 7. Configure Clerk Production Settings

In Clerk Dashboard, configure:

#### Paths
- Sign-in URL: `/sign-in` (or use modal)
- Sign-up URL: `/sign-up` (or use modal)
- After sign-in URL: `/dashboard`
- After sign-up URL: `/dashboard`

#### Security
- Enable email verification
- Configure session duration
- Set up attack protection

#### Customization
- Upload logo
- Set brand colors to match your app
- Customize email templates

### 8. Deploy Changes

After updating environment variables in Vercel:
1. Trigger a new deployment
2. Your app will now use production Clerk

## Verification Checklist

- [ ] Production mode enabled in Clerk Dashboard
- [ ] Production domain added
- [ ] Production API keys copied
- [ ] Vercel environment variables updated
- [ ] New deployment triggered
- [ ] Sign-in redirects to /dashboard
- [ ] No development warning banner appears

## Important Notes

### Development vs Production Keys
- **Development keys** (start with `pk_test_` and `sk_test_`)
  - Show "Development mode" banner
  - Less strict security
  - For testing only

- **Production keys** (start with `pk_live_` and `sk_live_`)
  - No warning banners
  - Full security features
  - For live users

### Security Best Practices
1. Never commit API keys to git
2. Use environment variables only
3. Rotate keys periodically
4. Enable 2FA on your Clerk account

## Troubleshooting

If sign-in doesn't redirect to dashboard:
1. Check environment variables are set correctly
2. Ensure fallback redirect URLs are configured
3. Clear browser cache and cookies
4. Check Clerk dashboard for any errors

## Support
- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Discord](https://discord.com/invite/b5rXHjAg7A)