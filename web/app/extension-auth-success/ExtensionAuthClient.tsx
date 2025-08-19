'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExtensionAuthClient({ 
  userInfo, 
  token 
}: { 
  userInfo: { id: string; email: string; name: string };
  token: string;
}) {
  const router = useRouter();
  
  useEffect(() => {
    // Check if we already have token in URL (to prevent infinite redirect)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('token')) {
      // Token is already in URL, don't redirect again
      // Extension should detect this page and extract the token
      return;
    }
    
    // Add token to URL for extension to detect
    const params = new URLSearchParams({
      token: token,
      userId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
    });
    
    // Update URL without causing a page reload
    window.history.replaceState({}, '', `/extension-auth-success?${params.toString()}`);
    
    // After 3 seconds, redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  }, [userInfo, token, router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow">
        <div className="flex items-center justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
        <h1 className="text-xl font-semibold text-center mb-2">Connecting to Extension...</h1>
        <p className="text-gray-600 text-center">
          Please wait while we connect your account to the Chrome extension.
        </p>
        <p className="text-sm text-gray-500 text-center mt-4">
          This window will close automatically.
        </p>
      </div>
    </div>
  );
}