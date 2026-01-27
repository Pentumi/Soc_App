import axios from 'axios';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
  Tournament,
  CreateTournamentData,
  UpdateTournamentData,
  TournamentScore,
  TournamentStats,
  SubmitScoreData,
  HoleScore,
  Course,
  CreateCourseData,
  CreateMemberData,
  HandicapHistory,
  Society,
  CreateSocietyData,
  UpdateSocietyData,
  YearStandings,
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: RegisterData): Promise<AuthResponse> =>
    api.post('/auth/register', data).then((res) => res.data),

  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    api.post('/auth/login', credentials).then((res) => res.data),

  getMe: (): Promise<User> =>
    api.get('/auth/me').then((res) => res.data),
};

export const usersAPI = {
  getAll: (): Promise<User[]> =>
    api.get('/users').then((res) => res.data),

  getById: (id: number): Promise<User> =>
    api.get(`/users/${id}`).then((res) => res.data),

  create: (data: CreateMemberData): Promise<User> =>
    api.post('/users', data).then((res) => res.data),

  update: (id: number, data: Partial<User>): Promise<User> =>
    api.put(`/users/${id}`, data).then((res) => res.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/users/${id}`).then((res) => res.data),
};

export const tournamentsAPI = {
  getAll: (): Promise<Tournament[]> =>
    api.get('/tournaments').then((res) => res.data),

  getById: (id: number): Promise<Tournament> =>
    api.get(`/tournaments/${id}`).then((res) => res.data),

  getStats: (id: number): Promise<TournamentStats> =>
    api.get(`/tournaments/${id}/stats`).then((res) => res.data),

  create: (data: CreateTournamentData): Promise<Tournament> =>
    api.post('/tournaments', data).then((res) => res.data),

  update: (id: number, data: UpdateTournamentData): Promise<Tournament> =>
    api.put(`/tournaments/${id}`, data).then((res) => res.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/tournaments/${id}`).then((res) => res.data),
};

export const scoresAPI = {
  submitScore: (data: SubmitScoreData): Promise<TournamentScore> =>
    api.post('/scores', data).then((res) => res.data),

  getLeaderboard: (tournamentId: number): Promise<TournamentScore[]> =>
    api.get(`/scores/tournament/${tournamentId}`).then((res) => res.data),

  getHoleScores: (scoreId: number): Promise<HoleScore[]> =>
    api.get(`/scores/${scoreId}/holes`).then((res) => res.data),

  completeTournament: (tournamentId: number): Promise<Tournament> =>
    api.post(`/scores/tournament/${tournamentId}/complete`).then((res) => res.data),

  deleteScore: (id: number): Promise<void> =>
    api.delete(`/scores/${id}`).then((res) => res.data),
};

export const coursesAPI = {
  getAll: (): Promise<Course[]> =>
    api.get('/courses').then((res) => res.data),

  getById: (id: number): Promise<Course> =>
    api.get(`/courses/${id}`).then((res) => res.data),

  create: (data: CreateCourseData): Promise<Course> =>
    api.post('/courses', data).then((res) => res.data),

  update: (id: number, data: Partial<Course>): Promise<Course> =>
    api.put(`/courses/${id}`, data).then((res) => res.data),

  delete: (id: number): Promise<void> =>
    api.delete(`/courses/${id}`).then((res) => res.data),
};

export const handicapsAPI = {
  getHistory: (userId: number): Promise<HandicapHistory[]> =>
    api.get(`/handicaps/user/${userId}`).then((res) => res.data),

  adjustHandicap: (userId: number, newHandicap: number, reason?: string): Promise<User> =>
    api.post(`/handicaps/user/${userId}/adjust`, { newHandicap, reason }).then((res) => res.data),
};

export const societyAPI = {
  create: (data: CreateSocietyData): Promise<Society> =>
    api.post('/society', data).then((res) => res.data),

  get: (): Promise<Society> =>
    api.get('/society').then((res) => res.data),

  update: (data: UpdateSocietyData): Promise<Society> =>
    api.put('/society', data).then((res) => res.data),
};

export const standingsAPI = {
  getYearStandings: (year?: number): Promise<YearStandings> =>
    api.get('/standings/year', { params: year ? { year } : {} }).then((res) => res.data),
};

export default api;
