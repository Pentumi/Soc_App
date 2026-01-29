import React, { useState } from 'react';
import MobileLayout from '../components/common/MobileLayout';
import ActivityFeed from '../components/social/ActivityFeed';
import {
  NewspaperIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

type TabType = 'feed' | 'chat' | 'photos' | 'following';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'feed', label: 'Feed', icon: NewspaperIcon },
  { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
  { id: 'photos', label: 'Photos', icon: PhotoIcon },
  { id: 'following', label: 'Following', icon: UserGroupIcon },
];

const Social: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('feed');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'feed':
        return <ActivityFeed />;

      case 'chat':
        return (
          <div className="space-y-4">
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No chats yet
              </h3>
              <p className="text-gray-600">
                Join clubs, leagues, or tournaments to start chatting
              </p>
            </div>
          </div>
        );

      case 'photos':
        return (
          <div className="space-y-4">
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No photos yet
              </h3>
              <p className="text-gray-600">
                Upload photos to your clubs and tournaments
              </p>
            </div>
          </div>
        );

      case 'following':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Following</div>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
                <div className="text-2xl font-bold text-gray-900">0</div>
                <div className="text-sm text-gray-600">Followers</div>
              </div>
            </div>
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Find golfers to follow
              </h3>
              <p className="text-gray-600">
                Search for friends and other golfers in your clubs
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MobileLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Social</h1>
          <p className="text-gray-600 mt-1">Connect with your golf community</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </MobileLayout>
  );
};

export default Social;
