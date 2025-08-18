'use client';

import { useEffect } from 'react';

export default function ExtensionAuthClient({ 
  userInfo, 
  token 
}: { 
  userInfo: { id: string; email: string; name: string };
  token: string;
}) {
  useEffect(() => {
    // Send the token back to the extension
    const params = new URLSearchParams({
      token: token,
      userId: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
    });
    
    // Redirect with the token in the URL
    // The extension will detect this URL pattern and extract the token
    window.location.href = `/extension-auth-success?${params.toString()}`;
  }, [userInfo, token]);
  
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