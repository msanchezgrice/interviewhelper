import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      <div className="header">
        <div className="header-inner">
          <div className="brand">Interview Helper AI</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/dashboard" className="btn btn-secondary">Open Dashboard</Link>
            <a href="https://github.com/msanchezgrice/interviewhelper" className="btn btn-primary" target="_blank">Get the Extension</a>
          </div>
        </div>
      </div>
      <main className="container">
        <section className="hero">
          <h1 style={{ fontSize: 44, margin: 0, lineHeight: 1.2 }}>Run smarter user interviews with an AI copilot</h1>
          <p style={{ color: '#4b5563', fontSize: 18, marginTop: 12, maxWidth: 720 }}>
            Designed for solopreneurs: research your interviewees, get real‑time AI suggestions, capture transcripts, auto‑classify notes, and leave with a meeting summary and MVP feature ideas.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <a className="btn btn-primary" href="https://github.com/msanchezgrice/interviewhelper" target="_blank">Add Extension</a>
            <Link className="btn btn-secondary" href="/dashboard">Open Dashboard</Link>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: 24, marginBottom: 12 }}>What you get</h2>
          <div className="grid">
            {[
              { t: 'Interviewee research', d: 'Pull verified public context to prep quickly.' },
              { t: 'Real‑time AI suggestions', d: 'Follow‑ups, probes, and clarifications that help you go deeper.' },
              { t: 'Persistent transcript', d: 'Full history stays visible even during silence.' },
              { t: 'AI notes', d: 'Auto‑classified insights, pain points, opportunities in reverse chronological order.' },
              { t: 'Meeting summary', d: 'One‑click recap: highlights, quotes, next steps, and risks.' },
              { t: 'MVP feature ideas', d: 'Feature recommendations based on takeaways.' }
            ].map((f) => (
              <div key={f.t} className="card">
                <h3 style={{ marginTop: 0 }}>{f.t}</h3>
                <p style={{ color: '#4b5563' }}>{f.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 24, marginBottom: 12 }}>How it works</h2>
          <div className="grid">
            {[ 'Research', 'Interview', 'Summarize', 'Ship MVP' ].map((step, i) => (
              <div key={step} className="card">
                <div style={{ fontWeight:600, marginBottom:6 }}>{i+1}. {step}</div>
                <p style={{ color:'#4b5563' }}>
                  {i===0 && 'Paste name/LinkedIn and click Research. We compile verifiable context – no fluff.'}
                  {i===1 && 'Open the sidebar on your call. Get real‑time suggestions and capture a persistent transcript.'}
                  {i===2 && 'Stop the interview to auto‑generate a structured summary with quotes and next steps.'}
                  {i===3 && 'Use the feature ideas to plan your MVP and follow‑ups.'}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}


