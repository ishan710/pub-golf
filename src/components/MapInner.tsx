"use client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Bar } from '@/types';

const icon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapInner({ bars }: { bars: Bar[] }) {
  const center: [number, number] = [40.72, -73.99];
  const barsWithCoords = bars.filter((b) => b.latitude && b.longitude);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden">
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {barsWithCoords.map((bar) => (
          <Marker key={bar.id} position={[bar.latitude as number, bar.longitude as number]} icon={icon}>
            <Popup>
              <div>
                <p className="font-semibold">{bar.name}</p>
                <p className="text-xs">{bar.neighborhood}</p>
                <p className="text-xs text-gray-600">{bar.address}</p>
                <p className="text-xs mt-1">Par {bar.par}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}


