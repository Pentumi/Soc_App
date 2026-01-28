import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData, ClubMembership } from '../types';
import { authAPI, clubsAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  clubs: ClubMembership[];
  currentClub: ClubMembership | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  setCurrentClub: (club: ClubMembership | null) => void;
  refreshClubs: () => Promise<void>;
  getClubRole: (clubId: number) => string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [clubs, setClubs] = useState<ClubMembership[]>([]);
  const [currentClub, setCurrentClubState] = useState<ClubMembership | null>(() => {
    const stored = localStorage.getItem('currentClub');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const refreshClubs = async () => {
    try {
      const userClubs = await clubsAPI.getUserClubs();
      setClubs(userClubs);

      // If current club is not in the list, clear it
      if (currentClub && !userClubs.find(c => c.id === currentClub.id)) {
        setCurrentClubState(null);
        localStorage.removeItem('currentClub');
      }

      // If no current club but user has clubs, set first one as current
      if (!currentClub && userClubs.length > 0) {
        setCurrentClubState(userClubs[0]);
        localStorage.setItem('currentClub', JSON.stringify(userClubs[0]));
      }
    } catch (error) {
      console.error('Failed to fetch clubs:', error);
    }
  };

  const setCurrentClub = (club: ClubMembership | null) => {
    setCurrentClubState(club);
    if (club) {
      localStorage.setItem('currentClub', JSON.stringify(club));
    } else {
      localStorage.removeItem('currentClub');
    }
  };

  const getClubRole = (clubId: number): string | null => {
    const club = clubs.find(c => c.id === clubId);
    return club ? club.userRole : null;
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const userData = await authAPI.getMe();
          setUser(userData);
          setToken(storedToken);
          await refreshClubs();
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authAPI.login(credentials);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('token', response.token);
    await refreshClubs();
  };

  const register = async (data: RegisterData) => {
    const response = await authAPI.register(data);
    setUser(response.user);
    setToken(response.token);
    localStorage.setItem('token', response.token);
    await refreshClubs();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setClubs([]);
    setCurrentClubState(null);
    localStorage.removeItem('token');
    localStorage.removeItem('currentClub');
  };

  const value: AuthContextType = {
    user,
    token,
    clubs,
    currentClub,
    login,
    register,
    logout,
    setCurrentClub,
    refreshClubs,
    getClubRole,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
