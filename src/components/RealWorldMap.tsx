"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { resolveCountryLocation, COUNTRIES_DATABASE } from "@/lib/countryLocations";

interface HubItem {
  id: string;
  name: string;
  focus?: string;
  timezone?: string;
  lat?: number;
  lng?: number;
}

interface RealWorldMapProps {
  hubs: HubItem[];
  activeHubId: string | null;
  onSelectHub: (id: string | null) => void;
  className?: string;
}

export default function RealWorldMap({
  hubs,
  activeHubId,
  onSelectHub,
  className = ""
}: RealWorldMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect and observe theme changes (dark / light)
  useEffect(() => {
    const checkDark = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setIsDarkMode(isDark);
    };

    checkDark();

    const observer = new MutationObserver(() => {
      checkDark();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });

    return () => observer.disconnect();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [25, 10],
      zoom: 2,
      minZoom: 1.5,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
      scrollWheelZoom: false,
    });

    // Custom modern zoom control in bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      tileLayerRef.current = null;
    };
  }, []);

  // Switch Tile Layer depending on Theme & Brand Colors
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const tileUrl = isDarkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    const newTileLayer = L.tileLayer(tileUrl, {
      subdomains: "abcd",
      maxZoom: 19,
      className: isDarkMode ? "map-tiles-dark" : "map-tiles-light",
    });

    newTileLayer.addTo(map);
    tileLayerRef.current = newTileLayer;
  }, [isDarkMode]);

  // Update Markers whenever hubs list, activeHub, or theme changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    hubs.forEach((hub) => {
      let lat = hub.lat;
      let lng = hub.lng;

      if (lat === undefined || lng === undefined || (lat === 0 && lng === 0)) {
        const resolved = resolveCountryLocation(hub.name);
        const dbData = COUNTRIES_DATABASE[resolved.name];
        if (dbData) {
          lat = dbData.lat;
          lng = dbData.lng;
        } else {
          lat = 20;
          lng = 0;
        }
      }

      const isActive = activeHubId === hub.id;

      // Brand Color Pin Marker with Theme Adaptations
      const pinOuterColor = isActive
        ? "bg-[#E9BD36] border-[#0306AC] text-[#0306AC]"
        : isDarkMode
        ? "bg-[#0306AC] border-[#E9BD36] text-[#E9BD36]"
        : "bg-[#0306AC] border-white text-white";

      const pinDotColor = isActive ? "bg-[#0306AC]" : "bg-[#E9BD36]";
      const pingRingColor = isActive ? "bg-[#E9BD36]/50" : "bg-[#0306AC]/30";

      const tooltipBg = isDarkMode
        ? "bg-[#0c0c16] text-white border border-white/10"
        : "bg-white text-slate-900 border border-slate-200 shadow-xl";

      const customIcon = L.divIcon({
        className: "custom-hub-marker",
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 34px; height: 34px; transform: translate(-50%, -50%);">
            <!-- Ping animation ring -->
            <div class="absolute w-8 h-8 rounded-full ${pingRingColor} animate-ping"></div>
            <!-- Outer border circle -->
            <div class="relative flex items-center justify-center w-5 h-5 rounded-full border-2 ${pinOuterColor} shadow-md transition-all duration-300 ${isActive ? 'scale-125 ring-2 ring-[#E9BD36]' : 'hover:scale-110'}">
              <div class="w-1.5 h-1.5 rounded-full ${pinDotColor}"></div>
            </div>
            <!-- Hover Tooltip -->
            <div class="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-50 whitespace-nowrap">
              <div class="${tooltipBg} text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#E9BD36]"></span>
                ${hub.name}
              </div>
              <div class="w-2 h-2 ${isDarkMode ? 'bg-[#0c0c16] border-r border-b border-white/10' : 'bg-white border-r border-b border-slate-200'} rotate-45 -mt-1"></div>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        onSelectHub(hub.id);
        map.flyTo([lat, lng], Math.max(map.getZoom(), 4), { duration: 1.2 });
      });

      marker.on("mouseover", () => {
        onSelectHub(hub.id);
      });

      markersRef.current.set(hub.id, marker);
    });
  }, [hubs, activeHubId, isDarkMode, onSelectHub]);

  // Smooth Fly-to effect when activeHubId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !activeHubId) return;

    const activeHub = hubs.find((h) => h.id === activeHubId);
    if (!activeHub) return;

    let lat = activeHub.lat;
    let lng = activeHub.lng;

    if (lat === undefined || lng === undefined) {
      const resolved = resolveCountryLocation(activeHub.name);
      const dbData = COUNTRIES_DATABASE[resolved.name];
      if (dbData) {
        lat = dbData.lat;
        lng = dbData.lng;
      }
    }

    if (lat !== undefined && lng !== undefined) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 3.5), {
        duration: 1,
        easeLinearity: 0.25,
      });
    }
  }, [activeHubId, hubs]);

  return (
    <div className={`relative w-full h-full min-h-[380px] sm:min-h-[440px] rounded-2xl overflow-hidden shadow-inner ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Reset Map View Button */}
      <div className="absolute bottom-3 left-3 z-10">
        <button
          type="button"
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([25, 10], 2, { duration: 1 });
              onSelectHub(null);
            }
          }}
          className="bg-white/95 dark:bg-[#12121e]/95 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-800 dark:text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
        >
          Reset Global View
        </button>
      </div>
    </div>
  );
}
