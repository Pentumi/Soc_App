import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../common/Layout';
import { useAuth } from '../../context/AuthContext';
import { tournamentsAPI, coursesAPI } from '../../services/api';
import { Tournament, Course } from '../../types';
import CreateTournamentModal from './CreateTournamentModal';

const TournamentList: React.FC = () => {
  const { isAdmin } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'upcoming' | 'completed'>('upcoming');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tournamentsData, coursesData] = await Promise.all([
        tournamentsAPI.getAll(),
        coursesAPI.getAll(),
      ]);
      setTournaments(tournamentsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTournamentCreated = (newTournament: Tournament) => {
    setTournaments([newTournament, ...tournaments]);
    setShowCreateModal(false);
  };

  const filteredTournaments = tournaments.filter((t) => t.status === filter);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-apple-blue"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-apple-gray-900 tracking-tight mb-2">Tournaments</h1>
          <p className="text-apple-gray-600">View and manage all society tournaments</p>
        </div>

        <div className="mb-6 flex space-x-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
              filter === 'upcoming'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-apple-gray-700 hover:bg-apple-gray-50 border border-apple-gray-300'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all ${
              filter === 'completed'
                ? 'bg-green-600 text-white shadow-sm'
                : 'bg-white text-apple-gray-700 hover:bg-apple-gray-50 border border-apple-gray-300'
            }`}
          >
            Completed
          </button>
        </div>

        <div className="space-y-4">
          {filteredTournaments.length > 0 ? (
            filteredTournaments.map((tournament) => (
              <Link
                key={tournament.id}
                to={`/tournaments/${tournament.id}`}
                className="block bg-white rounded-2xl shadow-md border border-apple-gray-200 hover:shadow-lg transition-all overflow-hidden"
              >
                {/* Tournament Header Image */}
                <div className="relative h-40 bg-gradient-to-br from-green-600 via-green-700 to-green-800 overflow-hidden">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute inset-0" style={{
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    }}></div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-green-700 backdrop-blur-sm">
                      {tournament.isMajor ? '🏆 Tournament' : '⛳ Tournament'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {tournament.name}
                    </h2>
                  </div>
                </div>

                {/* Tournament Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center text-apple-gray-600 text-sm mb-1">
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {tournament.format}
                      </div>
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
                    </div>
                    <div className="flex items-center text-apple-gray-600 text-sm">
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {tournament.tournamentScores?.length || 0} players
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-apple border border-apple-gray-200 p-12 text-center">
              <div className="flex flex-col items-center">
                <div className="text-8xl mb-6">🏆</div>
                <h3 className="text-xl font-bold text-apple-gray-900 mb-2">
                  {filter === 'upcoming' ? 'No Upcoming Tournaments' : 'No Completed Tournaments'}
                </h3>
                <p className="text-apple-gray-600 mb-6 max-w-md">
                  {filter === 'upcoming'
                    ? 'No tournaments scheduled yet. Tap the green + button to create your first tournament!'
                    : 'No tournaments have been completed yet.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {showCreateModal && (
          <CreateTournamentModal
            courses={courses}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleTournamentCreated}
          />
        )}

        {/* Floating Action Button */}
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="fixed bottom-24 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
            aria-label="Create tournament"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
    </Layout>
  );
};

export default TournamentList;
