"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { nycBars, playerColors } from '@/data/nycBars';
import { Bar, Player } from '@/types';
import { Plus, X, MapPin, Users, Trophy, ArrowRight, Check } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const { createGame } = useGameStore();

  const [gameName, setGameName] = useState('');
  const [selectedBars, setSelectedBars] = useState<Bar[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [step, setStep] = useState<'name' | 'bars' | 'players'>('name');

  const toggleBar = (bar: Bar) => {
    if (selectedBars.find((b) => b.id === bar.id)) {
      setSelectedBars(selectedBars.filter((b) => b.id !== bar.id));
    } else if (selectedBars.length < 18) {
      setSelectedBars([...selectedBars, bar]);
    }
  };

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 8) {
      const newPlayer: Player = {
        id: `player-${Date.now()}`,
        name: newPlayerName.trim(),
        color: playerColors[players.length % playerColors.length],
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (id: string) => setPlayers(players.filter((p) => p.id !== id));

  const startGame = () => {
    if (gameName.trim() && selectedBars.length > 0 && players.length > 0) {
      createGame(gameName, selectedBars, players);
      router.push('/game');
    }
  };

  const canProceed = () => {
    if (step === 'name') return gameName.trim().length > 0;
    if (step === 'bars') return selectedBars.length > 0;
    if (step === 'players') return players.length > 0;
    return false;
  };

  const nextStep = () => {
    if (step === 'name') setStep('bars');
    else if (step === 'bars') setStep('players');
  };

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
        
        <h1 className="text-3xl font-bold mb-2 text-gradient">Create Your Course</h1>
        
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mt-6">
          <div className={`flex-1 h-1 rounded-full transition-all ${step === 'name' || step === 'bars' || step === 'players' ? 'bg-[#FF6B35]' : 'bg-gray-700'}`}></div>
          <div className={`flex-1 h-1 rounded-full transition-all ${step === 'bars' || step === 'players' ? 'bg-[#FF6B35]' : 'bg-gray-700'}`}></div>
          <div className={`flex-1 h-1 rounded-full transition-all ${step === 'players' ? 'bg-[#FF6B35]' : 'bg-gray-700'}`}></div>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span className={step === 'name' ? 'text-[#FF6B35] font-semibold' : ''}>Name</span>
          <span className={step === 'bars' ? 'text-[#FF6B35] font-semibold' : ''}>Bars</span>
          <span className={step === 'players' ? 'text-[#FF6B35] font-semibold' : ''}>Players</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-6">
        {/* Step 1: Game Name */}
        {step === 'name' && (
          <div className="h-full flex flex-col justify-center animate-fadeIn">
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Game Name
              </label>
              <input 
                type="text" 
                value={gameName} 
                onChange={(e) => setGameName(e.target.value)} 
                placeholder="e.g., East Village Crawl" 
                className="w-full text-xl"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && canProceed() && nextStep()}
              />
            </div>
            
            <div className="glass rounded-2xl p-6">
              <Trophy className="w-8 h-8 text-[#FFE66D] mb-3" />
              <h3 className="font-semibold mb-2">Make it memorable!</h3>
              <p className="text-sm text-gray-400">Choose a name that captures the spirit of your pub golf adventure.</p>
            </div>
          </div>
        )}

        {/* Step 2: Select Bars */}
        {step === 'bars' && (
          <div className="h-full flex flex-col animate-fadeIn">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                  Select Bars
                </label>
                <span className="text-sm font-semibold text-[#FF6B35]">
                  {selectedBars.length} selected
                </span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-3 pb-4">
              {nycBars.map((bar) => {
                const isSelected = selectedBars.find((b) => b.id === bar.id);
                const holeNumber = selectedBars.findIndex((b) => b.id === bar.id) + 1;
                
                return (
                  <div 
                    key={bar.id} 
                    onClick={() => toggleBar(bar)} 
                    className={`card cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-[#FF6B35] shadow-glow scale-[1.02]' 
                        : 'hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isSelected && (
                            <div className="bg-gradient-to-r from-[#FF6B35] to-[#FFE66D] text-white text-xs font-bold px-3 py-1 rounded-full">
                              Hole {holeNumber}
                            </div>
                          )}
                          <h3 className="font-semibold text-lg">{bar.name}</h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {bar.neighborhood}
                        </p>
                        <div className="inline-flex items-center gap-2 mt-2">
                          <div className="badge badge-warning">
                            Par {bar.par}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-6 h-6 text-[#FF6B35]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Add Players */}
        {step === 'players' && (
          <div className="h-full flex flex-col animate-fadeIn">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                Add Players
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newPlayerName} 
                  onChange={(e) => setNewPlayerName(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && addPlayer()} 
                  placeholder="Player name" 
                  className="flex-1"
                  autoFocus
                />
                <button 
                  onClick={addPlayer} 
                  disabled={!newPlayerName.trim() || players.length >= 8} 
                  className="btn px-6"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Maximum 8 players</p>
            </div>

            <div className="flex-1 overflow-y-auto -mx-6 px-6 space-y-3 pb-4">
              {players.map((player, index) => (
                <div 
                  key={player.id} 
                  className="card flex items-center justify-between transition-smooth hover:scale-[1.02]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg" 
                      style={{ backgroundColor: player.color }}
                    >
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-lg">{player.name}</span>
                  </div>
                  <button 
                    onClick={() => removePlayer(player.id)} 
                    className="text-gray-500 hover:text-red-500 transition-colors p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              {players.length === 0 && (
                <div className="glass rounded-2xl p-12 text-center">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No players added yet</p>
                  <p className="text-sm text-gray-600 mt-1">Add your first player above</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 glass" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex gap-3">
          {step !== 'name' && (
            <button 
              onClick={() => {
                if (step === 'players') setStep('bars');
                else if (step === 'bars') setStep('name');
              }}
              className="btn-outline px-6 py-4 rounded-2xl font-semibold"
            >
              Back
            </button>
          )}
          
          {step !== 'players' ? (
            <button 
              onClick={nextStep}
              disabled={!canProceed()}
              className="btn flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
            >
              Next
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={startGame} 
              disabled={!canProceed()} 
              className="btn flex-1 py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              Start
            </button>
          )}
        </div>
        
        {!canProceed() && (
          <p className="text-sm text-gray-500 text-center mt-3">
            {step === 'name' && 'Enter a game name to continue'}
            {step === 'bars' && 'Select at least one bar to continue'}
            {step === 'players' && 'Add at least one player to start'}
          </p>
        )}
      </div>
    </div>
  );
}
