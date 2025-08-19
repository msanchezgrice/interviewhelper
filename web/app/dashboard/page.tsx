import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardHeader from './components/DashboardHeader';
import InterviewList from './InterviewList';
import QuickActions from './components/QuickActions';

export default async function DashboardPage() {
  const user = await currentUser();
  
  // If not signed in, redirect to sign-in page
  if (!user) {
    redirect('/sign-in?redirect_url=/dashboard');
  }
  
  const userId = user.id;
  
  // Check if Supabase is configured
  const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <DashboardHeader userId={userId} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {user?.firstName || 'User'}!</h1>
          
          {!hasSupabase && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-blue-700">
                To enable interview storage, please configure Supabase in your environment variables.
              </p>
            </div>
          )}
          
          <div className="grid gap-6">
            {/* Quick Actions Component */}
            <QuickActions />
            
            {/* Interview List Component */}
            <InterviewList />
          </div>
        </div>
      </main>
    </div>
  );
}


