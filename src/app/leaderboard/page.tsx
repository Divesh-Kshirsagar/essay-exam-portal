import { db } from '../../lib/firebase'; // Adjust path as needed
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import LeaderboardList from './LeaderboardList';

// Server Component for initial data (ISR)
export const revalidate = 60; // Revalidate every 60 seconds

async function getInitialScores() {
  // Check if we are running in a browser environment or if firebase is configured for server
  // Assuming standard client SDK usage or firebase-admin if feasible. 
  // With Next.js 14 App Router, it's safer to separate server/client logic.
  // We'll use the 'lib/firebase' which likely exports the client SDK instance.
  // Note: For pure server-side data fetching in App Directory, firebase-admin is often better 
  // but if 'lib/firebase' is client SDK, it works too (next.js polyfills some stuff).
  
  try {
      const q = query(
        collection(db, 'scores'),
        orderBy('total_score', 'desc'),
        limit(50)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          user_id: data.user_id,
          total_score: data.total_score,
          // Serialize Firestore Timestamps to ISO strings or numbers
          updated_at: data.updated_at?.toDate?.().toISOString() || data.updated_at || null,
          created_at: data.created_at?.toDate?.().toISOString() || data.created_at || null,
        };
      });
  } catch (e) {
      console.error("Error fetching scores:", e);
      return [];
  }
}

export default async function LeaderboardPage() {
  const initialScores = await getInitialScores();

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        🏆 Leaderboard
      </h1>
      <LeaderboardList initialScores={initialScores} />
    </div>
  );
}
