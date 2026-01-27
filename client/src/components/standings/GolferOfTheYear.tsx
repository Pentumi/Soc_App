import React, { useEffect, useState } from 'react';
import Layout from '../common/Layout';
import { standingsAPI } from '../../services/api';
import { YearStandings } from '../../types';

const GolferOfTheYear: React.FC = () => {
  const [standings, setStandings] = useState<YearStandings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchStandings();
  }, [selectedYear]);

  const fetchStandings = async () => {
    try {
      const data = await standingsAPI.getYearStandings(selectedYear);
      setStandings(data);
    } catch (error) {
      console.error('Failed to fetch standings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
        </div>
      </Layout>
    );
  }

  if (!standings || standings.standings.length === 0) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 pb-24">
          <h1 className="text-3xl md:text-4xl font-bold text-apple-gray-900 tracking-tight mb-2">
            Golfer of the Year
          </h1>
          <p className="text-apple-gray-600 text-sm md:text-base mb-6 md:mb-8">Season standings and rankings</p>
          <div className="bg-white rounded-2xl shadow-apple border border-apple-gray-200 p-8 md:p-12 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-apple-gray-600">No completed tournaments for {selectedYear}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 md:mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-apple-gray-900 tracking-tight mb-2">
              Golfer of the Year
            </h1>
            <p className="text-apple-gray-600 text-sm md:text-base">Season {selectedYear} standings</p>
          </div>
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full md:w-auto px-4 py-2 border border-apple-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent text-apple-gray-900 text-sm md:text-base"
            >
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
              <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
            </select>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {standings.standings.slice(0, 3).map((player, index) => (
            <div
              key={player.userId}
              className={`bg-white rounded-2xl shadow-apple border border-apple-gray-200 overflow-hidden ${
                index === 0 ? 'md:order-2 md:scale-105' : index === 1 ? 'md:order-1' : 'md:order-3'
              }`}
            >
              <div
                className={`h-2 bg-gradient-to-r ${
                  index === 0
                    ? 'from-apple-yellow to-amber-500'
                    : index === 1
                    ? 'from-gray-400 to-gray-500'
                    : 'from-orange-400 to-orange-500'
                }`}
              ></div>
              <div className="p-6 text-center">
                <div className="text-6xl mb-3">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </div>
                <h3 className="text-2xl font-bold text-apple-gray-900 mb-1">{player.name}</h3>
                <p className="text-apple-gray-600 text-sm mb-4">Position {index + 1}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-apple-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">
                      Best 5
                    </p>
                    <p className="text-3xl font-bold text-apple-blue">{player.best5Points}</p>
                  </div>
                  <div>
                    <p className="text-apple-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">
                      Average
                    </p>
                    <p className="text-3xl font-bold text-apple-gray-900">{player.averagePoints}</p>
                  </div>
                </div>
                <p className="text-apple-gray-500 text-xs mt-4">
                  {player.tournamentsPlayed} tournaments played
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Full Standings Table */}
        <div className="bg-white rounded-2xl shadow-apple border border-apple-gray-200 overflow-hidden">
          <div className="p-6 border-b border-apple-gray-200">
            <h2 className="text-2xl font-bold text-apple-gray-900">Full Standings</h2>
            <p className="text-apple-gray-600 text-sm mt-1">
              Points awarded based on finishing position
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-apple-gray-50">
                  <th className="text-left py-4 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider sticky left-0 bg-apple-gray-50 z-10">
                    Rank
                  </th>
                  <th className="text-left py-4 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider sticky left-16 bg-apple-gray-50 z-10">
                    Player
                  </th>
                  {standings.tournaments.map((tournament) => (
                    <th
                      key={tournament.id}
                      className="text-center py-4 px-3 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider"
                    >
                      {tournament.name.replace(/LIV\d+\.\d+/, '').trim()}
                    </th>
                  ))}
                  <th className="text-center py-4 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider bg-apple-blue/5">
                    Best 5
                  </th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                    Avg
                  </th>
                  <th className="text-center py-4 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                    Played
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-apple-gray-200">
                {standings.standings.map((player, index) => (
                  <tr
                    key={player.userId}
                    className={`transition-colors ${
                      index < 3
                        ? 'bg-gradient-to-r from-apple-yellow/5 to-transparent'
                        : 'hover:bg-apple-gray-50'
                    }`}
                  >
                    <td className="py-4 px-4 sticky left-0 bg-white z-10">
                      <div className="flex items-center space-x-2">
                        {index === 0 && <span className="text-2xl">🥇</span>}
                        {index === 1 && <span className="text-2xl">🥈</span>}
                        {index === 2 && <span className="text-2xl">🥉</span>}
                        <span className="text-sm font-semibold text-apple-gray-900">{index + 1}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 sticky left-16 bg-white z-10">
                      <span className="text-sm font-medium text-apple-gray-900">{player.name}</span>
                    </td>
                    {standings.tournaments.map((tournament) => {
                      const tournamentScore = player.tournaments.find((t) => t.name === tournament.name);
                      return (
                        <td key={tournament.id} className="text-center py-4 px-3">
                          {tournamentScore ? (
                            <div className="flex flex-col items-center">
                              <span className="text-sm font-bold text-apple-gray-900">
                                {tournamentScore.points}
                              </span>
                              <span className="text-xs text-apple-gray-500">
                                (#{tournamentScore.position})
                              </span>
                            </div>
                          ) : (
                            <span className="text-apple-gray-300">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="text-center py-4 px-4 bg-apple-blue/5">
                      <span className="text-lg font-bold text-apple-blue">{player.best5Points}</span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-sm font-semibold text-apple-gray-900">
                        {player.averagePoints}
                      </span>
                    </td>
                    <td className="text-center py-4 px-4">
                      <span className="text-sm text-apple-gray-700">{player.tournamentsPlayed}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Points Legend */}
        <div className="mt-6 bg-apple-gray-100 rounded-2xl p-6 border border-apple-gray-200">
          <h3 className="text-lg font-semibold text-apple-gray-900 mb-3">Points System</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <span className="font-semibold text-apple-gray-900">1st:</span>{' '}
              <span className="text-apple-gray-700">50 pts</span>
            </div>
            <div>
              <span className="font-semibold text-apple-gray-900">2nd:</span>{' '}
              <span className="text-apple-gray-700">45 pts</span>
            </div>
            <div>
              <span className="font-semibold text-apple-gray-900">3rd:</span>{' '}
              <span className="text-apple-gray-700">40 pts</span>
            </div>
            <div>
              <span className="font-semibold text-apple-gray-900">4th:</span>{' '}
              <span className="text-apple-gray-700">37 pts</span>
            </div>
            <div>
              <span className="font-semibold text-apple-gray-900">5th:</span>{' '}
              <span className="text-apple-gray-700">35 pts</span>
            </div>
          </div>
          <p className="text-xs text-apple-gray-600 mt-3">
            Points decrease by position. Best 5 tournament scores count towards final ranking.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default GolferOfTheYear;
