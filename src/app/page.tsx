"use client";
import { MapPin, ChevronLeft, ChevronRight, Camera, Plus, Minus, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import MapClient from "@/components/MapClient";
import { uploadTeamPhoto, savePhotoRecord, getAllPhotos } from "@/lib/cloudStorage";
import { PhotoRecord } from "@/lib/supabase";

const bars = [
  {
    id: 1,
    name: "The Belfry",
    address: "408 E 14th St, New York, NY 10009",
    latitude: 40.7297,
    longitude: -73.9806,
    par: 8,
    drinks: [
      "Yuzu Lager",
      "Espresso Martini",
      "Apple Martini"
    ]
  },
  {
    id: 2,
    name: "Jackdaw",
    address: "E 13th St, New York, NY",
    latitude: 40.7310,
    longitude: -73.9870,
    par: 4,
    drinks: [
      "Margarita Picante",
      "Sloop Juice Bomb IPA or Wolffer Estate Rosé Cider",
      "Spicy Lemonade Shots (2)"
    ]
  },
  {
    id: 3,
    name: "12th Street Ale House",
    address: "E 12th St, New York, NY",
    latitude: 40.7320,
    longitude: -73.9880,
    par: 3,
    drinks: [
      "Surprise drink – any three"
    ]
  },
  {
    id: 4,
    name: "Ten Degrees",
    address: "New York, NY",
    latitude: 40.7330,
    longitude: -73.9890,
    par: 1,
    drinks: [
      "Bottle of wine – Campo Viejo, Macabeo Cava Brut"
    ]
  },
  {
    id: 5,
    name: "Augurs Well Bar",
    address: "New York, NY",
    latitude: 40.7280,
    longitude: -73.9860,
    par: 3,
    drinks: [
      "Well Drinks (3) - Vodka Soda, etc."
    ]
  },
  {
    id: 6,
    name: "ROMEO's",
    address: "New York, NY",
    latitude: 40.7290,
    longitude: -73.9850,
    par: 3,
    drinks: [
      "The Big Meech - Shot + Drink + Beer combo"
    ]
  },
  {
    id: 7,
    name: "Pit Stop – Kolachi",
    address: "New York, NY",
    latitude: 40.7285,
    longitude: -73.9840,
    par: 0,
    drinks: [
      "Rolls and sandwiches"
    ],
    isFood: true
  },
  {
    id: 8,
    name: "The Copper Still",
    address: "E 10th–11th St, New York, NY",
    latitude: 40.7272,
    longitude: -73.9847,
    par: 3,
    drinks: [
      "Drinks TBD"
    ]
  },
  {
    id: 9,
    name: "Sing Sing",
    address: "St. Marks Pl, New York, NY",
    latitude: 40.7293,
    longitude: -73.9885,
    par: 3,
    drinks: [
      "Karaoke stop – drinks TBD"
    ]
  },
  {
    id: 10,
    name: "Barcade",
    address: "St. Marks Pl, New York, NY",
    latitude: 40.7280,
    longitude: -73.9845,
    par: 3,
    drinks: [
      "Drinks TBD"
    ]
  }
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [sips, setSips] = useState<{ [key: number]: number }>({});
  const [activeTab, setActiveTab] = useState<'course' | 'score' | 'media'>('course');
  const [uploading, setUploading] = useState(false);
  const [allPhotos, setAllPhotos] = useState<PhotoRecord[]>([]);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState(0);
  const gameId = 'ishans-birthday-2025';
  
  const totalPar = bars.filter(b => !b.isFood).reduce((sum, bar) => sum + bar.par, 0);
  const totalSips = Object.values(sips).reduce((sum, s) => sum + s, 0);
  const totalDiff = totalSips - totalPar;
  const currentBar = bars[currentIndex];
  const currentSips = sips[currentBar.id] || 0;
  const parDiff = currentBar.isFood ? 0 : currentSips - currentBar.par;
  const newPhotosCount = allPhotos.filter(p => p.timestamp > lastSeenTimestamp).length;

  // Mark photos as seen when viewing Media tab
  useEffect(() => {
    if (activeTab === 'media' && allPhotos.length > 0) {
      const latestTimestamp = Math.max(...allPhotos.map(p => p.timestamp));
      setLastSeenTimestamp(latestTimestamp);
      localStorage.setItem('pubgolf-last-seen', latestTimestamp.toString());
    }
  }, [activeTab, allPhotos]);

  // Load sips and last seen timestamp from localStorage on mount
  useEffect(() => {
    const savedSips = localStorage.getItem('pubgolf-sips');
    if (savedSips) {
      setSips(JSON.parse(savedSips));
    }
    
    const savedLastSeen = localStorage.getItem('pubgolf-last-seen');
    if (savedLastSeen) {
      setLastSeenTimestamp(parseInt(savedLastSeen));
    }
  }, []);

  // Load photos from Supabase
  useEffect(() => {
    const loadPhotos = async () => {
      try {
        const photos = await getAllPhotos(100);
        setAllPhotos(photos);
    } catch (error) {
        console.error('Error loading photos from Supabase:', error);
    }
  };

    loadPhotos();
  }, []);


  // Save to localStorage when sips change
  useEffect(() => {
    if (Object.keys(sips).length > 0) {
      localStorage.setItem('pubgolf-sips', JSON.stringify(sips));
    }
  }, [sips]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const horizontalDistance = touchStart.x - touchEnd.x;
    const verticalDistance = touchStart.y - touchEnd.y;
    
    // Only trigger horizontal swipe if horizontal movement is greater than vertical
    const isHorizontalSwipe = Math.abs(horizontalDistance) > Math.abs(verticalDistance);
    
    if (isHorizontalSwipe) {
      const isLeftSwipe = horizontalDistance > 75;
      const isRightSwipe = horizontalDistance < -75;
      
      if (isLeftSwipe && currentIndex < bars.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
      if (isRightSwipe && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < bars.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      const photoUrl = await uploadTeamPhoto(file, gameId, `bar-${currentBar.id}`);
      
      if (photoUrl) {
        await savePhotoRecord(gameId, `bar-${currentBar.id}`, currentBar.name, photoUrl);
        
        // Reload all photos to update Media tab
        const photos = await getAllPhotos(100);
        setAllPhotos(photos);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setUploading(false);
      // Reset input to allow same file upload again
      e.target.value = '';
    }
  };


  const incrementSips = () => {
    setSips(prev => ({
      ...prev,
      [currentBar.id]: (prev[currentBar.id] || 0) + 1
    }));
  };

  const decrementSips = () => {
    setSips(prev => ({
      ...prev,
      [currentBar.id]: Math.max(0, (prev[currentBar.id] || 0) - 1)
    }));
  };

  const setToPar = () => {
    setSips(prev => ({
      ...prev,
      [currentBar.id]: currentBar.par
    }));
  };

  return (
    <div className="h-screen h-[100dvh] bg-gradient-to-br from-[#0F0F1E] via-[#1A1A2E] to-[#0F0F1E] flex flex-col">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 flex-shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-gradient">Ishan's Birthday</h1>
        <p className="text-xs sm:text-sm text-gray-400">Pub Golf NYC 🎉</p>
        </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 flex-shrink-0">
        <button
          onClick={() => setActiveTab('course')}
          className={`flex-1 py-3 text-sm font-semibold ${
            activeTab === 'course' ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]' : 'text-gray-500'
          }`}
        >
          Course
        </button>
        <button
          onClick={() => setActiveTab('score')}
          className={`flex-1 py-3 text-sm font-semibold ${
            activeTab === 'score' ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]' : 'text-gray-500'
          }`}
        >
          Score
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-3 text-sm font-semibold relative ${
            activeTab === 'media' ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]' : 'text-gray-500'
          }`}
        >
          Media
          {newPhotosCount > 0 && activeTab !== 'media' && (
            <span className="absolute -top-0.5 right-1/4 bg-[#FF6B35] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {newPhotosCount}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'course' && (
          <div 
            className="h-full overflow-y-scroll relative"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="px-4 py-4 pb-8">
          {/* Bar Info with Navigation */}
          <div className="mb-3">
            <div className="flex items-center justify-between gap-10 mb-10">
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="glass px-5 py-5 rounded-xl disabled:opacity-20"
              >
                <ChevronLeft className="w-7 h-7 text-gray-300" />
              </button>
              
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFE66D] flex items-center justify-center text-white text-xs font-bold">
                    {currentIndex + 1}
                  </span>
                  <h2 className="text-xl font-bold">{currentBar.name}</h2>
                  {!currentBar.isFood && (
                    <div className="badge badge-warning text-xs">Par {currentBar.par}</div>
                  )}
                </div>
                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {currentBar.address}
                </p>
              </div>

              <button
                onClick={goToNext}
                disabled={currentIndex === bars.length - 1}
                className="glass px-5 py-5 rounded-xl disabled:opacity-20"
              >
                <ChevronRight className="w-7 h-7 text-gray-300" />
              </button>
            </div>
          </div>

          {/* Sips Counter */}
          {!currentBar.isFood && (
            <div className="card p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Your Score</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gradient">{currentSips}</span>
                    <span className="text-sm text-gray-400">/ {currentBar.par}</span>
                  </div>
                  {currentSips > 0 && (
                    <div className="text-xs mt-1">
                      {parDiff === 0 && <span className="text-[#4ECDC4]">Perfect 🎯</span>}
                      {parDiff < 0 && <span className="text-green-400">{Math.abs(parDiff)} under 🔥</span>}
                      {parDiff > 0 && <span className="text-orange-400">+{parDiff}</span>}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={decrementSips} disabled={currentSips === 0} className="flex-1 glass rounded-xl py-3 disabled:opacity-30">
                  <Minus className="w-5 h-5 mx-auto" />
                </button>
                <button onClick={setToPar} className="flex-1 bg-gradient-to-br from-[#FF6B35] to-[#FFE66D] rounded-xl py-3 text-base font-bold text-white">
                  Par
                </button>
                <button onClick={incrementSips} className="flex-1 glass rounded-xl py-3">
                  <Plus className="w-5 h-5 mx-auto" />
                </button>
              </div>
            </div>
          )}
              
          {/* Drinks */}
          <div className="card p-5 mb-4">
            <h3 className="text-xs font-semibold text-[#FFE66D] mb-3">DRINKS</h3>
            <div className="space-y-2">
              {currentBar.drinks.map((drink, i) => (
                <div key={i} className="text-sm text-gray-300">
                  • {drink}
                </div>
              ))}
            </div>
          </div>

          {/* Photo Upload */}
          <label htmlFor={`photo-${currentBar.id}`} className={`card border-2 border-dashed border-gray-600 hover:border-[#FF6B35] cursor-pointer p-5 mb-4 block ${uploading ? 'opacity-50' : ''}`}>
            <input
              id={`photo-${currentBar.id}`}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className="flex items-center justify-center gap-2 text-gray-400">
              {uploading ? (
                <>
                  <Upload className="w-5 h-5 animate-pulse" />
                  <span className="text-sm">Uploading...</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span className="text-sm">Take Photo</span>
                </>
              )}
            </div>
          </label>
              
          {/* Map */}
          <div className="h-72 rounded-xl overflow-hidden border border-gray-700">
            <MapClient bars={[{
              id: currentBar.id.toString(),
              name: currentBar.name,
              address: currentBar.address,
              latitude: currentBar.latitude,
              longitude: currentBar.longitude,
              par: currentBar.par,
              neighborhood: ''
            }]} />
                        </div>

                  </div>
                </div>
        )}

        {activeTab === 'score' && (
          <div className="h-full overflow-y-scroll px-4 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            {totalSips > 0 && (
              <button
                onClick={() => {
                  if (confirm('Reset all scores to 0?')) {
                    setSips({});
                    localStorage.removeItem('pubgolf-sips');
                  }
                }}
                className="text-xs text-gray-500 mb-3 mx-auto block"
              >
                Reset
              </button>
            )}

            <div className="card p-6 mb-4 text-center">
              <div className="text-xs text-gray-500 mb-2">TOTAL SCORE</div>
              <div className="text-6xl font-bold text-gradient mb-2">{totalSips}</div>
              <div className="text-sm text-gray-400">out of {totalPar} par</div>
              {totalSips > 0 && (
                <div className="mt-3 text-base">
                  {totalDiff === 0 && <span className="text-[#4ECDC4]">Perfect Round! 🎯</span>}
                  {totalDiff < 0 && <span className="text-green-400">{Math.abs(totalDiff)} under par 🔥</span>}
                  {totalDiff > 0 && <span className="text-orange-400">+{totalDiff}</span>}
                </div>
              )}
            </div>

            <h2 className="text-xs font-semibold text-gray-400 mb-2">BY BAR</h2>
            <div className="space-y-2">
              {bars.filter(b => !b.isFood).map((bar, index) => {
                const barSips = sips[bar.id] || 0;
                const barDiff = barSips - bar.par;
                
                return (
                  <div key={bar.id} className="card p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFE66D] flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </span>
                          <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate">{bar.name}</div>
                        {barSips > 0 && (
                          <div className="text-xs">
                            {barDiff === 0 && <span className="text-[#4ECDC4]">Even</span>}
                            {barDiff < 0 && <span className="text-green-400">{Math.abs(barDiff)} under</span>}
                            {barDiff > 0 && <span className="text-orange-400">+{barDiff}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div className="text-2xl font-bold text-gradient">{barSips}</div>
                      <div className="text-xs text-gray-500">/ {bar.par}</div>
                </div>
                </div>
                );
              })}
            </div>
          </div>
        )}
              
        {activeTab === 'media' && (
          <div className="h-full overflow-y-scroll px-4 py-4" style={{ WebkitOverflowScrolling: 'touch' }}>
            {allPhotos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                {allPhotos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-900">
                    <img src={photo.photo_url} alt={photo.bar_name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                      <p className="text-xs font-semibold truncate text-white">{photo.bar_name}</p>
                      <p className="text-xs text-gray-300 truncate">
                        {new Date(photo.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                  ))}
                </div>
              ) : (
              <div className="glass rounded-xl p-12 text-center mt-8">
                <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-base text-gray-400">No photos yet</p>
                <p className="text-xs text-gray-500 mt-2">Upload photos in the Course tab</p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
