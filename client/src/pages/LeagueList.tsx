import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MobileLayout from '../components/common/MobileLayout';
import { TrophyIcon, PlusIcon } from '@heroicons/react/24/outline';

interface League {
  id: number;
  name: string;
  description?: string;
  photoUrl?: string;
  seasonName?: string;
  club: {
    id: number;
    name: string;
  };
  _count: {
    members: number;
    tournaments: number;
  };
}

const LeagueList: React.FC = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeagues();
  }, []);

  const fetchLeagues = async () => {
    try {
      setLoading(true);
      // In production, this would fetch from /api/leagues
      // Mock data for now
      setLeagues([]);
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leagues</h1>
            <p className="text-gray-600 mt-1">Season-based competitions</p>
          </div>
          <Link
            to="/create?type=league"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Create League</span>
          </Link>
        </div>

        {/* Leagues List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading leagues...</p>
          </div>
        ) : leagues.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {leagues.map((league) => (
              <Link
                key={league.id}
                to={`/leagues/${league.id}`}
                className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all overflow-hidden"
              >
                {/* League Photo */}
                {league.photoUrl ? (
                  <img
                    src={league.photoUrl}
                    alt={league.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <TrophyIcon className="w-20 h-20 text-white opacity-50" />
                  </div>
                )}

                {/* League Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {league.name}
                  </h3>
                  {league.seasonName && (
                    <p className="text-sm text-blue-600 mb-2">{league.seasonName}</p>
                  )}
                  {league.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {league.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{league.club.name}</span>
                    <span>{league._count.members} members</span>
                  </div>
                  {league._count.tournaments > 0 && (
                    <div className="mt-2 text-sm text-gray-500">
                      {league._count.tournaments} tournaments
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <TrophyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No leagues yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create a league or join one with an invite code
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                to="/create?type=league"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create League
              </Link>
              <button
                onClick={() => {
                  const code = prompt('Enter league invite code:');
                  if (code) {
                    // Handle join by code
                    console.log('Join league with code:', code);
                  }
                }}
                className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Join with Code
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default LeagueList;
