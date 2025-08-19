'use client';

import Link from 'next/link';

export default function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="flex gap-4">
        <Link 
          href="https://github.com/msanchezgrice/interviewhelper"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          target="_blank"
        >
          Install Chrome Extension
        </Link>
        <button 
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          onClick={() => window.location.reload()}
        >
          Refresh Interviews
        </button>
      </div>
    </div>
  );
}