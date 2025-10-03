"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { Trophy, Medal, Crown, Home, Share2, Sparkles } from 'lucide-react';

export default function ResultsPage() {
  const router = useRouter();
  const { getCurrentGame, getLeaderboard } = useGameStore();
  const game = getCurrentGame();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  if (!game || game.status !== 'completed') {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-[#0F0F1E] via-[#1A1A2E] to-[#0F0F1E] flex flex-col justify-center items-center px-6">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">No Results Yet</h2>
          <button 
            onClick={() => router.push('/')} 
            className="btn"
          >
            Start
          </button>
        </div>
      </div>
    );
  }

  const leaderboard = getLeaderboard(game.id);
  const winner = leaderboard[0];

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#0F0F1E] via-[#1A1A2E] to-[#0F0F1E] flex flex-col overflow-hidden relative">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-fadeIn"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#FF6B35', '#4ECDC4', '#FFE66D', '#C44569'][Math.floor(Math.random() * 4)],
                animation: `fadeIn 0.5s ease-out ${Math.random() * 0.5}s`,
                transform: `translateY(${100 + Math.random() * 100}vh) rotate(${Math.random() * 360}deg)`,
                transition: `transform ${2 + Math.random() * 2}s linear`,
              }}
            />
          ))}
        </div>
      )}

      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#FFE66D] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#FFE66D] to-[#FF6B35] rounded-full mb-4 animate-bounce shadow-glow">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2 text-gradient">Game Complete!</h1>
          <p className="text-gray-400">{game.name}</p>
        </div>

        {/* Winner Spotlight */}
        <div className="px-6 mb-6 animate-fadeInUp">
          <div className="glass rounded-3xl p-6 border-2 border-[#FFE66D]">
            <div className="flex items-center gap-4">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-glow relative" 
                style={{ backgroundColor: winner.player.color }}
              >
                {winner.player.name.charAt(0).toUpperCase()}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-[#FFE66D] to-[#FF6B35] rounded-full flex items-center justify-center">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-[#FFE66D] font-semibold uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  Champion
                </div>
                <div className="text-2xl font-bold mb-1">{winner.player.name}</div>
                <div className="text-sm text-gray-400">
                  {winner.totalScore} sips • {winner.relativeToPar === 0 
                    ? 'Perfect Score!' 
                    : winner.relativeToPar > 0 
                    ? `+${winner.relativeToPar}` 
                    : winner.relativeToPar}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="flex-1 overflow-y-auto px-6 space-y-3 pb-4">
          <h2 className="text-lg font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Final Standings
          </h2>
          
          {leaderboard.slice(1).map((entry, index) => {
            const position = index + 2;
            const medalIcon = position === 2 ? <Medal className="w-5 h-5 text-gray-400" /> : 
                             position === 3 ? <Medal className="w-5 h-5 text-[#CD7F32]" /> : null;
            
            return (
              <div 
                key={entry.player.id} 
                className="card flex items-center justify-between animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 text-center">
                    {medalIcon || <span className="text-xl font-bold text-gray-600">#{position}</span>}
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
                      {entry.totalScore} sips
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    entry.relativeToPar === 0 ? 'text-[#4ECDC4]' :
                    entry.relativeToPar < 0 ? 'text-green-400' : 'text-orange-400'
                  }`}>
                    {entry.relativeToPar === 0 
                      ? 'E' 
                      : entry.relativeToPar > 0 
                      ? `+${entry.relativeToPar}` 
                      : entry.relativeToPar}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="p-6 glass space-y-3">
          <button 
            onClick={() => router.push('/')}
            className="btn w-full py-5 rounded-2xl font-semibold text-lg flex items-center justify-center gap-2"
          >
            <Home className="w-6 h-6" />
            Play Again
          </button>
          
          <button 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: 'Pub Golf Results',
                  text: `${winner.player.name} won with ${winner.totalScore} sips!`,
                });
              }
            }}
            className="btn-outline w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
