"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import type { LayerGroup, Map as LeafletMap } from "leaflet";
import type { Place } from "@/lib/types";
import { escapeHtml } from "@/lib/sanitize";

interface Props {
  places: Place[];
  onPlaceClick?: (place: Place) => void;
}

export default function Map({ places, onPlaceClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerLayerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const [mapError, setMapError] = useState("");
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;
    let cleanupResize: (() => void) | undefined;

    void (async () => {
      try {
        const L = await import("leaflet");
        if (cancelled || !containerRef.current || mapRef.current) return;

        leafletRef.current = L;

        const map = L.map(containerRef.current, {
          center: [35.7281, 139.7103], // 池袋
          zoom: 13,
          zoomControl: false,
        });

        mapRef.current = map;
        markerLayerRef.current = L.layerGroup().addTo(map);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);

        const handleResize = () => map.invalidateSize();
        cleanupResize = () => window.removeEventListener("resize", handleResize);
        window.addEventListener("resize", handleResize);

        requestAnimationFrame(() => {
          map.invalidateSize();
        });
        setMapReady(true);
      } catch {
        setMapError("地図の初期化に失敗しました。少し時間を置いて再読み込みしてください。");
      }
    })();

    return () => {
      cancelled = true;
      cleanupResize?.();
      markerLayerRef.current?.clearLayers();
      markerLayerRef.current = null;
      leafletRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  const addMarkers = useCallback(() => {
    const map = mapRef.current;
    const markerLayer = markerLayerRef.current;
    const L = leafletRef.current;
    if (!map || !markerLayer || !L) return;

    markerLayer.clearLayers();

    places.forEach((place) => {
      const marker = L.marker([place.lat, place.lng], {
        icon: L.divIcon({
          className: "place-marker",
          html: `
            <div class="place-marker__inner" title="${escapeHtml(place.name)}">
              <span aria-hidden="true">📋</span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -18],
        }),
      });

      marker.bindPopup(
        `<div class="p-2 min-w-[180px]">
          <p class="font-bold text-sm">${escapeHtml(place.name)}</p>
          <p class="text-xs text-gray-500 mt-0.5">${escapeHtml(place.address)}</p>
          <a href="/places/${encodeURIComponent(place.id)}" class="text-xs text-blue-600 underline mt-1 block">
            体験談を見る →
          </a>
        </div>`
      );

      if (onPlaceClick) {
        marker.on("click", () => onPlaceClick(place));
      }

      marker.addTo(markerLayer);
    });

    if (places.length > 1) {
      const bounds = L.latLngBounds(places.map((place) => [place.lat, place.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else if (places.length === 1) {
      map.flyTo([places[0].lat, places[0].lng], 14);
    } else {
      map.setView([35.7281, 139.7103], 13);
    }

    requestAnimationFrame(() => {
      map.invalidateSize();
    });
  }, [places, onPlaceClick]);

  useEffect(() => {
    if (!mapReady) return;
    addMarkers();
  }, [addMarkers, mapReady]);

  if (mapError) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 px-6 text-center text-sm text-gray-600">
        {mapError}
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full" />;
}
