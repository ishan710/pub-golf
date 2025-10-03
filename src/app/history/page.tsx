"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { History, Trophy, Users, MapPin, Calendar, CheckCircle, PlayCircle } from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const { games } = useGameStore();

  if (games.length === 0) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-[#0F0F1E] via-[#1A1A2E] to-[#0F0F1E] flex flex-col justify-center items-center px-6">
        <div className="text-center">
          <History className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Games Yet</h2>
          <p className="text-gray-400 mb-6">Start your first pub golf adventure!</p>
          <button 
            onClick={() => router.push('/')} 
            className="btn"
          >
            Start New Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#0F0F1E] via-[#1A1A2E] to-[#0F0F1E] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <button 
          onClick={() => router.back()}
          className="glass px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#252540] transition-all flex items-center gap-2 mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-[#4ECDC4] to-[#FF6B35] rounded-2xl flex items-center justify-center">
            <History className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Game History</h1>
            <p className="text-gray-400">{games.length} game{games.length !== 1 ? 's' : ''} played</p>
          </div>
        </div>
      </div>

      {/* Games List */}
      <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-6">
        {games.map((game, index) => {
          const isCompleted = game.status === 'completed';
          
          return (
            <div 
              key={game.id} 
              className="card animate-fadeInUp hover:scale-[1.02] cursor-pointer"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{game.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(game.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
                
                <div className={`badge ${isCompleted ? 'badge-success' : 'badge-warning'} flex items-center gap-1`}>
                  {isCompleted ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      Complete
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-3 h-3" />
                      Active
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass rounded-xl p-3 text-center">
                  <MapPin className="w-5 h-5 text-[#FF6B35] mx-auto mb-1" />
                  <div className="text-lg font-bold">{game.course.length}</div>
                  <div className="text-xs text-gray-500">Holes</div>
                </div>
                
                <div className="glass rounded-xl p-3 text-center">
                  <Users className="w-5 h-5 text-[#4ECDC4] mx-auto mb-1" />
                  <div className="text-lg font-bold">{game.players.length}</div>
                  <div className="text-xs text-gray-500">Players</div>
                </div>
                
                <div className="glass rounded-xl p-3 text-center">
                  <Trophy className="w-5 h-5 text-[#FFE66D] mx-auto mb-1" />
                  <div className="text-lg font-bold">{game.scores.length}</div>
                  <div className="text-xs text-gray-500">Scores</div>
                </div>
              </div>

              {/* Players Preview */}
              {game.players.length > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {game.players.slice(0, 4).map((player) => (
                      <div
                        key={player.id}
                        className="w-8 h-8 rounded-full border-2 border-[#1A1A2E] flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: player.color }}
                      >
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                  {game.players.length > 4 && (
                    <span className="text-sm text-gray-500">+{game.players.length - 4} more</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
