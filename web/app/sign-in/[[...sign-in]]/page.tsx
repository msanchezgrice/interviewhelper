import { SignIn } from '@clerk/nextjs';

export default function SignInPage({
  searchParams,
}: {
  searchParams: { extension?: string; state?: string };
}) {
  // If signing in from extension, redirect to extension auth success page
  const redirectUrl = searchParams.extension === 'true' 
    ? '/extension-auth-success' 
    : '/dashboard';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div>
        {searchParams.extension === 'true' && (
          <div className="mb-4 text-center">
            <h2 className="text-xl font-semibold mb-2">Connect Idea Feedback Extension</h2>
            <p className="text-gray-600">Sign in to sync your interviews with the web dashboard</p>
          </div>
        )}
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                'bg-indigo-600 hover:bg-indigo-700 text-sm normal-case',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl={redirectUrl}
          forceRedirectUrl={redirectUrl}
        />
      </div>
    </div>
  );
}