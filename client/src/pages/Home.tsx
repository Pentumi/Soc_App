import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MobileLayout from '../components/common/MobileLayout';
import {
  UserGroupIcon,
  TrophyIcon,
  CalendarIcon,
  PlusIcon,
  QrCodeIcon,
} from '@heroicons/react/24/outline';

interface Club {
  id: number;
  name: string;
  photoUrl?: string;
}

interface League {
  id: number;
  name: string;
  seasonName?: string;
}

interface Tournament {
  id: number;
  name: string;
  date: string;
  club: {
    name: string;
  };
}

const Home: React.FC = () => {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [upcomingTournaments, setUpcomingTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch user's clubs, leagues, and upcoming tournaments
      // These would be real API calls in production

      // Mock data for now
      setClubs([]);
      setLeagues([]);
      setUpcomingTournaments([]);
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-1">
            Your golf community at your fingertips
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link
            to="/create"
            className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <PlusIcon className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-900">Create New</span>
          </Link>
          <button
            onClick={() => {
              const code = prompt('Enter invite code:');
              if (code) {
                // Handle join by code
                console.log('Join with code:', code);
              }
            }}
            className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
          >
            <QrCodeIcon className="w-8 h-8 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-900">Join with Code</span>
          </button>
        </div>

        {/* Your Clubs */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <UserGroupIcon className="w-5 h-5 mr-2" />
              Your Clubs
            </h2>
            <Link
              to="/dashboard"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>
          {loading ? (
            <div className="text-gray-500">Loading clubs...</div>
          ) : clubs.length > 0 ? (
            <div className="grid gap-3">
              {clubs.map((club) => (
                <Link
                  key={club.id}
                  to={`/dashboard`}
                  className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  {club.photoUrl ? (
                    <img
                      src={club.photoUrl}
                      alt={club.name}
                      className="w-12 h-12 rounded-lg object-cover mr-3"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                      <UserGroupIcon className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{club.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">You're not in any clubs yet</p>
              <Link
                to="/create"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create or join a club
              </Link>
            </div>
          )}
        </section>

        {/* Your Leagues */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrophyIcon className="w-5 h-5 mr-2" />
              Your Leagues
            </h2>
            <Link
              to="/leagues"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>
          {loading ? (
            <div className="text-gray-500">Loading leagues...</div>
          ) : leagues.length > 0 ? (
            <div className="grid gap-3">
              {leagues.map((league) => (
                <Link
                  key={league.id}
                  to={`/leagues/${league.id}`}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{league.name}</h3>
                    {league.seasonName && (
                      <p className="text-sm text-gray-600">{league.seasonName}</p>
                    )}
                  </div>
                  <TrophyIcon className="w-5 h-5 text-gray-400" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <TrophyIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">You're not in any leagues yet</p>
              <Link
                to="/leagues"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Browse leagues
              </Link>
            </div>
          )}
        </section>

        {/* Upcoming Tournaments */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2" />
              Upcoming Tournaments
            </h2>
            <Link
              to="/tournaments"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>
          {loading ? (
            <div className="text-gray-500">Loading tournaments...</div>
          ) : upcomingTournaments.length > 0 ? (
            <div className="grid gap-3">
              {upcomingTournaments.map((tournament) => (
                <Link
                  key={tournament.id}
                  to={`/tournaments/${tournament.id}`}
                  className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <h3 className="font-medium text-gray-900">{tournament.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {tournament.club.name} • {new Date(tournament.date).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">No upcoming tournaments</p>
              <Link
                to="/tournaments"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Browse tournaments
              </Link>
            </div>
          )}
        </section>
      </div>
    </MobileLayout>
  );
};

export default Home;
