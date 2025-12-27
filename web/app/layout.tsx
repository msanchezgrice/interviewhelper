import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import Script from 'next/script';
import React from 'react';
import { Fraunces, Manrope } from 'next/font/google';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-display',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

export const metadata = {
  title: 'Idea Feedback',
  description: 'Research interviewees, run smarter calls, and capture insights automatically.',
  icons: {
    icon: '/favicon.svg',
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasClerk = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const wrap = (inner: React.ReactNode) => (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        {inner}
        <Script src="/posthog.js" strategy="afterInteractive" />
      </body>
    </html>
  );
  if (hasClerk) {
    return <ClerkProvider>{wrap(children)}</ClerkProvider>;
  }
  return wrap(children);
}
