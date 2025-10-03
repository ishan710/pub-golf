"use client";
import dynamic from 'next/dynamic';
import { Bar } from '@/types';
import 'leaflet/dist/leaflet.css';

const Map = dynamic(() => import('./MapInner'), { ssr: false });

export default function MapClient({ bars }: { bars: Bar[] }) {
  return <Map bars={bars} />;
}


