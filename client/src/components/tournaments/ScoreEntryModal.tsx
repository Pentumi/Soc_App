import React, { useState, useEffect } from 'react';
import { scoresAPI } from '../../services/api';
import { User, TournamentScore, Tournament, HoleScoreInput } from '../../types';

interface ScoreEntryModalProps {
  tournament: Tournament;
  members: User[];
  existingScores: TournamentScore[];
  onClose: () => void;
  onSuccess: () => void;
}

const ScoreEntryModal: React.FC<ScoreEntryModalProps> = ({
  tournament,
  members,
  existingScores,
  onClose,
  onSuccess,
}) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [holeScores, setHoleScores] = useState<{ [holeId: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const holes = tournament.course?.holes || [];
  const coursePar = tournament.course?.par || 72;

  // Initialize hole scores with par values
  useEffect(() => {
    const initialScores: { [holeId: number]: string } = {};
    holes.forEach((hole) => {
      initialScores[hole.id] = hole.par.toString();
    });
    setHoleScores(initialScores);
  }, [holes]);

  const frontNineHoles = holes.filter((h) => h.holeNumber <= 9);
  const backNineHoles = holes.filter((h) => h.holeNumber > 9);

  const calculateTotal = (holesList: typeof holes) => {
    return holesList.reduce((sum, hole) => {
      const score = parseInt(holeScores[hole.id] || '0');
      return sum + (isNaN(score) ? 0 : score);
    }, 0);
  };

  const frontNineTotal = calculateTotal(frontNineHoles);
  const backNineTotal = calculateTotal(backNineHoles);
  const totalGross = frontNineTotal + backNineTotal;
  const vsPar = totalGross - coursePar;

  const handleScoreChange = (holeId: number, value: string) => {
    setHoleScores((prev) => ({
      ...prev,
      [holeId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate all holes have scores
    const allHolesHaveScores = holes.every((hole) => {
      const score = holeScores[hole.id];
      return score && !isNaN(parseInt(score));
    });

    if (!allHolesHaveScores) {
      setError('Please enter a score for all holes');
      setLoading(false);
      return;
    }

    try {
      const holeScoresData: HoleScoreInput[] = holes.map((hole) => ({
        holeId: hole.id,
        strokes: parseInt(holeScores[hole.id]),
      }));

      await scoresAPI.submitScore({
        tournamentId: tournament.id,
        userId: parseInt(selectedUserId),
        holeScores: holeScoresData,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit score');
    } finally {
      setLoading(false);
    }
  };

  const availableMembers = members.filter(
    (member) => !existingScores.some((score) => score.userId === member.id)
  );

  const renderHoleRow = (label: string, holes: typeof frontNineHoles, showTotal: boolean = false) => (
    <>
      <tr className="border-b">
        <td className="font-semibold py-2 px-2 text-sm bg-gray-50">{label}</td>
        {holes.map((hole) => (
          <td key={hole.id} className="text-center py-2 px-1 text-sm">
            {hole.holeNumber}
          </td>
        ))}
        {showTotal && <td className="text-center py-2 px-2 font-semibold bg-gray-50 text-sm">Total</td>}
      </tr>
    </>
  );

  const renderParRow = (holes: typeof frontNineHoles, showTotal: boolean = false) => {
    const parTotal = holes.reduce((sum, h) => sum + h.par, 0);
    return (
      <tr className="border-b">
        <td className="font-semibold py-2 px-2 text-sm bg-blue-50">Par</td>
        {holes.map((hole) => (
          <td key={hole.id} className="text-center py-2 px-1 text-sm bg-blue-50">
            {hole.par}
          </td>
        ))}
        {showTotal && (
          <td className="text-center py-2 px-2 font-semibold bg-blue-100 text-sm">{parTotal}</td>
        )}
      </tr>
    );
  };

  const renderStrokeIndexRow = (holes: typeof frontNineHoles, showTotal: boolean = false) => (
    <tr className="border-b">
      <td className="font-semibold py-2 px-2 text-xs bg-gray-50">SI</td>
      {holes.map((hole) => (
        <td key={hole.id} className="text-center py-2 px-1 text-xs text-gray-600">
          {hole.strokeIndex || '-'}
        </td>
      ))}
      {showTotal && <td className="bg-gray-50"></td>}
    </tr>
  );

  const renderScoreRow = (holes: typeof frontNineHoles, total: number) => (
    <tr className="border-b">
      <td className="font-semibold py-2 px-2 text-sm bg-yellow-50">Score</td>
      {holes.map((hole) => (
        <td key={hole.id} className="text-center py-1 px-1">
          <input
            type="number"
            value={holeScores[hole.id] || ''}
            onChange={(e) => handleScoreChange(hole.id, e.target.value)}
            className="w-10 text-center border border-gray-300 rounded py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
            min="1"
            max="15"
          />
        </td>
      ))}
      <td className="text-center py-2 px-2 font-bold bg-yellow-100 text-sm">{total}</td>
    </tr>
  );

  if (holes.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p className="text-red-600 mb-4">
            This course does not have hole data configured. Please add hole information to the course first.
          </p>
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4 my-8">
        <h2 className="text-2xl font-bold mb-4">Enter Scorecard</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Player</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a player</option>
              {availableMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName} (HC: {member.currentHandicap || 'N/A'})
                </option>
              ))}
            </select>
            {availableMembers.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">All members have scores entered</p>
            )}
          </div>

          <div className="mb-4">
            <p className="text-gray-700">
              <span className="font-semibold">Course:</span> {tournament.course?.name} - Par {coursePar}
            </p>
          </div>

          {/* Front Nine */}
          <div className="mb-6 overflow-x-auto">
            <h3 className="font-bold text-lg mb-2">Front Nine</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                {renderHoleRow('Hole', frontNineHoles, true)}
                {renderParRow(frontNineHoles, true)}
                {renderStrokeIndexRow(frontNineHoles, true)}
              </thead>
              <tbody>{renderScoreRow(frontNineHoles, frontNineTotal)}</tbody>
            </table>
          </div>

          {/* Back Nine */}
          <div className="mb-6 overflow-x-auto">
            <h3 className="font-bold text-lg mb-2">Back Nine</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                {renderHoleRow('Hole', backNineHoles, true)}
                {renderParRow(backNineHoles, true)}
                {renderStrokeIndexRow(backNineHoles, true)}
              </thead>
              <tbody>{renderScoreRow(backNineHoles, backNineTotal)}</tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg">
                  <span className="font-semibold">Total Gross Score:</span>{' '}
                  <span className="text-2xl font-bold">{totalGross}</span>
                </p>
              </div>
              <div>
                <p className="text-lg">
                  <span className="font-semibold">vs Par:</span>{' '}
                  <span
                    className={`text-2xl font-bold ${
                      vsPar < 0 ? 'text-green-600' : vsPar > 0 ? 'text-red-600' : 'text-gray-600'
                    }`}
                  >
                    {vsPar > 0 ? '+' : ''}
                    {vsPar}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || availableMembers.length === 0}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Submitting...' : 'Submit Scorecard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScoreEntryModal;
