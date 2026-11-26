function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function latLngToMeters(lat: number, lng: number): [number, number] {
  const R = 6378137;
  const x = lng * (Math.PI / 180) * R;
  const y = lat * (Math.PI / 180) * R;
  return [x, y];
}

function metersToLatLng(x: number, y: number): [number, number] {
  const R = 6378137;
  const lng = x / (R * (Math.PI / 180));
  const lat = y / (R * (Math.PI / 180));
  return [lat, lng];
}

export function generateFieldPolygon(
  lat: number,
  lng: number,
  areaHectares: number,
  seed: number,
): number[][][] {
  const prng = mulberry32(seed);
  const sideMeters = Math.sqrt(areaHectares * 10000) * (0.85 + prng() * 0.3);
  const aspect = 0.6 + prng() * 0.8;
  const w = sideMeters * Math.sqrt(aspect);
  const h = sideMeters / Math.sqrt(aspect);
  const angle = prng() * Math.PI * 2;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const [cx, cy] = latLngToMeters(lat, lng);

  const corners: [number, number][] = [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ];

  const points: [number, number][] = [];
  const steps = 20;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ci = (i % 4) as 0 | 1 | 2 | 3;
    const ni = ((i + 1) % 4) as 0 | 1 | 2 | 3;
    const frac = (i % 1) || 0;

    const x0 = corners[ci][0];
    const y0 = corners[ci][1];
    const x1 = corners[ni][0];
    const y1 = corners[ni][1];

    const noise =
      (prng() - 0.5) * w * 0.04 +
      Math.sin(t * Math.PI * 6 + seed) * w * 0.02 +
      Math.cos(t * Math.PI * 10 + seed * 2) * w * 0.01;

    const lfrac = frac + noise / Math.max(w, h);
    const lx = x0 + (x1 - x0) * lfrac;
    const ly = y0 + (y1 - y0) * lfrac;

    const rx = cx + lx * cos - ly * sin;
    const ry = cy + lx * sin + ly * cos;

    const [plat, plng] = metersToLatLng(rx, ry);
    points.push([plat, plng]);
  }

  const coordinates = points.map(([lat, lng]) => [lng, lat] as [number, number]);
  coordinates.push(coordinates[0]);

  return [coordinates];
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return '#1DB85E';
  if (score >= 60) return '#3B82F6';
  if (score >= 40) return '#F59A00';
  return '#EF4444';
}

export function getHealthScoreLabel(score: number): string {
  if (score >= 80) return 'Excelente';
  if (score >= 60) return 'Bueno';
  if (score >= 40) return 'Regular';
  return 'Crítico';
}
