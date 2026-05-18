"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";
import L from "leaflet";

// Fix default marker icon issue with Leaflet in Next.js/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface AddressMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ onLocationSelect }: AddressMapProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  const map = useMapEvents({
    click(e: L.LeafletMouseEvent) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, 15); // Zoom level 15 for better detail
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
    locationerror(e) {
      console.warn("Location error:", e.message);
    }
  });

  // Automatically request location when the component mounts
  useEffect(() => {
    map.locate();
  }, [map]);

  // Setup Geocoder Search Bar
  useEffect(() => {
    if (!map) return;
    
    // @ts-expect-error L.Control.geocoder is injected by leaflet-control-geocoder
    const geocoder = L.Control.geocoder({
      defaultMarkGeocode: false,
      placeholder: "Cari alamat...",
    })
      .on('markgeocode', function(e: any) {
        const latlng = e.geocode.center;
        setPosition(latlng);
        map.flyTo(latlng, 15);
        onLocationSelect(latlng.lat, latlng.lng);
      })
      .addTo(map);

    return () => {
      map.removeControl(geocoder);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function AddressMap({ onLocationSelect }: AddressMapProps) {
  const defaultCenter: L.LatLngExpression = [-6.200000, 106.816666]; // Default to Jakarta
  const [map, setMap] = useState<L.Map | null>(null);

  const handleLocate = () => {
    if (map) {
      map.locate();
    }
  };

  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-outline-variant relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} />
      </MapContainer>

      {/* Custom Button for Geolocation */}
      <button
        type="button"
        onClick={handleLocate}
        title="Gunakan Lokasi Saat Ini"
        className="absolute bottom-6 right-2 z-[400] bg-white text-primary p-3 rounded-full shadow-lg border border-outline-variant hover:bg-primary-container hover:text-on-primary-container transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
          <line x1="12" y1="2" x2="12" y2="4"/>
          <line x1="12" y1="20" x2="12" y2="22"/>
          <line x1="20" y1="12" x2="22" y2="12"/>
          <line x1="2" y1="12" x2="4" y2="12"/>
        </svg>
      </button>
    </div>
  );
}
