import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import ExtensionAuthClient from './ExtensionAuthClient';

export default async function ExtensionAuthSuccessPage({
  searchParams,
}: {
  searchParams: { extension?: string; state?: string };
}) {
  const user = await currentUser();
  
  // If no user, redirect to sign-in
  if (!user) {
    redirect('/sign-in?extension=true');
  }
  
  // Get user details
  const userInfo = {
    id: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
  };
  
  // Generate a secure token for the extension
  // In production, you'd want to generate a proper JWT token here
  const extensionToken = Buffer.from(JSON.stringify({
    userId: user.id,
    email: userInfo.email,
    timestamp: Date.now(),
  })).toString('base64');
  
  return <ExtensionAuthClient userInfo={userInfo} token={extensionToken} />;
}