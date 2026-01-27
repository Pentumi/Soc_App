import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../common/Layout';
import { societyAPI } from '../../services/api';
import { Society } from '../../types';

const AdminPanel: React.FC = () => {
  const [society, setSociety] = useState<Society | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [societyName, setSocietyName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSociety();
  }, []);

  const fetchSociety = async () => {
    try {
      const data = await societyAPI.get();
      setSociety(data);
      setSocietyName(data.name);
    } catch (error) {
      console.error('Failed to fetch society:', error);
    }
  };

  const handleSaveSocietyName = async () => {
    if (!societyName.trim()) {
      alert('Society name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const updated = await societyAPI.update({ name: societyName });
      setSociety(updated);
      setIsEditing(false);
      alert('Society name updated successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update society name');
    } finally {
      setSaving(false);
    }
  };

  const adminSections = [
    {
      title: 'Manage Courses',
      description: 'Add, edit, or remove golf courses',
      link: '/courses',
      icon: '⛳',
      color: 'from-apple-green to-emerald-500',
    },
    {
      title: 'Manage Members',
      description: 'View and manage society members',
      link: '/members',
      icon: '👥',
      color: 'from-apple-blue to-indigo-500',
    },
    {
      title: 'Manage Tournaments',
      description: 'Create and manage tournaments',
      link: '/tournaments',
      icon: '🏆',
      color: 'from-apple-yellow to-amber-500',
    },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <h1 className="text-3xl md:text-4xl font-bold text-apple-gray-900 tracking-tight mb-2">
          Admin Panel
        </h1>
        <p className="text-apple-gray-600 text-sm md:text-base mb-6 md:mb-8">
          Manage your golf society settings and data
        </p>

        {/* Society Settings */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-apple border border-apple-gray-200 p-4 md:p-6 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-apple-gray-900 mb-4">Society Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-apple-gray-700 mb-2">
                Society Name
              </label>
              {isEditing ? (
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    value={societyName}
                    onChange={(e) => setSocietyName(e.target.value)}
                    className="flex-1 px-4 py-2 border border-apple-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-apple-blue focus:border-transparent"
                    placeholder="Enter society name"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveSocietyName}
                      disabled={saving}
                      className="flex-1 md:flex-none bg-apple-blue text-white px-6 py-2 rounded-xl font-semibold text-sm hover:bg-apple-blue/90 disabled:opacity-50 transition-all"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setSocietyName(society?.name || '');
                      }}
                      disabled={saving}
                      className="flex-1 md:flex-none bg-apple-gray-100 text-apple-gray-700 px-6 py-2 rounded-xl font-semibold text-sm hover:bg-apple-gray-200 disabled:opacity-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <span className="text-lg md:text-xl font-bold text-apple-gray-900 mb-3 md:mb-0">
                    {society?.name || 'Not set'}
                  </span>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full md:w-auto bg-apple-gray-100 text-apple-gray-700 px-6 py-2 rounded-xl font-semibold text-sm hover:bg-apple-gray-200 transition-all"
                  >
                    Edit Name
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.link}
              to={section.link}
              className="group bg-white rounded-2xl shadow-apple border border-apple-gray-200 hover:shadow-apple-lg transition-all overflow-hidden"
            >
              <div className={`h-2 bg-gradient-to-r ${section.color}`}></div>
              <div className="p-6">
                <div className="text-5xl mb-4">{section.icon}</div>
                <h3 className="text-xl font-bold text-apple-gray-900 mb-2 group-hover:text-apple-blue transition-colors">
                  {section.title}
                </h3>
                <p className="text-apple-gray-600 text-sm">{section.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-2xl shadow-apple border border-apple-gray-200 p-8">
          <h2 className="text-2xl font-bold text-apple-gray-900 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-apple-gray-600 text-sm font-semibold uppercase tracking-wide mb-1">
                Total Courses
              </p>
              <p className="text-3xl font-bold text-apple-gray-900">478</p>
              <p className="text-apple-gray-500 text-xs mt-1">Irish golf courses</p>
            </div>
            <div>
              <p className="text-apple-gray-600 text-sm font-semibold uppercase tracking-wide mb-1">
                Accurate Data
              </p>
              <p className="text-3xl font-bold text-apple-green">6</p>
              <p className="text-apple-gray-500 text-xs mt-1">Courses with verified stroke indexes</p>
            </div>
            <div>
              <p className="text-apple-gray-600 text-sm font-semibold uppercase tracking-wide mb-1">
                Database Status
              </p>
              <p className="text-3xl font-bold text-apple-blue">✓</p>
              <p className="text-apple-gray-500 text-xs mt-1">All systems operational</p>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-apple-gray-100 rounded-2xl p-6 border border-apple-gray-200">
          <h3 className="text-lg font-semibold text-apple-gray-900 mb-2">
            Need Help?
          </h3>
          <p className="text-apple-gray-600 text-sm">
            For assistance with admin functions or to report issues, contact the system administrator.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanel;
