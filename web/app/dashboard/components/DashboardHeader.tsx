'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export default function DashboardHeader({ userId }: { userId: string | null | undefined }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="font-bold text-xl text-gray-900">Idea Feedback Dashboard</div>
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Home
            </Link>
            {userId && <UserButton afterSignOutUrl="/" />}
          </div>
        </div>
      </div>
    </header>
  );
}