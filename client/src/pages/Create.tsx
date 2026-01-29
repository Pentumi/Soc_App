import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import MobileLayout from '../components/common/MobileLayout';
import {
  UserGroupIcon,
  TrophyIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

type CreateType = 'club' | 'league' | 'tournament' | null;

interface CreateOption {
  type: CreateType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const createOptions: CreateOption[] = [
  {
    type: 'club',
    title: 'Create a Club',
    description: 'Start your own golf society or group',
    icon: UserGroupIcon,
    color: 'bg-blue-500',
  },
  {
    type: 'league',
    title: 'Create a League',
    description: 'Run a season-based competition',
    icon: TrophyIcon,
    color: 'bg-yellow-500',
  },
  {
    type: 'tournament',
    title: 'Create a Tournament',
    description: 'Organize a single golf event',
    icon: CalendarIcon,
    color: 'bg-green-500',
  },
];

const Create: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get('type') as CreateType;
  const [selectedType, setSelectedType] = useState<CreateType>(typeParam);

  const handleSelectType = (type: CreateType) => {
    setSelectedType(type);

    // Navigate to respective creation pages
    switch (type) {
      case 'club':
        // In production, this would navigate to club creation page
        alert('Club creation - coming soon!');
        break;
      case 'league':
        // In production, this would navigate to league creation page
        alert('League creation - coming soon!');
        break;
      case 'tournament':
        // In production, this would navigate to tournament creation page
        navigate('/tournaments?action=create');
        break;
    }
  };

  return (
    <MobileLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Something New
          </h1>
          <p className="text-gray-600">
            Choose what you'd like to create
          </p>
        </div>

        {/* Create Options */}
        <div className="grid gap-6 md:grid-cols-3">
          {createOptions.map((option) => {
            const Icon = option.icon;

            return (
              <button
                key={option.type}
                onClick={() => handleSelectType(option.type)}
                className="group relative bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-blue-400 hover:shadow-xl transition-all text-left"
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 ${option.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {option.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600">
                  {option.description}
                </p>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-blue-50 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
            );
          })}
        </div>

        {/* Help Text */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Quick Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Clubs</strong> are the main organization for your golf group</li>
            <li>• <strong>Leagues</strong> run season-based competitions within a club</li>
            <li>• <strong>Tournaments</strong> are individual events that can be part of leagues</li>
          </ul>
        </div>

        {/* Alternative Actions */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">Already have an invite code?</p>
          <button
            onClick={() => {
              const code = prompt('Enter invite code:');
              if (code) {
                // Handle join by code
                console.log('Join with code:', code);
              }
            }}
            className="px-6 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-400 transition-colors font-medium"
          >
            Join with Invite Code
          </button>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Create;
