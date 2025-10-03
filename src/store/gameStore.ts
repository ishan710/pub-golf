"use client";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Game, Player, Bar, Score } from '@/types';

interface GameState {
  games: Game[];
  currentGameId: string | null;
  createGame: (name: string, course: Bar[], players: Player[]) => string;
  addScore: (gameId: string, score: Score) => void;
  updateGameStatus: (gameId: string, status: Game['status']) => void;
  setCurrentGame: (gameId: string | null) => void;
  deleteGame: (gameId: string) => void;
  moveToNextHole: (gameId: string) => void;
  getCurrentGame: () => Game | null;
  getPlayerScore: (gameId: string, playerId: string) => number;
  getLeaderboard: (gameId: string) => { player: Player; totalScore: number; relativeToPar: number }[];
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      games: [],
      currentGameId: null,

      createGame: (name, course, players) => {
        const newGame: Game = {
          id: `game-${Date.now()}`,
          name,
          date: Date.now(),
          course,
          players,
          scores: [],
          currentHoleIndex: 0,
          status: 'in-progress',
        };
        set((state) => ({ games: [...state.games, newGame], currentGameId: newGame.id }));
        return newGame.id;
      },

      addScore: (gameId, score) => {
        set((state) => ({
          games: state.games.map((g) => (g.id === gameId ? { ...g, scores: [...g.scores, score] } : g)),
        }));
      },

      updateGameStatus: (gameId, status) => {
        set((state) => ({
          games: state.games.map((g) => (g.id === gameId ? { ...g, status } : g)),
        }));
      },

      setCurrentGame: (gameId) => set({ currentGameId: gameId }),

      deleteGame: (gameId) => {
        set((state) => ({
          games: state.games.filter((g) => g.id !== gameId),
          currentGameId: state.currentGameId === gameId ? null : state.currentGameId,
        }));
      },

      moveToNextHole: (gameId) => {
        set((state) => ({
          games: state.games.map((g) => (g.id === gameId ? { ...g, currentHoleIndex: g.currentHoleIndex + 1 } : g)),
        }));
      },

      getCurrentGame: () => {
        const { games, currentGameId } = get();
        return games.find((g) => g.id === currentGameId) || null;
      },

      getPlayerScore: (gameId, playerId) => {
        const game = get().games.find((g) => g.id === gameId);
        if (!game) return 0;
        const totalStrokes = game.scores.filter((s) => s.playerId === playerId).reduce((acc, s) => acc + s.strokes, 0);
        const bonusPoints = game.scores.filter((s) => s.playerId === playerId && s.bonusCompleted).length;
        return totalStrokes - bonusPoints; // Subtract 1 point for each completed bonus
      },

      getLeaderboard: (gameId) => {
        const game = get().games.find((g) => g.id === gameId);
        if (!game) return [];
        const totalPar = game.course.reduce((sum, bar) => sum + bar.par, 0);
        return game.players
          .map((player) => {
            const totalScore = get().getPlayerScore(gameId, player.id);
            return { player, totalScore, relativeToPar: totalScore - totalPar };
          })
          .sort((a, b) => a.totalScore - b.totalScore);
      },
    }),
    { name: 'pub-golf-storage' }
  )
);


