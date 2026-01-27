import React, { useEffect, useState } from 'react';
import { tournamentsAPI } from '../../services/api';
import { TournamentStats as Stats } from '../../types';

interface TournamentStatsProps {
  tournamentId: number;
}

const TournamentStats: React.FC<TournamentStatsProps> = ({ tournamentId }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await tournamentsAPI.getStats(tournamentId);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-apple-blue"></div>
      </div>
    );
  }

  const renderStatCard = (
    title: string,
    stat: any,
    color: string,
    renderContent: () => React.ReactNode
  ) => (
    <div className="bg-white rounded-2xl shadow-apple border border-apple-gray-200 overflow-hidden transition-all hover:shadow-apple-lg">
      <div className={`h-1 ${color}`}></div>
      <div className="p-6">
        <h3 className="text-sm font-semibold text-apple-gray-600 uppercase tracking-wide mb-4">
          {title}
        </h3>
        {stat ? (
          renderContent()
        ) : (
          <p className="text-apple-gray-500 text-sm leading-relaxed">
            Once enough data is gathered for this stat, you'll see the ranking displayed here
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {renderStatCard('Biggest Blowup Hole', stats?.biggestBlowupHole, 'bg-apple-red', () => (
        <div className="space-y-2">
          <p className="text-3xl font-bold text-apple-gray-900 tracking-tight">
            {stats!.biggestBlowupHole!.player}
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-bold text-apple-red">
              {stats!.biggestBlowupHole!.strokes}
            </span>
            <span className="text-sm text-apple-gray-500">strokes</span>
          </div>
          <p className="text-sm text-apple-gray-600">
            Hole {stats!.biggestBlowupHole!.hole} • Par {stats!.biggestBlowupHole!.par} • +
            {stats!.biggestBlowupHole!.overPar}
          </p>
        </div>
      ))}

      {renderStatCard('Lowest Hole Score', stats?.lowestHoleScore, 'bg-apple-green', () => (
        <div className="space-y-2">
          <p className="text-3xl font-bold text-apple-gray-900 tracking-tight">
            {stats!.lowestHoleScore!.player}
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-bold text-apple-green">
              {stats!.lowestHoleScore!.strokes}
            </span>
            <span className="text-sm text-apple-gray-500">strokes</span>
          </div>
          <p className="text-sm text-apple-gray-600">
            Hole {stats!.lowestHoleScore!.hole} • Par {stats!.lowestHoleScore!.par}
          </p>
        </div>
      ))}

      {renderStatCard('Best Gross Round', stats?.bestGrossRound, 'bg-apple-blue', () => (
        <div className="space-y-2">
          <p className="text-3xl font-bold text-apple-gray-900 tracking-tight">
            {stats!.bestGrossRound!.player}
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-bold text-apple-blue">
              {stats!.bestGrossRound!.grossScore}
            </span>
            <span className="text-lg font-semibold text-apple-gray-500">
              ({stats!.bestGrossRound!.toPar > 0 ? '+' : ''}
              {stats!.bestGrossRound!.toPar})
            </span>
          </div>
          <p className="text-sm text-apple-gray-600">vs Par {stats!.bestGrossRound!.coursePar}</p>
        </div>
      ))}

      {renderStatCard('Worst Gross Round', stats?.worstGrossRound, 'bg-apple-orange', () => (
        <div className="space-y-2">
          <p className="text-3xl font-bold text-apple-gray-900 tracking-tight">
            {stats!.worstGrossRound!.player}
          </p>
          <div className="flex items-baseline space-x-2">
            <span className="text-5xl font-bold text-apple-orange">
              {stats!.worstGrossRound!.grossScore}
            </span>
            <span className="text-lg font-semibold text-apple-gray-500">
              (+{stats!.worstGrossRound!.toPar})
            </span>
          </div>
          <p className="text-sm text-apple-gray-600">vs Par {stats!.worstGrossRound!.coursePar}</p>
        </div>
      ))}
    </div>
  );
};

export default TournamentStats;
