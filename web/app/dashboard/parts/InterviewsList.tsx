import 'server-only';
import { getInterviews } from '../../../lib/data';

export default async function InterviewsList() {
  const { items } = await getInterviews();
  if (!items || items.length === 0) {
    return <div className="card">No interviews yet.</div>;
  }
  return (
    <div style={{ display:'grid', gap:12 }}>
      {items.map((i:any) => (
        <div key={i.id} className="card">
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontWeight:600 }}>{i.interviewee || 'Untitled Interview'}</div>
              <div style={{ color:'#6b7280', fontSize:13 }}>{new Date(i.created_at).toLocaleString()}</div>
            </div>
            <div style={{ color:'#6b7280' }}>{Math.floor((i.duration_seconds||0)/60)}m</div>
          </div>
          <div style={{ marginTop:8, color:'#374151' }}>{(i.summary?.highlights?.[0] || '')}</div>
        </div>
      ))}
    </div>
  );
}


