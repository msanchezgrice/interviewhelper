import Link from 'next/link';
import { currentUser } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';

export default async function DashboardPage() {
  const user = await currentUser();
  const userId = user?.id;
  
  // Check if Supabase is configured
  const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!userId ? (
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600">Please sign in to view your interviews.</p>
          </div>
        ) : (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {user?.firstName || 'User'}!</h1>
            
            {hasSupabase ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <p className="text-yellow-700">
                  Note: Database integration is pending. Interview data will be available once Supabase is configured.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <p className="text-blue-700">
                  To enable interview storage, please configure Supabase in your environment variables.
                </p>
              </div>
            )}
            
            <div className="grid gap-6">
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
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Your Interviews</h2>
                <p className="text-gray-600">
                  Start conducting interviews with the Chrome extension to see them here.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


