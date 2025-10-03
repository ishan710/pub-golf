export interface Bar {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  par: number;
  latitude?: number;
  longitude?: number;
  bonusTask?: string;
}

export interface Player {
  id: string;
  name: string;
  color: string;
}

export interface Score {
  playerId: string;
  barId: string;
  strokes: number;
  timestamp: number;
  bonusCompleted?: boolean;
}

export interface Game {
  id: string;
  name: string;
  date: number;
  course: Bar[];
  players: Player[];
  scores: Score[];
  currentHoleIndex: number;
  status: 'setup' | 'in-progress' | 'completed';
}

export interface CourseTemplate {
  id: string;
  name: string;
  description: string;
  bars: Bar[];
  createdAt: number;
}


