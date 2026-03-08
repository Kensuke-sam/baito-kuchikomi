"use client";

import { useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import type { Place } from "@/lib/types";

interface Props {
  places: Place[];
  onPlaceClick?: (place: Place) => void;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function Map({ places, onPlaceClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [139.7103, 35.7281], // 池袋
      zoom: 13,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const addMarkers = useCallback(() => {
    if (!mapRef.current) return;

    // 既存マーカーをクリア
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    places.forEach((place) => {
      const el = document.createElement("div");
      el.className =
        "w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg cursor-pointer flex items-center justify-center text-white text-xs font-bold hover:bg-blue-700 transition-colors";
      el.textContent = "📋";
      el.title = place.name;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
        .setHTML(
          `<div class="p-2 min-w-[180px]">
            <p class="font-bold text-sm">${escapeHtml(place.name)}</p>
            <p class="text-xs text-gray-500 mt-0.5">${escapeHtml(place.address)}</p>
            <a href="/places/${encodeURIComponent(place.id)}" class="text-xs text-blue-600 underline mt-1 block">
              体験談を見る →
            </a>
          </div>`
        );

      const marker = new mapboxgl.Marker(el)
        .setLngLat([place.lng, place.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      if (onPlaceClick) {
        el.addEventListener("click", () => onPlaceClick(place));
      }

      markersRef.current.push(marker);
    });

    // マーカーが複数あればすべて表示されるようにフィット
    if (places.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      places.forEach((p) => bounds.extend([p.lng, p.lat]));
      mapRef.current.fitBounds(bounds, { padding: 60, maxZoom: 15 });
    } else if (places.length === 1) {
      mapRef.current.flyTo({ center: [places[0].lng, places[0].lat], zoom: 14 });
    }
  }, [places, onPlaceClick]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (mapRef.current.loaded()) {
      addMarkers();
    } else {
      mapRef.current.once("load", addMarkers);
    }
  }, [addMarkers]);

  return <div ref={containerRef} className="w-full h-full" />;
}
