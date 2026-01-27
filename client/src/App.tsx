import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import TournamentList from './components/tournaments/TournamentList';
import TournamentDetails from './components/tournaments/TournamentDetails';
import MemberList from './components/profile/MemberList';
import MemberProfile from './components/profile/MemberProfile';
import CourseList from './components/tournaments/CourseList';
import Leaderboard from './components/leaderboard/Leaderboard';
import AdminPanel from './components/admin/AdminPanel';
import GolferOfTheYear from './components/standings/GolferOfTheYear';

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

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
