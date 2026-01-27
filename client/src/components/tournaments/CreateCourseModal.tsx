import React, { useState } from 'react';
import { coursesAPI } from '../../services/api';
import { Course } from '../../types';

interface CreateCourseModalProps {
  onClose: () => void;
  onSuccess: (course: Course) => void;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    par: '',
    slopeRating: '',
    courseRating: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const course = await coursesAPI.create({
        name: formData.name,
        location: formData.location || undefined,
        par: parseInt(formData.par),
        slopeRating: formData.slopeRating ? parseFloat(formData.slopeRating) : undefined,
        courseRating: formData.courseRating ? parseFloat(formData.courseRating) : undefined,
      });
      onSuccess(course);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Add New Course</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Course Name
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
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="City, County"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Par
            </label>
            <input
              type="number"
              value={formData.par}
              onChange={(e) => setFormData({ ...formData, par: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Slope Rating (optional)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.slopeRating}
              onChange={(e) => setFormData({ ...formData, slopeRating: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Course Rating (optional)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.courseRating}
              onChange={(e) => setFormData({ ...formData, courseRating: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Creating...' : 'Add Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;
