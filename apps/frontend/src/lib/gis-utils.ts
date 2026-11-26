import type { HealthThreshold } from '@/types/gis';

export function getColorFromScale(
  score: number,
  scale: HealthThreshold[],
): string {
  const threshold =
    scale.find((t) => score >= t.min && score <= t.max) ?? scale[scale.length - 1];
  return threshold?.color ?? '#1DB85E';
}

export function getLabelFromScale(
  score: number,
  scale: HealthThreshold[],
): string {
  const threshold =
    scale.find((t) => score >= t.min && score <= t.max) ?? scale[scale.length - 1];
  return threshold?.label ?? '—';
}

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function computeRingPerimeter(ring: [number, number][]): number {
  let perimeter = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    perimeter += haversineMeters(
      ring[i][0],
      ring[i][1],
      ring[i + 1][0],
      ring[i + 1][1],
    );
  }
  return perimeter;
}

export function computeRingCentroid(ring: [number, number][]): [number, number] {
  let lat = 0;
  let lng = 0;
  for (const [la, ln] of ring) {
    lat += la;
    lng += ln;
  }
  return [lat / ring.length, lng / ring.length];
}

export function ringAreaHectares(ring: [number, number][]): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6378137;
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [lat1, lng1] = ring[i];
    const [lat2, lng2] = ring[i + 1];
    const midLat = toRad((lat1 + lat2) / 2);
    const x1 = R * toRad(lng1) * Math.cos(midLat);
    const y1 = R * toRad(lat1);
    const x2 = R * toRad(lng2) * Math.cos(midLat);
    const y2 = R * toRad(lat2);
    area += x1 * y2 - x2 * y1;
  }
  return Math.abs(area) / 2 / 10000;
}

export interface ColorStop {
  t: number;
  color: string;
}

export function valueToColor(
  value: number,
  min: number,
  max: number,
  stops: ColorStop[],
): string {
  if (stops.length === 0) return '#1DB85E';
  if (stops.length === 1) return stops[0].color;
  const normalized = max === min ? 0 : Math.min(1, Math.max(0, (value - min) / (max - min)));
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (normalized >= a.t && normalized <= b.t) {
      const t = (normalized - a.t) / (b.t - a.t || 1);
      return interpolateColor(a.color, b.color, t);
    }
  }
  return stops[stops.length - 1].color;
}

function interpolateColor(a: string, b: string, t: number): string {
  const pa = hexToRgb(a);
  const pb = hexToRgb(b);
  const r = Math.round(pa.r + (pb.r - pa.r) * t);
  const g = Math.round(pa.g + (pb.g - pa.g) * t);
  const bl = Math.round(pa.b + (pb.b - pa.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace('#', '');
  const value =
    m.length === 3
      ? m
          .split('')
          .map((c) => c + c)
          .join('')
      : m;
  const num = parseInt(value, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function formatMeters(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(2)} km`;
  return `${Math.round(m)} m`;
}

export function formatHectares(ha: number): string {
  if (ha >= 100) return `${ha.toFixed(0)} ha`;
  return `${ha.toFixed(1)} ha`;
}
