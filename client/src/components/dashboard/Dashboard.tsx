import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../common/Layout';
import { useAuth } from '../../context/AuthContext';
import { tournamentsAPI } from '../../services/api';
import { Tournament } from '../../types';

const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return num + 'st';
  if (j === 2 && k !== 12) return num + 'nd';
  if (j === 3 && k !== 13) return num + 'rd';
  return num + 'th';
};

const Dashboard: React.FC = () => {
  const { user, currentClub } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  const isClubAdmin = currentClub && (currentClub.userRole === 'owner' || currentClub.userRole === 'admin');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tournamentsData = await tournamentsAPI.getAll();
        setTournaments(tournamentsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
        </div>
      </Layout>
    );
  }

  const upcomingTournaments = tournaments.filter((t) => t.status === 'upcoming').slice(0, 6);

  // Calculate user stats
  const completedTournaments = tournaments.filter((t) => t.status === 'completed');
  const userTournamentsPlayed = completedTournaments.filter((t) =>
    t.tournamentScores?.some((s: any) => s.userId === user?.id)
  ).length;

  const userScores = completedTournaments.flatMap((t) =>
    t.tournamentScores?.filter((s: any) => s.userId === user?.id) || []
  );
  const bestFinish = userScores.length > 0
    ? Math.min(...userScores.map((s: any) => s.position || 999))
    : null;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <h1 className="text-3xl font-bold text-apple-gray-900 tracking-tight mb-6">
          {currentClub?.name || 'Golf Club'}
        </h1>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-apple border border-apple-gray-200 overflow-hidden hover:shadow-apple-lg transition-all">
            <div className="h-2 bg-gradient-to-r from-apple-blue to-indigo-500"></div>
            <div className="p-4 md:p-6">
              <h3 className="text-apple-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">
                Handicap
              </h3>
              <p className="text-3xl md:text-5xl font-bold text-apple-gray-900">
                {user?.currentHandicap !== null ? user?.currentHandicap : 'N/A'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-apple border border-apple-gray-200 overflow-hidden hover:shadow-apple-lg transition-all">
            <div className="h-2 bg-gradient-to-r from-apple-purple to-pink-500"></div>
            <div className="p-4 md:p-6">
              <h3 className="text-apple-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">
                Played
              </h3>
              <p className="text-3xl md:text-5xl font-bold text-apple-gray-900">{userTournamentsPlayed}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-apple border border-apple-gray-200 overflow-hidden hover:shadow-apple-lg transition-all col-span-2 md:col-span-1">
            <div className="h-2 bg-gradient-to-r from-apple-yellow to-amber-500"></div>
            <div className="p-4 md:p-6">
              <h3 className="text-apple-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">
                Best Finish
              </h3>
              <p className="text-3xl md:text-5xl font-bold text-apple-gray-900">
                {bestFinish ? (bestFinish === 1 ? '🏆 1st' : `${bestFinish}${getOrdinalSuffix(bestFinish)}`) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Tournaments Section */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-apple-gray-900 mb-4">Recent Tournaments</h2>
          {upcomingTournaments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingTournaments.slice(0, 3).map((tournament) => (
                <Link
                  key={tournament.id}
                  to={`/tournaments/${tournament.id}`}
                  className="block bg-white rounded-2xl shadow-md border border-apple-gray-200 hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Tournament Image Header */}
                  <div className="relative h-32 bg-gradient-to-br from-green-600 via-green-700 to-green-800">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                      }}></div>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-green-700 backdrop-blur-sm">
                        {tournament.isMajor ? '🏆 Tournament' : '⛳ Tournament'}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      <h3 className="text-lg font-bold text-white">{tournament.name}</h3>
                    </div>
                  </div>

                  {/* Tournament Details */}
                  <div className="p-3">
                    <div className="flex items-center text-apple-gray-600 text-sm mb-1.5">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {tournament.format}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-apple-gray-600 text-sm">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(tournament.tournamentDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center text-apple-gray-600 text-sm">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {tournament.tournamentScores?.length || 0}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-apple border border-apple-gray-200 p-12 text-center">
              <div className="text-6xl mb-4">⛳</div>
              <p className="text-apple-gray-600">No upcoming tournaments</p>
            </div>
          )}
        </div>

        {/* View All Link */}
        {upcomingTournaments.length > 0 && (
          <div className="text-center mb-8">
            <Link
              to="/tournaments"
              className="text-green-600 hover:text-green-700 font-semibold text-sm transition-colors"
            >
              View All Tournaments →
            </Link>
          </div>
        )}
      </div>

      {/* Floating Action Button for Admins */}
      {isClubAdmin && (
        <Link
          to="/tournaments"
          className="fixed bottom-24 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
          aria-label="View tournaments"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      )}
    </Layout>
  );
};

export default Dashboard;
