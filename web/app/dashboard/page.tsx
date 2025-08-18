import Link from 'next/link';
import { auth } from '@clerk/nextjs';
import InterviewsList from './parts/InterviewsList';

export default async function DashboardPage() {
  const { userId } = auth();
  return (
    <div className="container">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h1>Dashboard</h1>
        <div style={{ display:'flex', gap:12 }}>
          <Link href="/" className="btn btn-secondary">Home</Link>
        </div>
      </div>
      {!userId && (
        <p style={{ color:'#4b5563' }}>Please sign in to view your interviews.</p>
      )}
      {userId && <InterviewsList/>}
    </div>
  );
}


