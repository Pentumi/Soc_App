import React, { useState } from 'react';
import { societyAPI } from '../../services/api';

interface SocietySetupModalProps {
  onSuccess: () => void;
}

const SocietySetupModal: React.FC<SocietySetupModalProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [defaultFormat, setDefaultFormat] = useState('Stroke Play');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please enter a society name');
      return;
    }

    setCreating(true);
    setError('');

    try {
      await societyAPI.create({
        name: name.trim(),
        defaultFormat,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create society');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-apple-lg max-w-md w-full">
        <div className="p-6 border-b border-apple-gray-200">
          <h2 className="text-2xl font-bold text-apple-gray-900">
            Welcome! Set Up Your Golf Society
          </h2>
          <p className="text-apple-gray-600 text-sm mt-2">
            Let's get started by creating your society
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-apple-gray-700 font-semibold mb-2">
              Society Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Sunset Golf Society"
              className="w-full px-4 py-3 border border-apple-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent text-apple-gray-900"
              disabled={creating}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-apple-gray-700 font-semibold mb-2">
              Default Tournament Format *
            </label>
            <p className="text-apple-gray-500 text-xs mb-3">
              You can change this for individual tournaments
            </p>
            <select
              value={defaultFormat}
              onChange={(e) => setDefaultFormat(e.target.value)}
              className="w-full px-4 py-3 border border-apple-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent text-apple-gray-900"
              disabled={creating}
            >
              <option value="Stroke Play">Stroke Play</option>
              <option value="Stableford">Stableford</option>
              <option value="Match Play">Match Play</option>
              <option value="Scramble">Scramble</option>
            </select>
            <div className="mt-3 space-y-2">
              <div className="text-xs text-apple-gray-600">
                <span className="font-semibold">Stroke Play:</span> Count total strokes
              </div>
              <div className="text-xs text-apple-gray-600">
                <span className="font-semibold">Stableford:</span> Points based on score vs par
              </div>
              <div className="text-xs text-apple-gray-600">
                <span className="font-semibold">Match Play:</span> Hole-by-hole competition
              </div>
              <div className="text-xs text-apple-gray-600">
                <span className="font-semibold">Scramble:</span> Team best ball format
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-apple-red/10 border border-apple-red/20 rounded-xl p-4">
              <p className="text-apple-red text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-apple-blue text-white px-6 py-3 rounded-xl font-semibold hover:bg-apple-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
          >
            {creating ? 'Creating Society...' : 'Create Society'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SocietySetupModal;
