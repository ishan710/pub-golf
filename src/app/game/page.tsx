"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { Score } from '@/types';
import MapClient from '@/components/MapClient';
import { MapPin, Trophy, Minus, Plus, ArrowRight, Check, Camera, Upload, X as XIcon, Star, Cloud } from 'lucide-react';
import { uploadTeamPhoto, saveTeamScore } from '@/lib/cloudStorage';

export default function GamePage() {
  const router = useRouter();
  const { getCurrentGame, addScore, moveToNextHole, updateGameStatus } = useGameStore();
  const game = getCurrentGame();
  const [sips, setSips] = useState<Record<string, number>>({});
  const [showMap, setShowMap] = useState(false);
  const [teamPhoto, setTeamPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [teamBonusCompleted, setTeamBonusCompleted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
            Start
          </button>
        </div>
      </div>
    );
  }

  const currentHole = game.course[game.currentHoleIndex];
  const isLastHole = game.currentHoleIndex === game.course.length - 1;

  const handleSipChange = (playerId: string, value: number) => {
    setSips({ ...sips, [playerId]: Math.max(0, value) });
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTeamPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setTeamPhoto(null);
  };

  const submitScores = async () => {
    setIsSaving(true);
    
    try {
      // Upload photo to cloud if exists
      let photoUrl: string | null = null;
      if (teamPhoto) {
        photoUrl = await uploadTeamPhoto(teamPhoto, game.id, currentHole.id);
      }

      // Prepare team score data
      const teamPlayers = game.players.map(player => ({
        name: player.name,
        sips: sips[player.id] || 0
      }));

      // Save to cloud
      await saveTeamScore(
        game.id,
        game.name,
        currentHole.id,
        currentHole.name,
        teamPlayers,
        teamBonusCompleted,
        photoUrl || undefined
      );

      // Save to local store as well
      game.players.forEach((player) => {
        const sipCount = sips[player.id] || 0;
        if (sipCount > 0) {
          const score: Score = { 
            playerId: player.id, 
            barId: currentHole.id, 
            strokes: sipCount, 
            timestamp: Date.now(),
            bonusCompleted: teamBonusCompleted
          };
          addScore(game.id, score);
        }
      });
      
      if (isLastHole) {
        updateGameStatus(game.id, 'completed');
        router.push('/results');
      } else {
        moveToNextHole(game.id);
        setSips({});
        setTeamPhoto(null);
        setPhotoPreview(null);
        setTeamBonusCompleted(false);
      }
    } catch (error) {
      console.error('Error saving to cloud:', error);
      alert('Failed to save to cloud. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasPhoto = teamPhoto !== null;
  const canSubmit = hasPhoto;
  const progress = ((game.currentHoleIndex + 1) / game.course.length) * 100;

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#0F0F1E] via-[#1A1A2E] to-[#0F0F1E] flex flex-col overflow-hidden">
      {/* Top Header - Fixed */}
      <div className="px-4 pt-6 pb-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <button 
            onClick={() => router.back()}
            className="glass px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-[#252540] transition-all flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <div className="text-center">
            <div className="text-xs text-gray-500">
              Hole {game.currentHoleIndex + 1}/{game.course.length}
            </div>
          </div>
          
          <button 
            onClick={() => setShowMap(!showMap)}
            className={`glass px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${showMap ? 'text-[#FF6B35]' : 'text-gray-400'}`}
          >
            Map
          </button>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Current Bar Info */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold mb-1 text-gradient">{currentHole.name}</h1>
          <p className="text-gray-400 flex items-center justify-center gap-1 text-sm mb-2">
            <MapPin className="w-3 h-3" />
            {currentHole.neighborhood}
          </p>
          <div className="badge badge-warning text-sm px-3 py-1">
            Par {currentHole.par} sips
          </div>
        </div>

        {/* Bonus Task - Team Level */}
        {currentHole.bonusTask && (
          <div className={`glass rounded-xl p-3 mb-4 transition-all ${
            teamBonusCompleted ? 'bg-[#FFE66D]/20 border-2 border-[#FFE66D]' : ''
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Star className={`w-4 h-4 flex-shrink-0 ${teamBonusCompleted ? 'text-[#FFE66D] fill-[#FFE66D]' : 'text-[#FFE66D]'}`} />
              <span className="font-semibold text-xs text-[#FFE66D]">Team Bonus</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-2">{currentHole.bonusTask}</p>
            <p className="text-xs text-[#4ECDC4] mb-3">-1 point per player</p>
            
            {/* Slide to Complete */}
            {!teamBonusCompleted ? (
              <div className="relative bg-[#1A1A2E] rounded-full h-10 overflow-hidden">
                <input
                  type="range"
                  min="0"
                  max="100"
                  defaultValue="0"
                  onChange={(e) => {
                    if (parseInt(e.target.value) > 90) {
                      setTeamBonusCompleted(true);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xs font-semibold text-gray-400">← Slide to Complete</span>
                </div>
                <div className="absolute left-1 top-1 bottom-1 w-10 bg-[#FFE66D] rounded-full flex items-center justify-center pointer-events-none">
                  <Star className="w-4 h-4 text-[#1A1A2E]" />
                </div>
              </div>
            ) : (
              <div className="relative bg-[#FFE66D] rounded-full h-10 flex items-center justify-center">
                <span className="text-sm font-semibold text-[#1A1A2E]">✓ Completed!</span>
              </div>
            )}
          </div>
        )}

        {/* Map Section (Collapsible) */}
        {showMap && (
          <div className="mb-4 animate-fadeIn">
            <div className="h-32 rounded-xl overflow-hidden border border-gray-700">
              <MapClient bars={[currentHole]} />
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">{currentHole.address}</p>
          </div>
        )}

        {/* Team Photo Section */}
        <div className="mb-4">
          {!photoPreview ? (
            <div className="card border-2 border-dashed border-gray-600 hover:border-[#FF6B35] transition-all cursor-pointer">
              <label htmlFor="photo-upload" className="cursor-pointer block">
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="text-center py-6">
                  <Camera className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-sm mb-1">Take Photo</h3>
                  <p className="text-xs text-gray-500">Required to continue</p>
                </div>
              </label>
            </div>
          ) : (
            <div className="card relative animate-fadeIn">
              <button
                onClick={removePhoto}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
              >
                <XIcon className="w-4 h-4 text-white" />
              </button>
              <img
                src={photoPreview}
                alt="Team photo"
                className="w-full h-40 object-cover rounded-xl mb-2"
              />
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Check className="w-4 h-4" />
                <span className="text-xs font-semibold">Photo uploaded</span>
              </div>
            </div>
          )}
        </div>

        {/* Player Cards */}
        <div className="space-y-3 mb-4">
        {game.players.map((player, index) => {
          const playerSips = sips[player.id] || 0;
          const parDiff = playerSips - currentHole.par;
          
          return (
            <div 
              key={player.id} 
              className="card p-3"
            >
              {/* Player Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg flex-shrink-0" 
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-base truncate">{player.name}</div>
                    {playerSips > 0 && (
                      <div className="text-xs">
                        {parDiff === 0 && <span className="text-[#4ECDC4]">Perfect!</span>}
                        {parDiff < 0 && <span className="text-green-400">{Math.abs(parDiff)} under</span>}
                        {parDiff > 0 && <span className="text-orange-400">{parDiff} over</span>}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Sip Count */}
                <div className="text-right flex-shrink-0">
                  <div className="text-3xl font-bold text-gradient">{playerSips}</div>
                  <div className="text-xs text-gray-500 uppercase">sips</div>
                </div>
              </div>

              {/* Counter Controls */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleSipChange(player.id, playerSips - 1)} 
                  disabled={playerSips === 0}
                  className="flex-1 glass rounded-xl py-3 font-bold text-lg hover:bg-[#1A1A2E] transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                >
                  <Minus className="w-5 h-5 mx-auto" />
                </button>
                
                <button 
                  onClick={() => handleSipChange(player.id, currentHole.par)} 
                  className="flex-1 bg-gradient-to-br from-[#FF6B35] to-[#FFE66D] rounded-xl py-6 text-lg font-bold text-white hover:from-[#FFE66D] hover:to-[#FF6B35] transition-all active:scale-95 shadow-lg"
                >
                  Par
                </button>
                
                <button 
                  onClick={() => handleSipChange(player.id, playerSips + 1)} 
                  className="flex-1 glass rounded-xl py-3 font-bold text-lg hover:bg-[#1A1A2E] transition-all active:scale-95"
                >
                  <Plus className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>
          );
        })}
        </div>
      </div>

      {/* Bottom Action - Fixed */}
      <div className="px-4 pt-3 glass flex-shrink-0" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 20px))' }}>
        <button 
          onClick={submitScores} 
          disabled={!canSubmit || isSaving} 
          className="btn w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <Cloud className="w-5 h-5 animate-pulse" />
              Saving to Cloud...
            </>
          ) : canSubmit ? (
            <>
              {isLastHole ? (
                <>
                  <Trophy className="w-5 h-5" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-sm">Move to Next Bar</span>
              <div className="text-xs font-normal text-gray-400 mt-1">
                {!hasPhoto && "Take photo"}
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
