"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { Trophy, Medal, TrendingUp, TrendingDown } from 'lucide-react';

export default function LeaderboardPage() {
  const router = useRouter();
  const { getCurrentGame, getLeaderboard } = useGameStore();
  const game = getCurrentGame();
  
  if (!game) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-[#0F0F1E] via-[#1A1A2E] to-[#0F0F1E] flex flex-col justify-center items-center px-6">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Active Game</h2>
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
  
  const leaderboard = getLeaderboard(game.id);
  const leader = leaderboard[0];

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
          <div className="w-12 h-12 bg-gradient-to-br from-[#FFE66D] to-[#FF6B35] rounded-2xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Live Standings</h1>
            <p className="text-gray-400">After Hole {game.currentHoleIndex + 1}</p>
          </div>
        </div>
      </div>

      {/* Leader Spotlight */}
      {leader && (
        <div className="px-6 pb-4 animate-fadeInUp">
          <div className="glass rounded-3xl p-6 border-2 border-[#FFE66D]/50">
            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-glow relative" 
                style={{ backgroundColor: leader.player.color }}
              >
                {leader.player.name.charAt(0).toUpperCase()}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#FFE66D] to-[#FF6B35] rounded-full flex items-center justify-center">
                  <Trophy className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-[#FFE66D] font-semibold uppercase tracking-wide mb-1">
                  Leading
                </div>
                <div className="text-2xl font-bold mb-1">{leader.player.name}</div>
                <div className="text-sm text-gray-400">
                  {leader.totalScore} sips • {leader.relativeToPar === 0 
                    ? 'Even Par' 
                    : leader.relativeToPar > 0 
                    ? `+${leader.relativeToPar}` 
                    : leader.relativeToPar}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          All Players
        </h2>
        
        {leaderboard.map((entry, idx) => {
          const position = idx + 1;
          const medalIcon = position === 1 ? <Trophy className="w-5 h-5 text-[#FFE66D]" /> : 
                           position === 2 ? <Medal className="w-5 h-5 text-gray-400" /> : 
                           position === 3 ? <Medal className="w-5 h-5 text-[#CD7F32]" /> : null;
          
          return (
            <div 
              key={entry.player.id} 
              className={`card flex items-center justify-between animate-fadeInUp ${
                position === 1 ? 'border-2 border-[#FFE66D]/30' : ''
              }`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 flex justify-center">
                  {medalIcon || <span className="text-lg font-bold text-gray-500">#{position}</span>}
                </div>
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-lg" 
                  style={{ backgroundColor: entry.player.color }}
                >
                  {entry.player.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-lg">{entry.player.name}</div>
                  <div className="text-sm text-gray-400">
                    {entry.totalScore} sips total
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-2xl font-bold flex items-center gap-1 ${
                  entry.relativeToPar === 0 ? 'text-[#4ECDC4]' :
                  entry.relativeToPar < 0 ? 'text-green-400' : 'text-orange-400'
                }`}>
                  {entry.relativeToPar === 0 
                    ? 'E' 
                    : entry.relativeToPar > 0 
                    ? `+${entry.relativeToPar}` 
                    : entry.relativeToPar}
                  {entry.relativeToPar < 0 && <TrendingDown className="w-5 h-5" />}
                  {entry.relativeToPar > 0 && <TrendingUp className="w-5 h-5" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Back to Game */}
      <div className="p-6 glass" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <button 
          onClick={() => router.push('/game')}
          className="btn w-full py-4 rounded-2xl font-semibold"
        >
          Back to Game
        </button>
      </div>
    </div>
  );
}
