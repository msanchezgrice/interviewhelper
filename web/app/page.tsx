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
          <h1 style={{ fontSize: 40, margin: 0, lineHeight: 1.2 }}>Run smarter user interviews with an AI copilot</h1>
          <p style={{ color: '#4b5563', fontSize: 18, marginTop: 12, maxWidth: 720 }}>
            Designed for solopreneurs: research your interviewees, get real‑time AI suggestions, capture transcripts, auto‑classify notes, and leave with a meeting summary and MVP feature ideas.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <a className="btn btn-primary" href="https://github.com/msanchezgrice/interviewhelper" target="_blank">Add Extension</a>
            <Link className="btn btn-secondary" href="/dashboard">Open Dashboard</Link>
          </div>
        </section>

        <section>
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
      </main>
    </>
  );
}


