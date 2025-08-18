import { withClerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default withClerkMiddleware(() => NextResponse.next());

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
};


