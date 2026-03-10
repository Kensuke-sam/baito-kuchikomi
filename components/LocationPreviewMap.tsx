"use client";

import { useEffect, useRef, useState } from "react";
import type { LayerGroup, LeafletMouseEvent, Map as LeafletMap } from "leaflet";
import {
  SUBMISSION_AREA_PREVIEW_BOUNDS,
  SUBMISSION_AREA_REGIONS,
} from "@/lib/siteConfig";
import { escapeHtml } from "@/lib/sanitize";

interface Props {
  lat: number | null;
  lng: number | null;
  title?: string;
  address?: string;
  inSubmissionArea?: boolean | null;
  interactive?: boolean;
  onPickLocation?: (lat: number, lng: number) => void;
}

const DEFAULT_CENTER: [number, number] = [35.7281, 139.7103];

export default function LocationPreviewMap({
  lat,
  lng,
  title,
  address,
  inSubmissionArea,
  interactive = false,
  onPickLocation,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const lastViewportKeyRef = useRef<string | null>(null);
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
          center: DEFAULT_CENTER,
          zoom: 13,
          zoomControl: false,
        });

        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        L.control.zoom({ position: "topright" }).addTo(map);

        const handleResize = () => map.invalidateSize();
        cleanupResize = () => window.removeEventListener("resize", handleResize);
        window.addEventListener("resize", handleResize);

        requestAnimationFrame(() => map.invalidateSize());
        setMapReady(true);
      } catch {
        setMapError("地図を表示できませんでした。しばらくしてから再読み込みしてください。");
      }
    })();

    return () => {
      cancelled = true;
      cleanupResize?.();
      layerRef.current?.clearLayers();
      layerRef.current = null;
      leafletRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !interactive || !onPickLocation) return;

    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (event: LeafletMouseEvent) => {
      const nextLat = Number(event.latlng.lat.toFixed(6));
      const nextLng = Number(event.latlng.lng.toFixed(6));
      onPickLocation(nextLat, nextLng);
    };

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [interactive, mapReady, onPickLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.getContainer().style.cursor = interactive ? "crosshair" : "";
  }, [interactive, mapReady]);

  useEffect(() => {
    if (!mapReady) return;

    const map = mapRef.current;
    const layer = layerRef.current;
    const L = leafletRef.current;
    if (!map || !layer || !L) return;

    layer.clearLayers();

    for (const region of SUBMISSION_AREA_REGIONS) {
      const bounds: [[number, number], [number, number]] = [
        [region.minLat, region.minLng],
        [region.maxLat, region.maxLng],
      ];

      L.rectangle(bounds, {
        color: "#94a3b8",
        dashArray: "4 6",
        fillColor: "#2563eb",
        fillOpacity: 0.04,
        weight: 1,
      }).addTo(layer);
    }

    if (lat !== null && lng !== null) {
      const isBlocked = inSubmissionArea === false;
      const marker = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "preview-marker",
          html: `<div class="preview-marker__pin${isBlocked ? " preview-marker__pin--blocked" : ""}"><span class="preview-marker__dot"></span></div>`,
          iconSize: [28, 38],
          iconAnchor: [14, 34],
          popupAnchor: [0, -28],
        }),
      });

      const popupTitle = escapeHtml(title?.trim() || "入力中の勤務先");
      const popupAddress = escapeHtml(address?.trim() || "住所を入力するとここに表示されます");
      marker.bindPopup(
        `<div class="min-w-[200px] p-1">
          <p class="text-sm font-bold">${popupTitle}</p>
          <p class="mt-1 text-xs text-slate-500">${popupAddress}</p>
          <p class="mt-2 text-[11px] ${isBlocked ? "text-red-600" : "text-slate-500"}">
            ${isBlocked ? "受付対象外です" : "この位置で登録されます"}
          </p>
        </div>`
      );

      marker.addTo(layer);

      L.circle([lat, lng], {
        color: isBlocked ? "#dc2626" : "#2563eb",
        fillColor: isBlocked ? "#fecaca" : "#93c5fd",
        fillOpacity: 0.18,
        radius: 90,
        weight: 1,
      }).addTo(layer);

      const nextViewportKey = `${lat}:${lng}`;
      if (lastViewportKeyRef.current !== nextViewportKey) {
        marker.openPopup();
        map.flyTo([lat, lng], 17, { duration: 0.75 });
        lastViewportKeyRef.current = nextViewportKey;
      }
    } else {
      const bounds = L.latLngBounds(
        [SUBMISSION_AREA_PREVIEW_BOUNDS.minLat, SUBMISSION_AREA_PREVIEW_BOUNDS.minLng],
        [SUBMISSION_AREA_PREVIEW_BOUNDS.maxLat, SUBMISSION_AREA_PREVIEW_BOUNDS.maxLng]
      );
      if (lastViewportKeyRef.current !== "__regions__") {
        map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 });
        lastViewportKeyRef.current = "__regions__";
      }
    }

    requestAnimationFrame(() => map.invalidateSize());
  }, [address, inSubmissionArea, lat, lng, mapReady, title]);

  if (mapError) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50 px-6 text-center text-sm text-gray-600">
        {mapError}
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}
