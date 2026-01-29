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
  YearStandings,
  Club,
  ClubMembership,
  CreateClubData,
  UpdateClubData,
  TournamentParticipant,
  UpdateParticipantData,
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

export const standingsAPI = {
  getYearStandings: (year?: number): Promise<YearStandings> =>
    api.get('/standings/year', { params: year ? { year } : {} }).then((res) => res.data),
};

export const clubsAPI = {
  getUserClubs: (): Promise<ClubMembership[]> =>
    api.get('/clubs').then((res) => res.data),

  getClubDetails: (clubId: number): Promise<Club> =>
    api.get(`/clubs/${clubId}`).then((res) => res.data),

  createClub: (data: CreateClubData): Promise<Club> =>
    api.post('/clubs', data).then((res) => res.data),

  joinByInviteCode: (inviteCode: string): Promise<ClubMembership> =>
    api.post('/clubs/join', { inviteCode }).then((res) => res.data),

  updateClub: (clubId: number, data: UpdateClubData): Promise<Club> =>
    api.put(`/clubs/${clubId}`, data).then((res) => res.data),

  regenerateInviteCode: (clubId: number): Promise<{ inviteCode: string }> =>
    api.post(`/clubs/${clubId}/invite-code/regenerate`).then((res) => res.data),

  updateMemberRole: (clubId: number, memberId: number, role: string): Promise<ClubMembership> =>
    api.put(`/clubs/${clubId}/members/${memberId}/role`, { role }).then((res) => res.data),

  removeMember: (clubId: number, memberId: number): Promise<void> =>
    api.delete(`/clubs/${clubId}/members/${memberId}`).then((res) => res.data),

  transferOwnership: (clubId: number, newOwnerId: number): Promise<{ message: string }> =>
    api.post(`/clubs/${clubId}/transfer-ownership`, { newOwnerId }).then((res) => res.data),
};

export const tournamentParticipantsAPI = {
  joinTournament: (tournamentId: number): Promise<TournamentParticipant> =>
    api.post(`/tournaments/${tournamentId}/join`).then((res) => res.data),

  joinByInviteCode: (inviteCode: string): Promise<TournamentParticipant> =>
    api.post('/tournaments/join-by-code', { inviteCode }).then((res) => res.data),

  updateParticipant: (tournamentId: number, userId: number, data: UpdateParticipantData): Promise<TournamentParticipant> =>
    api.put(`/tournaments/${tournamentId}/participants/${userId}`, data).then((res) => res.data),

  removeParticipant: (tournamentId: number, userId: number): Promise<void> =>
    api.delete(`/tournaments/${tournamentId}/participants/${userId}`).then((res) => res.data),
};

export const scorecardsAPI = {
  getTournamentFlights: (tournamentId: number): Promise<any> =>
    api.get(`/scorecards/tournaments/${tournamentId}/flights`).then((res) => res.data),

  getFlightScorecards: (tournamentId: number, flight: string): Promise<any> =>
    api.get(`/scorecards/tournaments/${tournamentId}/flights/${flight}`).then((res) => res.data),

  getUserScorecard: (tournamentId: number, userId: number): Promise<any> =>
    api.get(`/scorecards/tournaments/${tournamentId}/users/${userId}`).then((res) => res.data),
};

export const leaguesAPI = {
  getUserLeagues: (): Promise<any[]> =>
    api.get('/leagues').then((res) => res.data),

  getLeagueDetails: (leagueId: number): Promise<any> =>
    api.get(`/leagues/${leagueId}`).then((res) => res.data),

  createLeague: (data: any): Promise<any> =>
    api.post('/leagues', data).then((res) => res.data),

  joinByInviteCode: (inviteCode: string): Promise<any> =>
    api.post('/leagues/join', { inviteCode }).then((res) => res.data),

  updateLeague: (leagueId: number, data: any): Promise<any> =>
    api.put(`/leagues/${leagueId}`, data).then((res) => res.data),

  deleteLeague: (leagueId: number): Promise<void> =>
    api.delete(`/leagues/${leagueId}`).then((res) => res.data),

  regenerateInviteCode: (leagueId: number): Promise<{ inviteCode: string }> =>
    api.post(`/leagues/${leagueId}/invite-code/regenerate`).then((res) => res.data),

  getStandings: (leagueId: number): Promise<any[]> =>
    api.get(`/leagues/${leagueId}/standings`).then((res) => res.data),

  updateMemberRole: (leagueId: number, memberId: number, role: string): Promise<any> =>
    api.put(`/leagues/${leagueId}/members/${memberId}/role`, { role }).then((res) => res.data),

  removeMember: (leagueId: number, memberId: number): Promise<void> =>
    api.delete(`/leagues/${leagueId}/members/${memberId}`).then((res) => res.data),
};

export const chatAPI = {
  sendMessage: (entityType: string, entityId: number, content: string): Promise<any> =>
    api.post(`/chat/${entityType}/${entityId}/messages`, { content }).then((res) => res.data),

  getMessages: (entityType: string, entityId: number, page: number = 1, limit: number = 20): Promise<any> =>
    api.get(`/chat/${entityType}/${entityId}/messages`, { params: { page, limit } }).then((res) => res.data),

  deleteMessage: (messageId: number): Promise<void> =>
    api.delete(`/chat/messages/${messageId}`).then((res) => res.data),
};

export const photosAPI = {
  uploadPhoto: (entityType: string, entityId: number, file: File, caption?: string): Promise<any> => {
    const formData = new FormData();
    formData.append('photo', file);
    if (caption) {
      formData.append('caption', caption);
    }
    return api.post(`/photos/${entityType}/${entityId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((res) => res.data);
  },

  getPhotos: (entityType: string, entityId: number, page: number = 1, limit: number = 20): Promise<any> =>
    api.get(`/photos/${entityType}/${entityId}`, { params: { page, limit } }).then((res) => res.data),

  deletePhoto: (photoId: number): Promise<void> =>
    api.delete(`/photos/${photoId}`).then((res) => res.data),
};

export const followAPI = {
  followUser: (userId: number): Promise<any> =>
    api.post(`/social/${userId}/follow`).then((res) => res.data),

  unfollowUser: (userId: number): Promise<void> =>
    api.delete(`/social/${userId}/unfollow`).then((res) => res.data),

  getFollowers: (userId: number, page: number = 1, limit: number = 20): Promise<any> =>
    api.get(`/social/${userId}/followers`, { params: { page, limit } }).then((res) => res.data),

  getFollowing: (userId: number, page: number = 1, limit: number = 20): Promise<any> =>
    api.get(`/social/${userId}/following`, { params: { page, limit } }).then((res) => res.data),

  getFollowingStatus: (userId: number): Promise<any> =>
    api.get(`/social/${userId}/following/status`).then((res) => res.data),

  getFeed: (page: number = 1, limit: number = 20): Promise<any> =>
    api.get('/social/feed', { params: { page, limit } }).then((res) => res.data),
};

export const flightsAPI = {
  createFlight: (tournamentId: number, data: any): Promise<any> =>
    api.post(`/tournaments/${tournamentId}/flights`, data).then((res) => res.data),

  getFlights: (tournamentId: number): Promise<any[]> =>
    api.get(`/tournaments/${tournamentId}/flights`).then((res) => res.data),

  updateFlight: (tournamentId: number, flightId: number, data: any): Promise<any> =>
    api.put(`/tournaments/${tournamentId}/flights/${flightId}`, data).then((res) => res.data),

  deleteFlight: (tournamentId: number, flightId: number): Promise<void> =>
    api.delete(`/tournaments/${tournamentId}/flights/${flightId}`).then((res) => res.data),

  autoAssignFlights: (tournamentId: number): Promise<any> =>
    api.post(`/tournaments/${tournamentId}/flights/auto-assign`).then((res) => res.data),

  getFlightLeaderboard: (tournamentId: number, flightId: number): Promise<any[]> =>
    api.get(`/tournaments/${tournamentId}/flights/${flightId}/leaderboard`).then((res) => res.data),
};

export const teamsAPI = {
  createTeam: (tournamentId: number, data: any): Promise<any> =>
    api.post(`/tournaments/${tournamentId}/teams`, data).then((res) => res.data),

  getTeams: (tournamentId: number): Promise<any[]> =>
    api.get(`/tournaments/${tournamentId}/teams`).then((res) => res.data),

  updateTeam: (tournamentId: number, teamId: number, data: any): Promise<any> =>
    api.put(`/tournaments/${tournamentId}/teams/${teamId}`, data).then((res) => res.data),

  deleteTeam: (tournamentId: number, teamId: number): Promise<void> =>
    api.delete(`/tournaments/${tournamentId}/teams/${teamId}`).then((res) => res.data),

  assignPlayers: (tournamentId: number, teamId: number, playerIds: number[]): Promise<any> =>
    api.post(`/tournaments/${tournamentId}/teams/${teamId}/assign`, { playerIds }).then((res) => res.data),

  removePlayer: (tournamentId: number, teamId: number, playerId: number): Promise<void> =>
    api.delete(`/tournaments/${tournamentId}/teams/${teamId}/players/${playerId}`).then((res) => res.data),

  getTeamStats: (tournamentId: number, teamId: number): Promise<any> =>
    api.get(`/tournaments/${tournamentId}/teams/${teamId}/stats`).then((res) => res.data),
};

export const gamesAPI = {
  createGame: (tournamentId: number, data: any): Promise<any> =>
    api.post(`/tournaments/${tournamentId}/games`, data).then((res) => res.data),

  getGames: (tournamentId: number): Promise<any[]> =>
    api.get(`/tournaments/${tournamentId}/games`).then((res) => res.data),

  updateGame: (tournamentId: number, gameId: number, data: any): Promise<any> =>
    api.put(`/tournaments/${tournamentId}/games/${gameId}`, data).then((res) => res.data),

  deleteGame: (tournamentId: number, gameId: number): Promise<void> =>
    api.delete(`/tournaments/${tournamentId}/games/${gameId}`).then((res) => res.data),

  getGameResults: (tournamentId: number, gameId: number): Promise<any> =>
    api.get(`/tournaments/${tournamentId}/games/${gameId}/results`).then((res) => res.data),
};

export const holeCompetitionsAPI = {
  createCompetition: (tournamentId: number, data: any): Promise<any> =>
    api.post(`/tournaments/${tournamentId}/hole-competitions`, data).then((res) => res.data),

  getCompetitions: (tournamentId: number): Promise<any[]> =>
    api.get(`/tournaments/${tournamentId}/hole-competitions`).then((res) => res.data),

  updateCompetition: (tournamentId: number, competitionId: number, data: any): Promise<any> =>
    api.put(`/tournaments/${tournamentId}/hole-competitions/${competitionId}`, data).then((res) => res.data),

  deleteCompetition: (tournamentId: number, competitionId: number): Promise<void> =>
    api.delete(`/tournaments/${tournamentId}/hole-competitions/${competitionId}`).then((res) => res.data),

  setWinner: (tournamentId: number, competitionId: number, winnerId: number, winningDistance?: number): Promise<any> =>
    api.post(`/tournaments/${tournamentId}/hole-competitions/${competitionId}/winner`, {
      winnerId,
      winningDistance,
    }).then((res) => res.data),

  removeWinner: (tournamentId: number, competitionId: number): Promise<void> =>
    api.delete(`/tournaments/${tournamentId}/hole-competitions/${competitionId}/winner`).then((res) => res.data),
};

export default api;
