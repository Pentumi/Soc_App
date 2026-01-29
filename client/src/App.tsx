import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Home from './pages/Home';
import Dashboard from './components/dashboard/Dashboard';
import TournamentList from './components/tournaments/TournamentList';
import TournamentDetails from './components/tournaments/TournamentDetails';
import GroupScorecard from './components/tournaments/GroupScorecard';
import MemberList from './components/profile/MemberList';
import MemberProfile from './components/profile/MemberProfile';
import CourseList from './components/tournaments/CourseList';
import Leaderboard from './components/leaderboard/Leaderboard';
import AdminPanel from './components/admin/AdminPanel';
import GolferOfTheYear from './components/standings/GolferOfTheYear';
import LeagueList from './pages/LeagueList';
import Social from './pages/Social';
import Create from './pages/Create';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tournaments"
              element={
                <ProtectedRoute>
                  <TournamentList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tournaments/:id"
              element={
                <ProtectedRoute>
                  <TournamentDetails />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tournaments/:id/scorecards"
              element={
                <ProtectedRoute>
                  <GroupScorecard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/members"
              element={
                <ProtectedRoute>
                  <MemberList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/members/:id"
              element={
                <ProtectedRoute>
                  <MemberProfile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/courses"
              element={
                <ProtectedRoute requireAdmin>
                  <CourseList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />

            <Route
              path="/golfer-of-the-year"
              element={
                <ProtectedRoute>
                  <GolferOfTheYear />
                </ProtectedRoute>
              }
            />

            <Route
              path="/leagues"
              element={
                <ProtectedRoute>
                  <LeagueList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/social"
              element={
                <ProtectedRoute>
                  <Social />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create"
              element={
                <ProtectedRoute>
                  <Create />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Navigate to="/members/:id" replace />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
