import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';

export const metadata = {
  title: 'Idea Feedback',
  description: 'Research interviewees, run smarter calls, and capture insights automatically.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const wrap = (inner: React.ReactNode) => (
    <html lang="en">
      <body>{inner}</body>
    </html>
  );
  if (hasClerk) {
    return <ClerkProvider>{wrap(children)}</ClerkProvider>;
  }
  return wrap(children);
}


