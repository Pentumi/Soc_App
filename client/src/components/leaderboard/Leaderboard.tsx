import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../common/Layout';
import { usersAPI, tournamentsAPI, scoresAPI } from '../../services/api';
import { User, Tournament, TournamentScore } from '../../types';

const Leaderboard: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [nextTournament, setNextTournament] = useState<Tournament | null>(null);
  const [scores, setScores] = useState<TournamentScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membersData, tournamentsData] = await Promise.all([
        usersAPI.getAll(),
        tournamentsAPI.getAll(),
      ]);

      // Sort members by handicap (lowest first)
      const sortedMembers = membersData.sort((a, b) => {
        if (a.currentHandicap === null) return 1;
        if (b.currentHandicap === null) return -1;
        return a.currentHandicap - b.currentHandicap;
      });
      setMembers(sortedMembers);

      // Find next upcoming tournament
      const upcoming = tournamentsData
        .filter((t) => t.status === 'upcoming')
        .sort((a, b) => new Date(a.tournamentDate).getTime() - new Date(b.tournamentDate).getTime());

      if (upcoming.length > 0) {
        const next = upcoming[0];
        setNextTournament(next);

        // Fetch scores for this tournament
        const scoresData = await scoresAPI.getLeaderboard(next.id);
        setScores(scoresData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
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

  // Get player status for the tournament
  const getPlayerStatus = (memberId: number) => {
    const score = scores.find((s) => s.userId === memberId);
    if (score) {
      return {
        status: 'entered',
        score: score.netScore,
        gross: score.grossScore,
      };
    }
    return { status: 'not_started' };
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 pb-24">
        <h1 className="text-3xl md:text-4xl font-bold text-apple-gray-900 tracking-tight mb-2">
          Leaderboard
        </h1>
        <p className="text-apple-gray-600 text-sm md:text-base mb-6 md:mb-8">Society rankings and upcoming tournament</p>

        {nextTournament && (
          <Link
            to={`/tournaments/${nextTournament.id}`}
            className="block bg-gradient-to-r from-apple-blue to-apple-purple rounded-2xl shadow-apple-lg mb-6 overflow-hidden hover:shadow-apple transition-all"
          >
            <div className="p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-sm font-semibold uppercase tracking-wide mb-2">
                    Next Event
                  </p>
                  <h2 className="text-3xl font-bold mb-2">{nextTournament.name}</h2>
                  <p className="text-white/90 mb-1">{nextTournament.course?.name}</p>
                  <p className="text-white/70 text-sm">{nextTournament.course?.location}</p>
                  <div className="flex items-center space-x-3 mt-3">
                    <span className="text-white/90 text-sm font-medium">
                      {new Date(nextTournament.tournamentDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    {nextTournament.startTime && (
                      <>
                        <span className="text-white/50">•</span>
                        <span className="text-white/90 text-sm">{nextTournament.startTime}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-white">
                    {nextTournament.format}
                  </span>
                  {nextTournament.isMajor && (
                    <span className="bg-apple-yellow/30 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-white">
                      MAJOR
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        )}

        <div className="bg-white rounded-2xl shadow-apple border border-apple-gray-200 overflow-hidden">
          <div className="p-6 border-b border-apple-gray-200">
            <h2 className="text-2xl font-bold text-apple-gray-900">
              {nextTournament ? 'Player Status' : 'Handicap Rankings'}
            </h2>
            <p className="text-apple-gray-600 text-sm mt-1">
              {nextTournament
                ? `Ordered by handicap for ${nextTournament.name}`
                : 'Current society handicap standings'}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-apple-gray-50">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                    Handicap
                  </th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                    {nextTournament ? 'Status' : 'Role'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-apple-gray-200">
                {members.map((member, index) => {
                  const playerStatus = nextTournament ? getPlayerStatus(member.id) : null;
                  return (
                    <tr
                      key={member.id}
                      className={`transition-colors ${
                        index < 3 && !nextTournament
                          ? 'bg-gradient-to-r from-apple-yellow/5 to-transparent'
                          : 'hover:bg-apple-gray-50'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {!nextTournament && index === 0 && <span className="text-2xl">🥇</span>}
                          {!nextTournament && index === 1 && <span className="text-2xl">🥈</span>}
                          {!nextTournament && index === 2 && <span className="text-2xl">🥉</span>}
                          <span className="text-sm font-semibold text-apple-gray-900">
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-apple-blue to-apple-purple rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm">
                            {member.firstName[0]}
                            {member.lastName[0]}
                          </div>
                          <span className="text-sm font-medium text-apple-gray-900">
                            {member.firstName} {member.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="text-center py-4 px-6">
                        <span className="text-2xl font-bold text-apple-gray-900">
                          {member.currentHandicap !== null ? member.currentHandicap : 'N/A'}
                        </span>
                      </td>
                      <td className="text-center py-4 px-6">
                        {nextTournament && playerStatus ? (
                          playerStatus.status === 'entered' ? (
                            <div className="flex flex-col items-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-apple-green/10 text-apple-green mb-1">
                                Score Entered
                              </span>
                              <span className="text-xs text-apple-gray-600">
                                Net: {playerStatus.score} (Gross: {playerStatus.gross})
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-apple-gray-200 text-apple-gray-700">
                              Not Started
                            </span>
                          )
                        ) : (
                          member.role === 'admin' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-apple-blue/10 text-apple-blue">
                              Admin
                            </span>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;
