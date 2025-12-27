import Link from 'next/link';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function LandingPage() {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-black/10 bg-[#f6f3ef]/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl border border-black/10 bg-white/70 flex items-center justify-center text-sm font-semibold">
                IF
              </div>
              <div>
                <div className="font-semibold text-lg text-gray-900">Idea Feedback</div>
                <div className="text-xs uppercase tracking-[0.2em] text-gray-500">Interview Copilot</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <SignedOut>
                <Link
                  href="/sign-in"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                  data-ph-event="signup_click"
                >
                  Sign in
                </Link>
                <Link
                  href="https://github.com/msanchezgrice/interviewhelper"
                  className="px-4 py-2 bg-[#e07a5f] text-white rounded-full hover:bg-[#d86b52] font-medium text-sm shadow-sm"
                  target="_blank"
                  data-ph-event="signup_click"
                >
                  Add Extension
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

      <main className="min-h-screen bg-[#f6f3ef] text-gray-900 relative overflow-hidden">
        <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-[#f2cc8f]/50 blur-3xl floaty"></div>
        <div className="absolute top-24 left-0 h-64 w-64 rounded-full bg-[#e07a5f]/30 blur-3xl"></div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
          <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center">
            <div className="animate-fade-up">
              <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-gray-600">
                Research in real time
              </span>
              <h1 className="text-5xl md:text-6xl font-semibold leading-tight mt-6">
                Run sharper interviews with an AI co-pilot that keeps you on track.
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mt-6">
                Built for solopreneurs and early teams: research interviewees, get real‑time prompts,
                capture transcripts, auto‑classify notes, and walk away with a crisp MVP plan.
              </p>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  href="https://github.com/msanchezgrice/interviewhelper"
                  className="px-6 py-3 bg-[#e07a5f] text-white rounded-full hover:bg-[#d86b52] font-medium shadow-sm"
                  target="_blank"
                  data-ph-event="signup_click"
                >
                  Add Extension
                </Link>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="px-6 py-3 bg-white/70 text-gray-900 rounded-full border border-black/10 hover:bg-white font-medium"
                    data-ph-event="signup_click"
                  >
                    Open Dashboard
                  </Link>
                </SignedIn>
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className="px-6 py-3 bg-white/70 text-gray-900 rounded-full border border-black/10 hover:bg-white font-medium"
                    data-ph-event="signup_click"
                  >
                    Sign In to Dashboard
                  </Link>
                </SignedOut>
              </div>
              <div className="mt-10 grid sm:grid-cols-3 gap-4 text-sm text-gray-700">
                {[
                  { stat: "45%", label: "Less prep time" },
                  { stat: "2x", label: "Deeper follow-ups" },
                  { stat: "1", label: "Unified summary" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-black/10 bg-white/70 p-4">
                    <div className="text-2xl font-semibold text-gray-900">{item.stat}</div>
                    <div className="text-xs uppercase tracking-[0.2em] text-gray-500 mt-1">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-lg animate-fade-up-delay">
              <div className="text-xs uppercase tracking-[0.3em] text-[#e07a5f]">Live during calls</div>
              <h2 className="text-2xl font-semibold mt-4">A calmer interview flow</h2>
              <p className="text-gray-600 mt-3">
                Keep the conversation natural while Idea Feedback listens for gaps, suggests probes, and
                tags themes automatically.
              </p>
              <div className="mt-6 space-y-3">
                {[
                  "Instant context on each interviewee",
                  "Prompted follow‑ups when momentum dips",
                  "Auto‑organized notes and highlights",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-[#f6f3ef] px-4 py-3">
                    <span className="h-2 w-2 rounded-full bg-[#e07a5f]"></span>
                    <span className="text-sm text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-semibold text-gray-900">What you get</h2>
            <span className="text-xs uppercase tracking-[0.35em] text-gray-500">Included</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Interviewee research',
                description: 'Pull verified public context to prep quickly.',
                icon: '🔍',
              },
              {
                title: 'Real‑time prompts',
                description: 'Follow‑ups and probes to keep insight flowing.',
                icon: '💡',
              },
              {
                title: 'Persistent transcript',
                description: 'Full history stays visible even during silence.',
                icon: '📝',
              },
              {
                title: 'AI‑labeled notes',
                description: 'Auto‑classified insights and opportunities.',
                icon: '🤖',
              },
              {
                title: 'Meeting summary',
                description: 'One‑click recap with quotes, risks, and next steps.',
                icon: '📊',
              },
              {
                title: 'MVP feature ideas',
                description: 'Feature recommendations based on learnings.',
                icon: '🚀',
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white/80 rounded-2xl p-6 shadow-sm border border-black/10 hover:shadow-md transition">
                <div className="text-2xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8">How it works</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '1',
                title: 'Research',
                description: 'Paste name/LinkedIn and click Research. We compile verifiable context – no fluff.',
                color: 'bg-[#f2cc8f]/40 text-[#9c6b2f] border-[#f2cc8f]'
              },
              {
                step: '2',
                title: 'Interview',
                description: 'Open the sidebar on your call. Get real‑time suggestions and capture a persistent transcript.',
                color: 'bg-[#81b29a]/30 text-[#2f6f56] border-[#81b29a]'
              },
              {
                step: '3',
                title: 'Summarize',
                description: 'Stop the interview to auto‑generate a structured summary with quotes and next steps.',
                color: 'bg-[#e07a5f]/25 text-[#b3583f] border-[#e07a5f]'
              },
              {
                step: '4',
                title: 'Ship MVP',
                description: 'Use the feature ideas to plan your MVP and follow‑ups.',
                color: 'bg-[#3d405b]/15 text-[#3d405b] border-[#3d405b]'
              }
            ].map((item) => (
              <div key={item.step} className="bg-white/80 rounded-2xl p-6 shadow-sm border border-black/10">
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full border ${item.color} font-bold mb-4`}>
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-black/10 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-gray-600 text-sm">© 2024 Idea Feedback. All rights reserved.</p>
              </div>
              <div className="flex gap-6">
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
                <a
                  href="mailto:support@ideafeedback.co"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Contact
                </a>
                <a
                  href="https://github.com/msanchezgrice/interviewhelper"
                  className="text-sm text-gray-600 hover:text-gray-900"
                  target="_blank"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
