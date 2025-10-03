export interface TeamScore {
  id: string;
  gameName: string;
  barId: string;
  barName: string;
  timestamp: number;
  players: {
    name: string;
    sips: number;
  }[];
  bonusCompleted: boolean;
  photoUrl?: string;
}

export interface GameSession {
  id: string;
  gameName: string;
  date: number;
  players: string[];
  scores: TeamScore[];
}

