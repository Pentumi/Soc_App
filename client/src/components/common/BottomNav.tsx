import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  TrophyIcon,
  PlusCircleIcon,
  HeartIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  TrophyIcon as TrophyIconSolid,
  PlusCircleIcon as PlusCircleIconSolid,
  HeartIcon as HeartIconSolid,
  UserCircleIcon as UserCircleIconSolid,
} from '@heroicons/react/24/solid';

interface NavTab {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconSolid: React.ComponentType<{ className?: string }>;
}

const tabs: NavTab[] = [
  {
    path: '/home',
    label: 'Home',
    icon: HomeIcon,
    iconSolid: HomeIconSolid,
  },
  {
    path: '/leagues',
    label: 'Leagues',
    icon: TrophyIcon,
    iconSolid: TrophyIconSolid,
  },
  {
    path: '/create',
    label: 'Create',
    icon: PlusCircleIcon,
    iconSolid: PlusCircleIconSolid,
  },
  {
    path: '/social',
    label: 'Social',
    icon: HeartIcon,
    iconSolid: HeartIconSolid,
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: UserCircleIcon,
    iconSolid: UserCircleIconSolid,
  },
];

const BottomNav: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = active ? tab.iconSolid : tab.icon;

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                active
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
