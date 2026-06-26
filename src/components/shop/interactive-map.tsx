"use client";

import { useEffect, useState, useRef } from "react";
import "leaflet/dist/leaflet.css";

const MAP_TILE_URLS = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
};

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  theme?: "dark" | "light";
}

export default function InteractiveMap({ latitude, longitude, theme = "dark" }: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [leafletLib, setLeafletLib] = useState<any>(null);

  // 1. Load leaflet dynamically only on the client
  useEffect(() => {
    let cancelled = false;
    import("leaflet").then((mod) => {
      if (!cancelled) setLeafletLib(mod.default ?? mod);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Initialize the map when leaflet loaded
  useEffect(() => {
    if (!leafletLib || !containerRef.current || mapRef.current) return;
    const L = leafletLib;

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 14,
      zoomControl: false,
    });

    // Add the dark/light Carto layer (without unresolved retina placeholder)
    L.tileLayer(MAP_TILE_URLS[theme], {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Create a beautiful, brand-aligned gold pin using divIcon with inline SVG to avoid broken unpkg resources
    const goldPin = L.divIcon({
      html: `
        <div style="transform: translate(-16px, -32px); filter: drop-shadow(0px 4px 10px rgba(0,0,0,0.5));">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="#c9a96e" stroke="#000000" stroke-width="1.5" stroke-linejoin="round"/>
            <circle cx="12" cy="9" r="3" fill="#000000"/>
          </svg>
        </div>
      `,
      className: "custom-map-marker",
      iconSize: [32, 32],
      iconAnchor: [0, 0],
    });

    // Add the custom marker
    L.marker([latitude, longitude], { icon: goldPin }).addTo(map);

    mapRef.current = map;

    // Cleanup on unmount
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [leafletLib, latitude, longitude, theme]);

  return (
    <div
      ref={containerRef}
      className="z-0 relative h-[220px] w-full sm:h-[260px] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden"
    />
  );
}
