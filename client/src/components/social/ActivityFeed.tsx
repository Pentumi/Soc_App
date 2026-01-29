import React, { useState, useEffect } from 'react';
import { followAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  TrophyIcon,
  PhotoIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface Activity {
  type: 'score' | 'photo';
  timestamp: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    profilePhoto?: string;
  };
  data: any;
}

const ActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const response = await followAPI.getFeed(1, 20);
      setActivities(response.activities);
      setHasMore(response.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderActivity = (activity: Activity) => {
    const { user, data } = activity;

    if (activity.type === 'score') {
      return (
        <div key={`${activity.type}-${data.tournament.id}-${user.id}`} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Link to={`/members/${user.id}`}>
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
              )}
            </Link>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <TrophyIcon className="w-5 h-5 text-yellow-500" />
                <Link
                  to={`/members/${user.id}`}
                  className="font-medium text-gray-900 hover:text-blue-600"
                >
                  {user.firstName} {user.lastName}
                </Link>
                <span className="text-gray-600">posted a score</span>
              </div>

              <Link
                to={`/tournaments/${data.tournament.id}`}
                className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-gray-900 mb-1">
                  {data.tournament.name}
                </p>
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Gross:</span>{' '}
                    <span className="font-semibold text-gray-900">{data.grossScore}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Net:</span>{' '}
                    <span className="font-semibold text-blue-600">{data.netScore}</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(data.tournament.date).toLocaleDateString()}
                </p>
              </Link>

              <p className="text-xs text-gray-500 mt-2">
                {new Date(activity.timestamp).toRelativeTimeString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (activity.type === 'photo') {
      return (
        <div key={`${activity.type}-${data.photoId}`} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <Link to={`/members/${user.id}`}>
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {user.firstName[0]}{user.lastName[0]}
                </div>
              )}
            </Link>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <PhotoIcon className="w-5 h-5 text-blue-500" />
                <Link
                  to={`/members/${user.id}`}
                  className="font-medium text-gray-900 hover:text-blue-600"
                >
                  {user.firstName} {user.lastName}
                </Link>
                <span className="text-gray-600">uploaded a photo</span>
              </div>

              <div className="rounded-lg overflow-hidden">
                <img
                  src={data.photoUrl}
                  alt={data.caption || 'Photo'}
                  className="w-full max-h-80 object-cover"
                />
              </div>

              {data.caption && (
                <p className="mt-2 text-gray-700">{data.caption}</p>
              )}

              <p className="text-xs text-gray-500 mt-2">
                {new Date(activity.timestamp).toRelativeTimeString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No activity yet
        </h3>
        <p className="text-gray-600 mb-4">
          Follow other golfers to see their scores and photos
        </p>
        <Link
          to="/members"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserGroupIcon className="w-5 h-5" />
          Find Golfers to Follow
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map(renderActivity)}

      {hasMore && (
        <button
          onClick={() => {/* Load more */}}
          className="w-full py-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          Load More
        </button>
      )}
    </div>
  );
};

// Helper to format relative time
declare global {
  interface Date {
    toRelativeTimeString(): string;
  }
}

Date.prototype.toRelativeTimeString = function() {
  const now = new Date();
  const diffMs = now.getTime() - this.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return this.toLocaleDateString();
};

export default ActivityFeed;
