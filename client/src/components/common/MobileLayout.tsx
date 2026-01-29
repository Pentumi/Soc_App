import React from 'react';
import BottomNav from './BottomNav';

interface MobileLayoutProps {
  children: React.ReactNode;
  showBottomNav?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  showBottomNav = true,
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content with bottom padding on mobile to avoid nav overlap */}
      <main className={`flex-1 ${showBottomNav ? 'pb-16 md:pb-0' : ''}`}>
        {children}
      </main>

      {/* Bottom navigation - only shown on mobile */}
      {showBottomNav && <BottomNav />}
    </div>
  );
};

export default MobileLayout;
