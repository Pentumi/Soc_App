import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../common/Layout';
import { useAuth } from '../../context/AuthContext';
import { tournamentsAPI, scoresAPI, usersAPI, coursesAPI } from '../../services/api';
import { Tournament, TournamentScore, User, Course } from '../../types';
import ScoreEntryModal from './ScoreEntryModal';
import EditTournamentModal from './EditTournamentModal';
import DeleteConfirmationModal from '../common/DeleteConfirmationModal';
import TournamentStats from './TournamentStats';

const TournamentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentClub } = useAuth();
  const isClubAdmin = currentClub && (currentClub.userRole === 'owner' || currentClub.userRole === 'admin');
  const navigate = useNavigate();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [scores, setScores] = useState<TournamentScore[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'stats'>('leaderboard');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [tournamentData, scoresData, membersData, coursesData] = await Promise.all([
        tournamentsAPI.getById(parseInt(id!)),
        scoresAPI.getLeaderboard(parseInt(id!)),
        usersAPI.getAll(),
        coursesAPI.getAll(),
      ]);
      setTournament(tournamentData);
      setScores(scoresData);
      setMembers(membersData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Failed to fetch tournament:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreAdded = () => {
    setShowScoreModal(false);
    fetchData();
  };

  const handleCompleteTournament = async () => {
    if (!window.confirm('Are you sure you want to complete this tournament? This will adjust handicaps for the winner (-2) and last place (+1).')) {
      return;
    }

    setCompleting(true);
    try {
      await scoresAPI.completeTournament(parseInt(id!));
      await fetchData();
      alert('Tournament completed successfully! Handicaps have been adjusted.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to complete tournament');
    } finally {
      setCompleting(false);
    }
  };

  const handleEditSuccess = (updatedTournament: Tournament) => {
    setTournament(updatedTournament);
    setShowEditModal(false);
    fetchData();
  };

  const handleDeleteTournament = async () => {
    setDeleting(true);
    try {
      await tournamentsAPI.delete(parseInt(id!));
      navigate('/tournaments');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete tournament');
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center">Loading...</div>
      </Layout>
    );
  }

  if (!tournament) {
    return (
      <Layout>
        <div className="text-center">Tournament not found</div>
      </Layout>
    );
  }

  const sortedScores = [...scores].sort((a, b) => {
    if (tournament.format === 'Stableford') {
      // Highest points wins in Stableford
      return (b.stablefordPoints ?? 0) - (a.stablefordPoints ?? 0);
    }
    // Lowest score wins in Stroke Play
    return a.netScore - b.netScore;
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <button
          onClick={() => navigate('/tournaments')}
          className="mb-4 md:mb-6 text-apple-blue hover:text-apple-blue/80 font-medium text-sm transition-colors flex items-center space-x-1"
        >
          <span>←</span>
          <span>Back to Tournaments</span>
        </button>

        <div className="bg-white rounded-xl md:rounded-2xl shadow-apple border border-apple-gray-200 mb-4 md:mb-6 overflow-hidden">
          <div className="p-4 md:p-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 md:mb-6">
              <div className="flex-1 mb-4 md:mb-0">
                <h1 className="text-2xl md:text-4xl font-bold text-apple-gray-900 tracking-tight mb-2 md:mb-3">
                  {tournament.name}
                </h1>
                <p className="text-apple-gray-700 font-medium mb-1 text-sm md:text-base">
                  {tournament.course?.name}
                </p>
                <p className="text-apple-gray-500 text-xs md:text-sm mb-1">
                  {tournament.course?.location}
                </p>
                <p className="text-apple-gray-600 text-xs md:text-sm">
                  {new Date(tournament.tournamentDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {tournament.startTime && (
                    <span className="text-apple-gray-500"> • {tournament.startTime}</span>
                  )}
                </p>
              </div>
              <div className="flex flex-row md:flex-col items-start md:items-end space-x-2 md:space-x-0 md:space-y-2">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-apple-blue/10 text-apple-blue">
                  {tournament.format}
                </span>
                {tournament.isMajor && (
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-apple-yellow/20 text-apple-yellow">
                    MAJOR
                  </span>
                )}
                <span
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                    tournament.status === 'completed'
                      ? 'bg-apple-gray-200 text-apple-gray-700'
                      : 'bg-apple-green/10 text-apple-green'
                  }`}
                >
                  {tournament.status.toUpperCase().replace('_', ' ')}
                </span>
              </div>
            </div>

            {isClubAdmin && (
              <div className="flex flex-wrap gap-2 md:gap-3 pt-4 md:pt-6 border-t border-apple-gray-200">
                {tournament.status !== 'completed' && (
                  <>
                    <button
                      onClick={() => setShowScoreModal(true)}
                      className="flex-1 md:flex-none bg-apple-blue text-white px-4 md:px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm hover:bg-apple-blue/90 transition-all shadow-sm hover:shadow-md"
                    >
                      Enter Score
                    </button>
                    {scores.length > 0 && (
                      <button
                        onClick={handleCompleteTournament}
                        disabled={completing}
                        className="flex-1 md:flex-none bg-apple-green text-white px-4 md:px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm hover:bg-apple-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                      >
                        {completing ? 'Completing...' : 'Complete'}
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex-1 md:flex-none bg-apple-gray-100 text-apple-gray-700 px-4 md:px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm hover:bg-apple-gray-200 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-1 md:flex-none bg-apple-red/10 text-apple-red px-4 md:px-5 py-2.5 rounded-xl font-semibold text-xs md:text-sm hover:bg-apple-red/20 transition-all"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-apple border border-apple-gray-200 overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-apple-gray-200 bg-apple-gray-50">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-all ${
                activeTab === 'leaderboard'
                  ? 'text-apple-blue bg-white border-b-2 border-apple-blue'
                  : 'text-apple-gray-600 hover:text-apple-gray-900'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex-1 px-6 py-4 font-semibold text-sm transition-all ${
                activeTab === 'stats'
                  ? 'text-apple-blue bg-white border-b-2 border-apple-blue'
                  : 'text-apple-gray-600 hover:text-apple-gray-900'
              }`}
            >
              Statistics
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'leaderboard' ? (
              <>
                {scores.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border border-apple-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-apple-gray-50">
                          <th className="text-left py-4 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                            Pos
                          </th>
                          <th className="text-left py-4 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                            Player
                          </th>
                          <th className="text-center py-4 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                            H'cap
                          </th>
                          <th className="text-center py-4 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                            Gross
                          </th>
                          <th className="text-center py-4 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                            {tournament.format === 'Stableford' ? 'Points' : 'Net'}
                          </th>
                          {tournament.status === 'completed' && (
                            <th className="text-center py-4 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                              Adj
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-apple-gray-200">
                        {sortedScores.map((score, index) => (
                          <tr
                            key={score.id}
                            className={`transition-colors ${
                              index === 0
                                ? 'bg-yellow-50 hover:bg-yellow-100'
                                : index === scores.length - 1
                                ? 'bg-red-50 hover:bg-red-100'
                                : 'hover:bg-apple-gray-50'
                            }`}
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                {index === 0 && <span className="text-lg">🏆</span>}
                                <span className="text-sm font-semibold text-apple-gray-900">
                                  {score.position || index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm font-medium text-apple-gray-900">
                                {score.user?.firstName} {score.user?.lastName}
                              </span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span className="text-sm text-apple-gray-700">{score.handicapAtTime}</span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span className="text-sm text-apple-gray-700">{score.grossScore}</span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span className="text-sm font-bold text-apple-gray-900">
                                {tournament.format === 'Stableford'
                                  ? score.stablefordPoints ?? score.netScore
                                  : score.netScore}
                              </span>
                            </td>
                            {tournament.status === 'completed' && (
                              <td className="text-center py-4 px-4">
                                {score.handicapAdjustment !== 0 && (
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                      score.handicapAdjustment < 0
                                        ? 'bg-apple-green/10 text-apple-green'
                                        : 'bg-apple-red/10 text-apple-red'
                                    }`}
                                  >
                                    {score.handicapAdjustment > 0 ? '+' : ''}
                                    {score.handicapAdjustment}
                                  </span>
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-apple-gray-500">No scores entered yet</p>
                  </div>
                )}
              </>
            ) : (
              <TournamentStats tournamentId={tournament.id} />
            )}
          </div>
        </div>

        {showScoreModal && (
          <ScoreEntryModal
            tournament={tournament}
            members={members}
            existingScores={scores}
            onClose={() => setShowScoreModal(false)}
            onSuccess={handleScoreAdded}
          />
        )}

        {showEditModal && (
          <EditTournamentModal
            tournament={tournament}
            courses={courses}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleEditSuccess}
          />
        )}

        {showDeleteModal && (
          <DeleteConfirmationModal
            title="Delete Tournament"
            message={`Are you sure you want to delete "${tournament.name}"?`}
            warningMessage="This action cannot be undone. All scores and data for this tournament will be permanently deleted."
            itemName={tournament.name}
            scoreCount={scores.length}
            players={scores.map((s) => `${s.user?.firstName} ${s.user?.lastName}`)}
            onConfirm={handleDeleteTournament}
            onCancel={() => setShowDeleteModal(false)}
            isDeleting={deleting}
          />
        )}
      </div>
    </Layout>
  );
};

export default TournamentDetails;
