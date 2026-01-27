import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../common/Layout';
import { useAuth } from '../../context/AuthContext';
import { usersAPI, handicapsAPI } from '../../services/api';
import { User, HandicapHistory } from '../../types';

interface MemberWithDetails extends User {
  tournamentScores?: any[];
  handicapHistory?: HandicapHistory[];
}

const MemberProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [member, setMember] = useState<MemberWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHandicapModal, setShowHandicapModal] = useState(false);
  const [newHandicap, setNewHandicap] = useState('');
  const [reason, setReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [expandedRound, setExpandedRound] = useState<number | null>(null);

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      const data = await usersAPI.getById(parseInt(id!));
      setMember(data);
    } catch (error) {
      console.error('Failed to fetch member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustHandicap = async () => {
    if (!newHandicap || isNaN(parseFloat(newHandicap))) {
      alert('Please enter a valid handicap');
      return;
    }

    setAdjusting(true);
    try {
      await handicapsAPI.adjustHandicap(
        parseInt(id!),
        parseFloat(newHandicap),
        reason || 'Manual adjustment by admin'
      );
      await fetchMember();
      setShowHandicapModal(false);
      setNewHandicap('');
      setReason('');
      alert('Handicap updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to adjust handicap');
    } finally {
      setAdjusting(false);
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

  if (!member) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-apple-gray-500">Member not found</p>
        </div>
      </Layout>
    );
  }

  const wins = member.tournamentScores?.filter((s) => s.position === 1).length || 0;
  const totalTournaments = member.tournamentScores?.length || 0;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4">
        <button
          onClick={() => navigate('/members')}
          className="mb-6 text-apple-blue hover:text-apple-blue/80 font-medium text-sm transition-colors flex items-center space-x-1"
        >
          <span>←</span>
          <span>Back to Members</span>
        </button>

        <div className="bg-white rounded-2xl shadow-apple border border-apple-gray-200 p-4 md:p-8 mb-6">
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-apple-blue to-apple-purple rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-sm flex-shrink-0">
                {member.firstName[0]}
                {member.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-apple-gray-900 tracking-tight mb-1 truncate">
                  {member.firstName} {member.lastName}
                </h1>
                <p className="text-sm text-apple-gray-600 truncate">{member.email}</p>
                {member.role === 'admin' && (
                  <span className="inline-flex items-center mt-2 text-xs bg-apple-blue/10 text-apple-blue px-3 py-1 rounded-full font-semibold">
                    Admin
                  </span>
                )}
              </div>
            </div>
            <div className="bg-apple-gray-50 rounded-xl p-4 text-center">
              <p className="text-apple-gray-600 text-xs font-semibold uppercase tracking-wide mb-2">
                Current Handicap
              </p>
              <p className="text-5xl font-bold text-apple-gray-900 mb-3">
                {member.currentHandicap !== null ? member.currentHandicap : 'N/A'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowHandicapModal(true)}
                  className="w-full bg-apple-blue text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-apple-blue/90 transition-all shadow-sm"
                >
                  Adjust Handicap
                </button>
              )}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div className="flex items-center space-x-6 flex-1">
              <div className="w-24 h-24 bg-gradient-to-br from-apple-blue to-apple-purple rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-sm">
                {member.firstName[0]}
                {member.lastName[0]}
              </div>
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-apple-gray-900 tracking-tight mb-2">
                  {member.firstName} {member.lastName}
                </h1>
                <p className="text-apple-gray-600">{member.email}</p>
                {member.role === 'admin' && (
                  <span className="inline-flex items-center mt-2 text-xs bg-apple-blue/10 text-apple-blue px-3 py-1.5 rounded-full font-semibold">
                    Admin
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-apple-gray-600 text-sm font-semibold uppercase tracking-wide mb-2">
                Current Handicap
              </p>
              <p className="text-6xl font-bold text-apple-gray-900 mb-2">
                {member.currentHandicap !== null ? member.currentHandicap : 'N/A'}
              </p>
              {isAdmin && (
                <button
                  onClick={() => setShowHandicapModal(true)}
                  className="mt-2 bg-apple-blue text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-apple-blue/90 transition-all shadow-sm"
                >
                  Adjust Handicap
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-apple border border-apple-gray-200 p-4 md:p-6">
            <h3 className="text-apple-gray-600 text-xs md:text-sm font-semibold uppercase tracking-wide mb-2">
              Tournaments
            </h3>
            <p className="text-3xl md:text-5xl font-bold text-apple-gray-900">{totalTournaments}</p>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-apple border border-apple-gray-200 p-4 md:p-6">
            <h3 className="text-apple-gray-600 text-xs md:text-sm font-semibold uppercase tracking-wide mb-2">
              Wins
            </h3>
            <p className="text-3xl md:text-5xl font-bold text-apple-gray-900">{wins}</p>
          </div>

          <div className="bg-white rounded-xl md:rounded-2xl shadow-apple border border-apple-gray-200 p-4 md:p-6 col-span-2 md:col-span-1">
            <h3 className="text-apple-gray-600 text-xs md:text-sm font-semibold uppercase tracking-wide mb-2">
              Win Rate
            </h3>
            <p className="text-3xl md:text-5xl font-bold text-apple-gray-900">
              {totalTournaments > 0 ? Math.round((wins / totalTournaments) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-apple border border-apple-gray-200 p-6">
            <h2 className="text-2xl font-bold text-apple-gray-900 mb-4">Handicap History</h2>
            {member.handicapHistory && member.handicapHistory.length > 0 ? (
              <div className="space-y-3">
                {member.handicapHistory.slice(0, 10).map((history) => (
                  <div
                    key={history.id}
                    className="flex justify-between items-center py-3 border-b border-apple-gray-200"
                  >
                    <div>
                      <p className="font-bold text-apple-gray-900 text-lg">{history.handicapIndex}</p>
                      <p className="text-sm text-apple-gray-500">
                        {new Date(history.effectiveDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-apple-gray-600">
                        {history.reason?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-apple-gray-500 text-center py-8">No handicap history</p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-apple border border-apple-gray-200 p-6">
            <h2 className="text-2xl font-bold text-apple-gray-900 mb-4">Recent Rounds</h2>
            {member.tournamentScores && member.tournamentScores.length > 0 ? (
              <div className="space-y-3">
                {member.tournamentScores.slice(0, 10).map((score: any, index: number) => {
                  const isExpanded = expandedRound === index;
                  const toPar = score.netScore - (score.tournament?.course?.par || 72);
                  const toParDisplay = toPar > 0 ? `+${toPar}` : toPar === 0 ? 'E' : `${toPar}`;

                  return (
                    <div
                      key={score.id}
                      className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl overflow-hidden shadow-md cursor-pointer transition-all hover:shadow-lg"
                      onClick={() => setExpandedRound(isExpanded ? null : index)}
                    >
                      {/* Card Header */}
                      <div className="p-4 text-white">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold mb-1">
                              {score.tournament?.course?.name || score.tournament?.name}
                            </h3>
                            <div className="flex items-center text-sm text-green-100">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(score.tournament?.tournamentDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="text-sm text-green-100 mt-1">
                              Par {score.tournament?.course?.par || 72} | {score.tournament?.course?.location || 'Golf Course'}
                            </div>
                          </div>
                          <div className="text-right">
                            {score.position === 1 && (
                              <div className="text-2xl mb-1">🏆</div>
                            )}
                          </div>
                        </div>

                        {/* Score Summary */}
                        <div className="grid grid-cols-3 gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                          <div className="text-center">
                            <div className="text-xs text-green-100 mb-1">To Par</div>
                            <div className="text-xl font-bold">{toParDisplay}</div>
                          </div>
                          <div className="text-center border-l border-r border-white/20">
                            <div className="text-xs text-green-100 mb-1">Thru</div>
                            <div className="text-xl font-bold">18</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-green-100 mb-1">Total</div>
                            <div className="text-xl font-bold">{score.netScore}</div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="bg-white p-4 border-t-2 border-green-400">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-xs text-apple-gray-500 font-semibold uppercase mb-1">Gross Score</div>
                              <div className="text-2xl font-bold text-apple-gray-900">{score.grossScore}</div>
                            </div>
                            <div>
                              <div className="text-xs text-apple-gray-500 font-semibold uppercase mb-1">Handicap Used</div>
                              <div className="text-2xl font-bold text-apple-gray-900">{score.handicapAtTime}</div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-apple-gray-500 font-semibold uppercase mb-1">Position</div>
                              <div className="text-lg font-bold text-apple-gray-900">
                                {score.position
                                  ? `${score.position}${
                                      score.position === 1
                                        ? 'st'
                                        : score.position === 2
                                        ? 'nd'
                                        : score.position === 3
                                        ? 'rd'
                                        : 'th'
                                    }`
                                  : 'N/A'}
                              </div>
                            </div>
                            {score.tournament?.format && (
                              <div>
                                <div className="text-xs text-apple-gray-500 font-semibold uppercase mb-1">Format</div>
                                <div className="text-lg font-bold text-apple-gray-900">{score.tournament.format}</div>
                              </div>
                            )}
                          </div>
                          {score.tournament?.format === 'Stableford' && score.stablefordPoints && (
                            <div className="mt-4 pt-4 border-t border-apple-gray-200">
                              <div className="text-xs text-apple-gray-500 font-semibold uppercase mb-1">Stableford Points</div>
                              <div className="text-2xl font-bold text-green-600">{score.stablefordPoints}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⛳</div>
                <p className="text-apple-gray-600">No rounds played yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Handicap Adjustment Modal */}
        {showHandicapModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-apple-lg max-w-md w-full">
              <div className="p-6 border-b border-apple-gray-200">
                <h3 className="text-2xl font-bold text-apple-gray-900">
                  Adjust Handicap
                </h3>
                <p className="text-apple-gray-600 text-sm mt-1">
                  {member.firstName} {member.lastName}
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-apple-gray-700 font-semibold mb-2 text-sm">
                    New Handicap *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newHandicap}
                    onChange={(e) => setNewHandicap(e.target.value)}
                    placeholder="e.g., 12.5"
                    className="w-full px-4 py-3 border border-apple-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent text-apple-gray-900"
                  />
                  <p className="text-apple-gray-500 text-xs mt-1">
                    Current: {member.currentHandicap !== null ? member.currentHandicap : 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-apple-gray-700 font-semibold mb-2 text-sm">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g., Manual adjustment"
                    className="w-full px-4 py-3 border border-apple-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent text-apple-gray-900"
                  />
                </div>
              </div>

              <div className="p-6 border-t border-apple-gray-200 flex space-x-3">
                <button
                  onClick={() => {
                    setShowHandicapModal(false);
                    setNewHandicap('');
                    setReason('');
                  }}
                  className="flex-1 px-6 py-3 bg-apple-gray-100 text-apple-gray-700 rounded-xl font-semibold hover:bg-apple-gray-200 transition-all"
                  disabled={adjusting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdjustHandicap}
                  disabled={adjusting}
                  className="flex-1 px-6 py-3 bg-apple-blue text-white rounded-xl font-semibold hover:bg-apple-blue/90 disabled:opacity-50 transition-all shadow-sm"
                >
                  {adjusting ? 'Adjusting...' : 'Adjust Handicap'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MemberProfile;
