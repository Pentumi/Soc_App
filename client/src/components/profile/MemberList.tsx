import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../common/Layout';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import { User } from '../../types';
import CreateMemberModal from './CreateMemberModal';

const MemberList: React.FC = () => {
  const { isAdmin } = useAuth();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const data = await usersAPI.getAll();
      setMembers(data);
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberCreated = (newMember: User) => {
    setMembers([...members, newMember]);
    setShowCreateModal(false);
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

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-apple-gray-900 tracking-tight">Society Members</h1>
            {isAdmin && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="hidden md:block bg-apple-blue text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-apple-blue/90 transition-all shadow-sm hover:shadow-md"
              >
                Add Member
              </button>
            )}
          </div>
          <p className="text-apple-gray-600 text-sm md:text-base">View all members and their handicaps</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => (
            <Link
              key={member.id}
              to={`/members/${member.id}`}
              className="bg-white rounded-2xl shadow-apple border border-apple-gray-200 hover:shadow-apple-lg transition-all overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-apple-blue to-apple-purple rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-sm">
                    {member.firstName[0]}
                    {member.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-apple-gray-900 mb-1">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-apple-gray-600 text-sm">
                      Handicap:{' '}
                      <span className="font-semibold text-apple-gray-900">
                        {member.currentHandicap !== null ? member.currentHandicap : 'N/A'}
                      </span>
                    </p>
                    {member.role === 'admin' && (
                      <span className="inline-flex items-center text-xs bg-apple-blue/10 text-apple-blue px-2 py-1 rounded-full font-semibold mt-2">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {showCreateModal && (
          <CreateMemberModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleMemberCreated}
          />
        )}

        {/* Floating Action Button for Mobile */}
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="md:hidden fixed bottom-24 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
            aria-label="Add member"
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

export default MemberList;
