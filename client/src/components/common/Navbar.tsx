import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { societyAPI } from '../../services/api';
import { Society } from '../../types';

const Navbar: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [society, setSociety] = useState<Society | null>(null);

  useEffect(() => {
    const fetchSociety = async () => {
      try {
        const societyData = await societyAPI.get();
        setSociety(societyData);
      } catch (error) {
        // Society not set up yet, ignore
      }
    };
    fetchSociety();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-white border-b border-apple-gray-200 shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="text-xl md:text-2xl font-bold text-apple-gray-900 tracking-tight hover:text-apple-blue transition-colors truncate max-w-xs md:max-w-none">
              {society?.name || 'Golf Society'}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link
                to="/dashboard"
                className="px-4 py-2 text-sm font-medium text-apple-gray-700 hover:text-apple-blue hover:bg-apple-gray-50 rounded-lg transition-all"
              >
                Dashboard
              </Link>
              <Link
                to="/tournaments"
                className="px-4 py-2 text-sm font-medium text-apple-gray-700 hover:text-apple-blue hover:bg-apple-gray-50 rounded-lg transition-all"
              >
                Tournaments
              </Link>
              <Link
                to="/members"
                className="px-4 py-2 text-sm font-medium text-apple-gray-700 hover:text-apple-blue hover:bg-apple-gray-50 rounded-lg transition-all"
              >
                Members
              </Link>
              <Link
                to="/leaderboard"
                className="px-4 py-2 text-sm font-medium text-apple-gray-700 hover:text-apple-blue hover:bg-apple-gray-50 rounded-lg transition-all"
              >
                Leaderboard
              </Link>
              <Link
                to="/golfer-of-the-year"
                className="px-4 py-2 text-sm font-medium text-apple-gray-700 hover:text-apple-blue hover:bg-apple-gray-50 rounded-lg transition-all"
              >
                GOTY
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to="/courses"
                    className="px-4 py-2 text-sm font-medium text-apple-gray-700 hover:text-apple-blue hover:bg-apple-gray-50 rounded-lg transition-all"
                  >
                    Courses
                  </Link>
                  <Link
                    to="/admin"
                    className="px-4 py-2 text-sm font-medium text-apple-gray-700 hover:text-apple-blue hover:bg-apple-gray-50 rounded-lg transition-all"
                  >
                    Admin
                  </Link>
                </>
              )}
              <div className="flex items-center space-x-3 ml-4 pl-4 border-l border-apple-gray-200">
                <Link
                  to={`/members/${user?.id}`}
                  className="text-right hover:opacity-75 transition-opacity"
                >
                  <div className="text-sm font-semibold text-apple-gray-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  {user?.currentHandicap !== null && (
                    <div className="text-xs text-apple-gray-500">
                      Handicap: {user?.currentHandicap}
                    </div>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-apple-gray-100 text-apple-gray-700 px-4 py-2 rounded-lg hover:bg-apple-gray-200 font-medium text-sm transition-all"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-apple-gray-50 transition-all"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-apple-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu}></div>
          <div className="fixed top-16 left-0 right-0 bg-white border-b border-apple-gray-200 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-base font-medium text-apple-gray-700 hover:text-apple-blue hover:bg-apple-gray-50 rounded-lg transition-all"
              >
                Dashboard
              </Link>
              <Link
                to="/tournaments"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-base font-medium text-apple-gray-700 hover:text-apple-blue hover:bg-apple-gray-50 rounded-lg transition-all"
              >
                Tournaments
              </Link>
              <Link
                to="/members"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-base font-medium text-apple-gray-700 hover:text-apple-blue hover:bg-apple-gray-50 rounded-lg transition-all"
              >
                Members
              </Link>
              <Link
                to="/leaderboard"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-base font-medium text-apple-gray-700 hover:text-apple-blue hover:bg-apple-gray-50 rounded-lg transition-all"
              >
                Leaderboard
              </Link>
              <Link
                to="/golfer-of-the-year"
                onClick={closeMobileMenu}
                className="block px-4 py-3 text-base font-medium text-apple-gray-700 hover:text-apple-blue hover:bg-apple-gray-50 rounded-lg transition-all"
              >
                Golfer of the Year
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to="/courses"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 text-base font-medium text-apple-gray-700 hover:text-apple-blue hover:bg-apple-gray-50 rounded-lg transition-all"
                  >
                    Courses
                  </Link>
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 text-base font-medium text-apple-gray-700 hover:text-apple-blue hover:bg-apple-gray-50 rounded-lg transition-all"
                  >
                    Admin
                  </Link>
                </>
              )}
              <div className="pt-4 mt-4 border-t border-apple-gray-200">
                <Link
                  to={`/members/${user?.id}`}
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 hover:bg-apple-gray-50 rounded-lg transition-all"
                >
                  <div className="text-base font-semibold text-apple-gray-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  {user?.currentHandicap !== null && (
                    <div className="text-sm text-apple-gray-500">
                      Handicap: {user?.currentHandicap}
                    </div>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 bg-apple-gray-100 text-apple-gray-700 px-4 py-3 rounded-lg hover:bg-apple-gray-200 font-medium text-base transition-all text-left"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
