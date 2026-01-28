import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../common/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface FlightData {
  flight: string;
  participants: any[];
  scores: any[];
  course: any;
  canEdit: boolean;
  isAdmin: boolean;
}

interface FlightInfo {
  flights: string[];
  currentUserFlight: string | null;
  isAdmin: boolean;
}

const GroupScorecard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [flightInfo, setFlightInfo] = useState<FlightInfo | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [flightData, setFlightData] = useState<FlightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFlights();
  }, [id]);

  useEffect(() => {
    if (selectedFlight) {
      fetchFlightData();
    }
  }, [selectedFlight]);

  const fetchFlights = async () => {
    try {
      const response = await api.get(`/scorecards/tournaments/${id}/flights`);
      setFlightInfo(response.data);

      // Auto-select user's flight if they have one
      if (response.data.currentUserFlight) {
        setSelectedFlight(response.data.currentUserFlight);
      } else if (response.data.flights.length > 0) {
        setSelectedFlight(response.data.flights[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load flights');
    } finally {
      setLoading(false);
    }
  };

  const fetchFlightData = async () => {
    if (!selectedFlight) return;

    try {
      const response = await api.get(`/scorecards/tournaments/${id}/flights/${selectedFlight}`);
      setFlightData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load flight data');
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

  if (error) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
          <button
            onClick={() => navigate(`/tournaments/${id}`)}
            className="mt-4 text-apple-blue hover:underline"
          >
            ← Back to Tournament
          </button>
        </div>
      </Layout>
    );
  }

  if (!flightInfo || flightInfo.flights.length === 0) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-apple-gray-100 rounded-xl p-8 text-center">
            <p className="text-apple-gray-600 mb-4">No flights have been set up for this tournament yet.</p>
            <button
              onClick={() => navigate(`/tournaments/${id}`)}
              className="text-apple-blue hover:underline"
            >
              ← Back to Tournament
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-apple-gray-900 tracking-tight">
              Flight Scorecards
            </h1>
            <p className="text-apple-gray-600 mt-1">View and edit scorecards for your flight</p>
          </div>
          <button
            onClick={() => navigate(`/tournaments/${id}`)}
            className="text-apple-blue hover:underline font-medium"
          >
            ← Back to Tournament
          </button>
        </div>

        {/* Flight Selector */}
        <div className="bg-white rounded-xl shadow-apple border border-apple-gray-200 p-4 mb-6">
          <label className="block text-sm font-semibold text-apple-gray-700 mb-2">
            Select Flight
          </label>
          <div className="flex gap-2 flex-wrap">
            {flightInfo.flights.map((flight) => (
              <button
                key={flight}
                onClick={() => setSelectedFlight(flight)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  selectedFlight === flight
                    ? 'bg-apple-blue text-white'
                    : 'bg-apple-gray-100 text-apple-gray-700 hover:bg-apple-gray-200'
                }`}
              >
                {flight}
                {flight === flightInfo.currentUserFlight && ' (Your Flight)'}
              </button>
            ))}
          </div>
        </div>

        {/* Flight Scorecard Table */}
        {flightData && (
          <div className="bg-white rounded-xl shadow-apple border border-apple-gray-200 overflow-hidden">
            <div className="p-4 border-b border-apple-gray-200 bg-apple-gray-50">
              <h2 className="text-xl font-bold text-apple-gray-900">
                Flight {flightData.flight}
                {flightData.canEdit && (
                  <span className="ml-2 text-sm font-normal text-apple-gray-600">
                    (You can edit scorecards in this flight)
                  </span>
                )}
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-apple-gray-50 border-b border-apple-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                      Handicap
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                      Gross
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                      Net
                    </th>
                    {flightData.course.format === 'Stableford' && (
                      <th className="text-center py-3 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                        Points
                      </th>
                    )}
                    <th className="text-center py-3 px-4 text-xs font-semibold text-apple-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-apple-gray-200">
                  {flightData.participants.map((participant) => {
                    const score = flightData.scores.find((s) => s.userId === participant.userId);
                    return (
                      <tr key={participant.id} className="hover:bg-apple-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-apple-blue to-apple-purple rounded-full flex items-center justify-center text-sm font-bold text-white">
                              {participant.user.firstName[0]}
                              {participant.user.lastName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-apple-gray-900">
                                {participant.user.firstName} {participant.user.lastName}
                              </div>
                              {participant.userId === user?.id && (
                                <div className="text-xs text-apple-blue">You</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4 text-apple-gray-900 font-semibold">
                          {participant.user.currentHandicap ?? 'N/A'}
                        </td>
                        <td className="text-center py-3 px-4 text-apple-gray-900 font-semibold">
                          {score ? score.grossScore : '-'}
                        </td>
                        <td className="text-center py-3 px-4 text-apple-gray-900 font-semibold">
                          {score ? score.netScore : '-'}
                        </td>
                        {flightData.course.format === 'Stableford' && (
                          <td className="text-center py-3 px-4 text-apple-gray-900 font-semibold">
                            {score?.stablefordPoints ?? '-'}
                          </td>
                        )}
                        <td className="text-center py-3 px-4">
                          {score ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-apple-green/10 text-apple-green">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-apple-gray-200 text-apple-gray-700">
                              Not Started
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 bg-apple-gray-100 rounded-xl p-6 border border-apple-gray-200">
          <h3 className="text-lg font-semibold text-apple-gray-900 mb-2">
            About Flight Scorecards
          </h3>
          <p className="text-apple-gray-600 text-sm">
            {flightInfo.isAdmin
              ? 'As a tournament admin, you can view and edit all flight scorecards.'
              : flightData?.canEdit
              ? 'You can view and edit scorecards for players in your flight.'
              : 'You can view scorecards for your flight. To edit scores, go to the main tournament page.'}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default GroupScorecard;
