import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';

export const metadata = {
  title: 'Interview Helper AI',
  description: 'Research interviewees, run smarter calls, and capture insights automatically.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}


