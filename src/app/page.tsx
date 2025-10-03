"use client";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/gameStore";
import { useState, useEffect } from "react";
import { Play, Users, MapPin, Trophy, Check, ArrowRight, Image as ImageIcon, Award } from "lucide-react";
import { predefinedPlayers } from "@/data/players";
import { playerColors } from "@/data/nycBars";
import { getRandomBonusTask } from "@/data/bonusTasks";
import { getRecentPhotos, getLiveLeaderboard } from "@/lib/cloudStorage";
import { TeamScoreRecord } from "@/lib/supabase";
import { Player } from "@/types";

export default function Home() {
  const router = useRouter();
  const { createGame } = useGameStore();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedName, setSelectedName] = useState<string>("");
  const [team, setTeam] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [recentPhotos, setRecentPhotos] = useState<TeamScoreRecord[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadCloudData();
  }, []);

  const loadCloudData = async () => {
    try {
      const [photos, standings] = await Promise.all([
        getRecentPhotos(12),
        getLiveLeaderboard()
      ]);
      setRecentPhotos(photos);
      setLeaderboard(standings);
    } catch (error) {
      console.error('Error loading cloud data:', error);
    }
  };

  useEffect(() => {
    if (selectedName && mounted) {
      // Generate random team of 4
      const availablePlayers = predefinedPlayers.filter(p => p !== selectedName);
      const shuffled = [...availablePlayers].sort(() => Math.random() - 0.5);
      const teammates = shuffled.slice(0, 3);
      setTeam([selectedName, ...teammates]);
    } else {
      setTeam([]);
    }
  }, [selectedName, mounted]);

  const handleStart = async () => {
    if (team.length === 0) return;
    
    setIsCreating(true);
    
    const quickCourse = [
      { id: 'bar-1', name: "Sing Sing Bar", neighborhood: 'East Village', address: '9 St Marks Pl, New York, NY 10003', par: 3, latitude: 40.7293, longitude: -73.9885, bonusTask: getRandomBonusTask() },
      { id: 'bar-2', name: 'Barcade', neighborhood: 'Chelsea', address: '148 W 24th St, New York, NY 10011', par: 4, latitude: 40.7447, longitude: -73.9955, bonusTask: getRandomBonusTask() },
      { id: 'bar-3', name: "McSorley's Old Ale House", neighborhood: 'East Village', address: '15 E 7th St, New York, NY 10003', par: 3, latitude: 40.7284, longitude: -73.9896, bonusTask: getRandomBonusTask() },
      { id: 'bar-4', name: 'Sake Bar Decibel', neighborhood: 'East Village', address: '240 E 9th St, New York, NY 10003', par: 5, latitude: 40.7262, longitude: -73.9835, bonusTask: getRandomBonusTask() },
      { id: 'bar-5', name: 'The Copper Still', neighborhood: 'East Village', address: '59 E 7th St, New York, NY 10003', par: 4, latitude: 40.7272, longitude: -73.9847, bonusTask: getRandomBonusTask() },
      { id: 'bar-6', name: 'The Headless Widow', neighborhood: 'East Village', address: '228 E 14th St, New York, NY 10003', par: 3, latitude: 40.7317, longitude: -73.9827, bonusTask: getRandomBonusTask() },
      { id: 'bar-7', name: 'Holiday Cocktail Bar', neighborhood: 'East Village', address: '75 St Marks Pl, New York, NY 10003', par: 4, latitude: 40.7280, longitude: -73.9845, bonusTask: getRandomBonusTask() },
      { id: 'bar-8', name: 'PinwApple Club', neighborhood: 'East Village', address: '509 E 6th St, New York, NY 10009', par: 5, latitude: 40.7242, longitude: -73.9776, bonusTask: getRandomBonusTask() },
      { id: 'bar-9', name: "Miss Lily's 7A", neighborhood: 'East Village', address: '109 Avenue A, New York, NY 10009', par: 4, latitude: 40.7255, longitude: -73.9826, bonusTask: getRandomBonusTask() },
      { id: 'bar-10', name: '886', neighborhood: 'East Village', address: '5 St Marks Pl, New York, NY 10003', par: 3, latitude: 40.7294, longitude: -73.9889, bonusTask: getRandomBonusTask() },
      { id: 'bar-11', name: "Lucinda's", neighborhood: 'East Village', address: '14 1st Ave, New York, NY 10009', par: 4, latitude: 40.7233, longitude: -73.9881, bonusTask: getRandomBonusTask() },
    ];
    
    const players: Player[] = team.map((playerName, index) => ({
      id: `player-${Date.now()}-${index}`,
      name: playerName,
      color: playerColors[index % playerColors.length],
    }));

    createGame("Ishan's Birthday Pub Golf", quickCourse, players);
    
    setTimeout(() => {
      setIsCreating(false);
      router.push('/game');
    }, 1000);
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#0F0F1E] via-[#1A1A2E] to-[#0F0F1E] flex flex-col overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#FF6B35] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#4ECDC4] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FFE66D] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Tab Navigation */}
      <div className="relative z-10 flex border-b border-gray-800 flex-shrink-0">
        <button
          onClick={() => setShowGallery(false)}
          className={`flex-1 py-3 text-sm font-semibold transition-all ${
            !showGallery ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]' : 'text-gray-500'
          }`}
        >
          Play
        </button>
        <button
          onClick={() => setShowGallery(true)}
          className={`flex-1 py-3 text-sm font-semibold transition-all ${
            showGallery ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]' : 'text-gray-500'
          }`}
        >
          Gallery & Leaders
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        {!showGallery ? (
          // ===== PLAY TAB =====
          <div className="flex flex-col h-full px-4 py-4">
            {/* Header */}
            <div className="text-center mb-3 flex-shrink-0">
              <div className="mb-3 flex justify-center">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FFE66D] rounded-xl flex items-center justify-center shadow-glow transform rotate-3">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#4ECDC4] rounded-full animate-bounce"></div>
                </div>
              </div>

              <h1 className="text-3xl font-bold mb-2 text-gradient leading-tight">
                Pub Golf NYC
              </h1>
              <p className="text-base text-gray-400 mb-3">
                Ishan's Birthday 🎉
              </p>

              {!selectedName ? (
                <>
                  <h2 className="text-lg font-semibold mb-1">Who are you?</h2>
                  <p className="text-xs text-gray-400">Select your name</p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-semibold mb-1">Your Team</h2>
                  <p className="text-xs text-gray-400">Ready to start?</p>
                </>
              )}
            </div>

            {/* Player Selection or Team Display */}
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              {!selectedName ? (
                // Player Selection List
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-2 pb-2">
                    {predefinedPlayers.map((name) => (
                      <button
                        key={name}
                        onClick={() => setSelectedName(name)}
                        disabled={isCreating}
                        className="card w-full p-3 text-left transition-all border border-gray-700 hover:border-[#FF6B35] active:scale-95"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-base truncate flex-1 mr-2">{name}</span>
                          <ArrowRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                // Team Display
                <div className="flex-1 overflow-y-auto animate-fadeIn">
                  <div className="space-y-2 pb-2">
                    {team.map((name, index) => (
                      <div
                        key={name}
                        className={`card p-3 flex items-center gap-3 animate-fadeInUp ${
                          index === 0 ? 'border-2 border-[#FF6B35]' : ''
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0"
                          style={{ backgroundColor: playerColors[index % playerColors.length] }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-base truncate">{name}</div>
                          {index === 0 && (
                            <div className="text-xs text-[#FF6B35] font-medium">That's you!</div>
                          )}
                        </div>
                        {index === 0 && (
                          <Check className="w-5 h-5 text-[#FF6B35] flex-shrink-0" />
                        )}
                      </div>
                    ))}
                    
                    <button
                      onClick={() => setSelectedName("")}
                      className="btn-outline w-full mt-2 py-2 rounded-2xl font-semibold text-sm"
                    >
                      Change Player
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedName && (
              <div className="pt-3 pb-safe flex-shrink-0">
                <button 
                  onClick={handleStart}
                  disabled={isCreating}
                  className="btn w-full py-4 text-base animate-fadeIn"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      Starting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <Play className="w-5 h-5" fill="white" />
                      Start
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          // ===== GALLERY & LEADERBOARD TAB =====
          <div className="flex flex-col h-full overflow-y-auto px-4 py-4">
            {/* Live Leaderboard */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-[#FFE66D]" />
                <h2 className="text-xl font-bold">Live Leaders</h2>
              </div>
              
              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((team, index) => (
                    <div key={team.gameId} className="card p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="text-2xl font-bold text-gray-600">#{index + 1}</div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm truncate">{team.gameName}</div>
                            <div className="text-xs text-gray-400">
                              {team.players.slice(0, 3).join(', ')}
                              {team.players.length > 3 && ` +${team.players.length - 3}`}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-2xl font-bold text-gradient">{team.totalScore}</div>
                          <div className="text-xs text-gray-500">{team.holesPlayed} bars</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass rounded-xl p-8 text-center">
                  <Trophy className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No games yet. Be the first!</p>
                </div>
              )}
            </div>

            {/* Photo Gallery */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon className="w-5 h-5 text-[#4ECDC4]" />
                <h2 className="text-xl font-bold">Recent Photos</h2>
              </div>
              
              {recentPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {recentPhotos.map((photo, index) => (
                    photo.photo_url && (
                      <div key={photo.id || index} className="relative aspect-square rounded-xl overflow-hidden glass">
                        <img
                          src={photo.photo_url}
                          alt={`${photo.bar_name}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-xs font-semibold truncate">{photo.bar_name}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {photo.players.map(p => p.name).slice(0, 2).join(', ')}
                          </p>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="glass rounded-xl p-8 text-center">
                  <ImageIcon className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No photos yet. Start a game!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
