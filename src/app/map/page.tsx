"use client";
import { nycBars } from '@/data/nycBars';
import MapClient from '@/components/MapClient';
import { MapPin, Navigation } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MapPage() {
  const router = useRouter();
  
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
          <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#FFE66D] rounded-2xl flex items-center justify-center">
            <Navigation className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Course Map</h1>
            <p className="text-gray-400">All {nycBars.length} NYC bars</p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 px-6 pb-6">
        <div className="h-full rounded-2xl overflow-hidden border border-gray-700 shadow-2xl">
          <MapClient bars={nycBars} />
        </div>
      </div>

      {/* Bar List */}
      <div className="glass px-6 py-4 max-h-64 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#FF6B35]" />
          All Locations
        </h2>
        <div className="space-y-2">
          {nycBars.map((bar, index) => (
            <div 
              key={bar.id} 
              className="flex items-center justify-between p-3 rounded-xl bg-[#1A1A2E] hover:bg-[#252540] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B35] to-[#FFE66D] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <div>
                  <div className="font-semibold text-sm">{bar.name}</div>
                  <div className="text-xs text-gray-500">{bar.neighborhood}</div>
                </div>
              </div>
              <div className="badge badge-warning text-xs">
                Par {bar.par}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
