import React, { useState } from 'react';
import { tournamentsAPI } from '../../services/api';
import { Course, Tournament } from '../../types';

interface EditTournamentModalProps {
  tournament: Tournament;
  courses: Course[];
  onClose: () => void;
  onSuccess: (tournament: Tournament) => void;
}

const EditTournamentModal: React.FC<EditTournamentModalProps> = ({
  tournament,
  courses,
  onClose,
  onSuccess,
}) => {
  const hasScores = (tournament.tournamentScores?.length || 0) > 0;

  const [formData, setFormData] = useState({
    name: tournament.name,
    courseId: tournament.courseId.toString(),
    tournamentDate: tournament.tournamentDate.split('T')[0],
    startTime: tournament.startTime || '09:00',
    format: tournament.format,
    isMajor: tournament.isMajor,
  });
  const [allowEditWithScores, setAllowEditWithScores] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updateData: any = {
        name: formData.name,
        courseId: parseInt(formData.courseId),
        tournamentDate: formData.tournamentDate,
        startTime: formData.startTime,
        format: formData.format,
        isMajor: formData.isMajor,
      };

      if (hasScores) {
        updateData.allowEditWithScores = allowEditWithScores;
      }

      const updatedTournament = await tournamentsAPI.update(tournament.id, updateData);
      onSuccess(updatedTournament);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Edit Tournament</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {hasScores && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
            <p className="font-medium mb-1">Warning: This tournament has existing scores</p>
            <p className="text-sm">Changes may affect leaderboard and handicap calculations.</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Tournament Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Course
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={hasScores}
              title={hasScores ? 'Cannot change course when tournament has scores' : ''}
              required
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} - {course.location}
                </option>
              ))}
            </select>
            {hasScores && (
              <p className="text-sm text-gray-500 mt-1">
                Cannot change course when tournament has scores
              </p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Format
            </label>
            <select
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Stroke Play">Stroke Play</option>
              <option value="Stableford">Stableford</option>
              <option value="Match Play">Match Play</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.tournamentDate}
              onChange={(e) => setFormData({ ...formData, tournamentDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isMajor}
                onChange={(e) => setFormData({ ...formData, isMajor: e.target.checked })}
                className="mr-2"
              />
              <span className="text-gray-700">Major Tournament (affects handicaps)</span>
            </label>
          </div>

          {hasScores && (
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={allowEditWithScores}
                  onChange={(e) => setAllowEditWithScores(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-gray-700 text-sm">
                  I understand this tournament has scores and want to proceed with the update
                </span>
              </label>
            </div>
          )}

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
              disabled={loading || (hasScores && !allowEditWithScores)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTournamentModal;
