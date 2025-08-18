import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function LandingPage() {
  return (
    <>
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-bold text-xl text-gray-900">Idea Feedback</div>
            <div className="flex items-center gap-4">
              <SignedOut>
                <Link 
                  href="/sign-in"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Sign in
                </Link>
                <Link 
                  href="https://github.com/msanchezgrice/interviewhelper" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm"
                  target="_blank"
                >
                  Get Extension
                </Link>
              </SignedOut>
              <SignedIn>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
              Run smarter user interviews with an AI copilot
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Designed for solopreneurs: research your interviewees, get real‑time AI suggestions, 
              capture transcripts, auto‑classify notes, and leave with a meeting summary and MVP feature ideas.
            </p>
            <div className="flex gap-4 justify-center">
              <Link 
                href="https://github.com/msanchezgrice/interviewhelper" 
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                target="_blank"
              >
                Add Extension
              </Link>
              <SignedIn>
                <Link 
                  href="/dashboard" 
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Open Dashboard
                </Link>
              </SignedIn>
              <SignedOut>
                <Link 
                  href="/sign-in"
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium inline-block"
                >
                  Sign In to Dashboard
                </Link>
              </SignedOut>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">What you get</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { 
                title: 'Interviewee research', 
                description: 'Pull verified public context to prep quickly.',
                icon: '🔍'
              },
              { 
                title: 'Real‑time AI suggestions', 
                description: 'Follow‑ups, probes, and clarifications that help you go deeper.',
                icon: '💡'
              },
              { 
                title: 'Persistent transcript', 
                description: 'Full history stays visible even during silence.',
                icon: '📝'
              },
              { 
                title: 'AI notes', 
                description: 'Auto‑classified insights, pain points, opportunities in reverse chronological order.',
                icon: '🤖'
              },
              { 
                title: 'Meeting summary', 
                description: 'One‑click recap: highlights, quotes, next steps, and risks.',
                icon: '📊'
              },
              { 
                title: 'MVP feature ideas', 
                description: 'Feature recommendations based on takeaways.',
                icon: '🚀'
              }
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it Works */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How it works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Research',
                description: 'Paste name/LinkedIn and click Research. We compile verifiable context – no fluff.',
                color: 'bg-blue-100 text-blue-700'
              },
              {
                step: '2',
                title: 'Interview',
                description: 'Open the sidebar on your call. Get real‑time suggestions and capture a persistent transcript.',
                color: 'bg-green-100 text-green-700'
              },
              {
                step: '3',
                title: 'Summarize',
                description: 'Stop the interview to auto‑generate a structured summary with quotes and next steps.',
                color: 'bg-purple-100 text-purple-700'
              },
              {
                step: '4',
                title: 'Ship MVP',
                description: 'Use the feature ideas to plan your MVP and follow‑ups.',
                color: 'bg-orange-100 text-orange-700'
              }
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${item.color} font-bold mb-4`}>
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}