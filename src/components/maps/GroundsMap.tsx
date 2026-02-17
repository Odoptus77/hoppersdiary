"use client";

import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useMemo, useRef } from "react";

type GroundPin = {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lng: number;
};

export function GroundsMap({ pins }: { pins: GroundPin[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const bounds = useMemo(() => {
    const b = new mapboxgl.LngLatBounds();
    for (const p of pins) b.extend([p.lng, p.lat]);
    return b;
  }, [pins]);

  useEffect(() => {
    if (!token) return;
    if (!containerRef.current) return;
    if (mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [10.0, 51.0],
      zoom: 4,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    (map as any).__markers?.forEach((m: mapboxgl.Marker) => m.remove());
    (map as any).__markers = [];

    for (const p of pins) {
      const el = document.createElement("div");
      el.style.width = "12px";
      el.style.height = "12px";
      el.style.borderRadius = "999px";
      el.style.background = "#1e3a8a";
      el.style.boxShadow = "0 0 0 2px white";

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([p.lng, p.lat])
        .setPopup(new mapboxgl.Popup({ offset: 14 }).setText(p.name))
        .addTo(map);

      el.addEventListener("click", () => {
        window.location.href = `/grounds/${p.slug}`;
      });

      (map as any).__markers.push(marker);
    }

    if (pins.length >= 2) {
      map.fitBounds(bounds, { padding: 40, maxZoom: 12, duration: 400 });
    } else if (pins.length === 1) {
      map.flyTo({ center: [pins[0].lng, pins[0].lat], zoom: 12, duration: 400 });
    }
  }, [pins, bounds]);

  if (!token) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-red-700">
        Mapbox Token fehlt. Setze <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> in Vercel.
      </div>
    );
  }

  if (!pins.length) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/70">
        Keine Koordinaten vorhanden. Füge bei einem Ground lat/lng hinzu, dann erscheinen Pins.
      </div>
    );
  }

  return <div ref={containerRef} className="h-[420px] w-full rounded-2xl border border-black/10" />;
}
