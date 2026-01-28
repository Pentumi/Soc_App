// Club types
export interface Club {
  id: number;
  name: string;
  inviteCode: string;
  ownerId: number;
  defaultFormat: string;
  allowSelfJoin: boolean;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  members?: ClubMember[];
  tournaments?: Tournament[];
  _count?: {
    members: number;
    tournaments: number;
  };
}

export interface ClubMembership extends Club {
  userRole: 'owner' | 'admin' | 'player' | 'spectator';
  joinedAt: string;
}

export interface ClubMember {
  id: number;
  clubId: number;
  userId: number;
  role: 'owner' | 'admin' | 'player' | 'spectator';
  joinedAt: string;
  user?: User;
  club?: Club;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  currentHandicap: number | null;
  profilePhoto: string | null;
  createdAt: string;
  clubs?: {
    id: number;
    name: string;
    role: string;
  }[];
  clubMemberships?: ClubMember[];
}

export interface Course {
  id: number;
  name: string;
  location: string | null;
  par: number;
  slopeRating: number | null;
  courseRating: number | null;
  createdAt: string;
  holes?: Hole[];
}

export interface Hole {
  id: number;
  courseId: number;
  holeNumber: number;
  par: number;
  strokeIndex: number | null;
  yardage: number | null;
}

export interface Tournament {
  id: number;
  clubId: number;
  name: string;
  inviteCode: string;
  courseId: number;
  tournamentDate: string;
  startTime: string | null;
  format: string;
  isMajor: boolean;
  status: 'upcoming' | 'in_progress' | 'completed';
  allowSelfJoin: boolean;
  playerCap: number | null;
  leaderboardVisible: boolean;
  createdAt: string;
  club?: {
    id: number;
    name: string;
  };
  course?: Course;
  participants?: TournamentParticipant[];
  tournamentScores?: TournamentScore[];
}

export interface TournamentParticipant {
  id: number;
  tournamentId: number;
  userId: number;
  role: 'admin' | 'player' | 'spectator';
  team: string | null;
  flight: string | null;
  status: 'registered' | 'waitlist' | 'withdrawn';
  joinedAt: string;
  user?: User;
  tournament?: Tournament;
}

export interface TournamentScore {
  id: number;
  tournamentId: number;
  userId: number;
  grossScore: number;
  handicapAtTime: number;
  netScore: number;
  stablefordPoints: number | null;
  position: number | null;
  handicapAdjustment: number;
  createdAt: string;
  user?: User;
  tournament?: Tournament;
  holeScores?: HoleScore[];
}

export interface HoleScore {
  id: number;
  tournamentScoreId: number;
  holeId: number;
  strokes: number;
  stablefordPoints: number | null;
  putts: number | null;
  fairwayHit: boolean | null;
  greenInRegulation: boolean | null;
  hole?: Hole;
}

export interface HoleScoreInput {
  holeId: number;
  strokes: number;
  putts?: number;
  fairwayHit?: boolean;
  greenInRegulation?: boolean;
}

export interface HandicapHistory {
  id: number;
  userId: number;
  handicapIndex: number;
  tournamentId: number | null;
  reason: string | null;
  effectiveDate: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CreateMemberData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  currentHandicap?: number;
  profilePhoto?: string;
}

export interface CreateTournamentData {
  name: string;
  clubId: number;
  courseId: number;
  tournamentDate: string;
  startTime?: string;
  format?: string;
  isMajor?: boolean;
  allowSelfJoin?: boolean;
  playerCap?: number;
  leaderboardVisible?: boolean;
}

export interface CreateCourseData {
  name: string;
  location?: string;
  par: number;
  slopeRating?: number;
  courseRating?: number;
  holes?: {
    holeNumber: number;
    par: number;
    strokeIndex?: number;
    yardage?: number;
  }[];
}

export interface SubmitScoreData {
  tournamentId: number;
  userId: number;
  grossScore?: number;
  holeScores?: HoleScoreInput[];
}

export interface UpdateTournamentData {
  name?: string;
  courseId?: number;
  tournamentDate?: string;
  startTime?: string;
  format?: string;
  isMajor?: boolean;
  status?: string;
  allowEditWithScores?: boolean;
}

export interface TournamentStats {
  biggestBlowupHole: {
    player: string;
    hole: number;
    strokes: number;
    par: number;
    overPar: number;
  } | null;
  lowestHoleScore: {
    player: string;
    hole: number;
    strokes: number;
    par: number;
  } | null;
  bestGrossRound: {
    player: string;
    grossScore: number;
    coursePar: number;
    toPar: number;
  } | null;
  worstGrossRound: {
    player: string;
    grossScore: number;
    coursePar: number;
    toPar: number;
  } | null;
}

// Club management types
export interface CreateClubData {
  name: string;
  defaultFormat?: string;
}

export interface UpdateClubData {
  name?: string;
  defaultFormat?: string;
  allowSelfJoin?: boolean;
}

export interface UpdateParticipantData {
  role?: 'admin' | 'player' | 'spectator';
  team?: string | null;
  flight?: string | null;
  status?: 'registered' | 'waitlist' | 'withdrawn';
}

// Legacy types (deprecated)
export interface CreateSocietyData {
  name: string;
  defaultFormat: string;
}

export interface UpdateSocietyData {
  name?: string;
  defaultFormat?: string;
}

export interface YearStandings {
  year: number;
  tournaments: {
    id: number;
    name: string;
    date: string;
  }[];
  standings: PlayerStanding[];
}

export interface PlayerStanding {
  userId: number;
  name: string;
  tournaments: {
    name: string;
    points: number;
    position: number;
  }[];
  totalPoints: number;
  best5Points: number;
  averagePoints: number;
  tournamentsPlayed: number;
}
