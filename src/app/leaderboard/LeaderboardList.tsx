'use client';

import useSWR from 'swr';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { Trophy, Medal } from 'lucide-react';

const fetcher = async () => {
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
      updated_at: data.updated_at?.toDate?.().toISOString() || data.updated_at || null,
      created_at: data.created_at?.toDate?.().toISOString() || data.created_at || null,
    };
  });
};

export default function LeaderboardList({ initialScores }) {
  const { data: scores } = useSWR('leaderboard-scores', fetcher, {
    fallbackData: initialScores,
    refreshInterval: 30000, // Client polling 30s
  });

  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-black/20 text-left">
              <th className="p-4 font-semibold">Rank</th>
              <th className="p-4 font-semibold">Student</th>
              <th className="p-4 font-semibold text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {(scores || []).map((score, index) => (
              <tr 
                key={score.id} 
                className="border-b border-white/5 hover:bg-white/5 transition-colors"
              >
                <td className="p-4 flex items-center gap-3">
                  {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                  {index === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                  {index === 2 && <Medal className="w-5 h-5 text-amber-600" />}
                  <span className={`font-mono ${index < 3 ? 'font-bold' : 'text-gray-400'}`}>
                    #{index + 1}
                  </span>
                </td>
                <td className="p-4 font-medium">{score.name || 'Anonymous'}</td>
                <td className="p-4 text-right font-bold text-blue-400">
                  {score.total_score?.toLocaleString() || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
