'use client';

import { useRef, useMemo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const CONTOUR_PEAKS = [
  { cx: 0.25, cy: 0.35, r: 0.18, count: 6 },
  { cx: 0.72, cy: 0.55, r: 0.22, count: 8 },
  { cx: 0.50, cy: 0.70, r: 0.14, count: 5 },
  { cx: 0.85, cy: 0.25, r: 0.10, count: 4 },
];

function generateContourPath(
  cx: number, cy: number, radius: number,
  points = 64, noise = 0.04,
) {
  const segments: string[] = [];
  for (let i = 0; i <= points; i++) {
    const t = (i / points) * Math.PI * 2;
    const nx =
      Math.sin(t * 3 + cx * 10) * noise +
      Math.cos(t * 5 + cy * 8) * noise * 0.6 +
      Math.sin(t * 7 + cx * cy * 20) * noise * 0.3;
    const ny =
      Math.cos(t * 4 + cy * 12) * noise +
      Math.sin(t * 6 + cx * 7) * noise * 0.6 +
      Math.cos(t * 8 + cx * cy * 15) * noise * 0.3;
    const x = cx + (radius + nx) * Math.cos(t);
    const y = cy + (radius + ny) * Math.sin(t);
    segments.push(`${i === 0 ? 'M' : 'L'}${(x * 100).toFixed(2)},${(y * 100).toFixed(2)}`);
  }
  return segments.join('');
}

function ContourLayer() {
  const paths = useMemo(() => {
    const result: { d: string; opacity: number }[] = [];
    const allPaths: { d: string; opacity: number }[] = [];

    for (const peak of CONTOUR_PEAKS) {
      for (let i = 0; i < peak.count; i++) {
        const r = (peak.r / peak.count) * (i + 1);
        const opacity = 0.04 + (i / peak.count) * 0.08;
        allPaths.push({
          d: generateContourPath(peak.cx, peak.cy, r, 64, 0.03 + i * 0.005),
          opacity,
        });
      }
    }

    for (let i = 0; i < allPaths.length; i++) {
      result.push(allPaths[i]);
    }

    return result;
  }, []);

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill="none"
          stroke="currentColor"
          strokeWidth={0.04}
          opacity={p.opacity}
          className="text-brand-500"
        />
      ))}
    </svg>
  );
}

function GridLayer() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="gis-grid" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M5 0L0 0 0 5" fill="none" stroke="currentColor" strokeWidth={0.015} opacity={0.15} className="text-text-tertiary" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#gis-grid)" />
    </svg>
  );
}

function GridLayerSubdivisions() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="gis-grid-sub" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0L0 0 0 20" fill="none" stroke="currentColor" strokeWidth={0.025} opacity={0.08} className="text-brand-500/60" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#gis-grid-sub)" />
    </svg>
  );
}

interface Node {
  x: number;
  y: number;
  r: number;
  opacity: number;
}

const NODES: Node[] = [
  { x: 12, y: 18, r: 0.15, opacity: 0.4 },
  { x: 28, y: 32, r: 0.12, opacity: 0.3 },
  { x: 45, y: 22, r: 0.18, opacity: 0.5 },
  { x: 62, y: 35, r: 0.10, opacity: 0.35 },
  { x: 78, y: 28, r: 0.14, opacity: 0.4 },
  { x: 88, y: 15, r: 0.08, opacity: 0.25 },
  { x: 35, y: 55, r: 0.16, opacity: 0.45 },
  { x: 55, y: 60, r: 0.11, opacity: 0.3 },
  { x: 72, y: 50, r: 0.13, opacity: 0.35 },
  { x: 20, y: 70, r: 0.09, opacity: 0.25 },
  { x: 48, y: 78, r: 0.12, opacity: 0.3 },
  { x: 80, y: 72, r: 0.10, opacity: 0.25 },
  { x: 15, y: 45, r: 0.10, opacity: 0.3 },
  { x: 68, y: 85, r: 0.08, opacity: 0.2 },
  { x: 92, y: 55, r: 0.10, opacity: 0.25 },
];

const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [2, 6], [6, 7], [7, 8], [8, 4],
  [6, 9], [9, 10], [10, 11], [7, 10], [8, 11],
  [1, 12], [12, 6], [12, 9],
  [0, 12],
  [10, 13], [11, 13],
  [5, 14], [14, 11], [14, 8],
];

function DataMeshLayer() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      {EDGES.map(([i, j], idx) => {
        const a = NODES[i];
        const b = NODES[j];
        return (
          <line
            key={`e-${idx}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="currentColor"
            strokeWidth={0.03}
            opacity={0.08}
            className="text-cyan-400"
          />
        );
      })}
      {NODES.map((n, i) => (
        <g key={`n-${i}`}>
          <circle
            cx={n.x} cy={n.y} r={n.r}
            fill="currentColor"
            opacity={n.opacity * 0.5}
            className="text-brand-500"
          />
          <circle
            cx={n.x} cy={n.y} r={n.r * 2.5}
            fill="currentColor"
            opacity={n.opacity * 0.08}
            className="text-brand-500"
          />
        </g>
      ))}
    </svg>
  );
}

const COORDS = [
  { x: 8, y: 92, label: '26°50\'S 65°12\'W' },
  { x: 72, y: 6, label: '26°48\'S 65°10\'W' },
  { x: 88, y: 90, label: '26°52\'S 65°08\'W' },
];

function CoordinateLayer() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      {COORDS.map((c, i) => (
        <text
          key={i}
          x={c.x}
          y={c.y}
          fill="currentColor"
          fontSize={0.5}
          opacity={0.06}
          fontFamily="var(--font-geist-mono)"
          className="text-text-tertiary"
        >
          {c.label}
        </text>
      ))}
    </svg>
  );
}

function AmbientLightLayer() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 rounded-full opacity-[0.03]"
        style={{
          background:
            'radial-gradient(ellipse at center, #1DB85E 0%, transparent 70%)',
          animation: 'ambient-drift 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute -bottom-1/3 -left-1/4 w-2/3 h-2/3 rounded-full opacity-[0.02]"
        style={{
          background:
            'radial-gradient(ellipse at center, #06B6D4 0%, transparent 70%)',
          animation: 'ambient-drift 25s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 rounded-full opacity-[0.015]"
        style={{
          background:
            'radial-gradient(ellipse at center, #3DD87A 0%, transparent 70%)',
          animation: 'ambient-drift 30s ease-in-out infinite 5s',
        }}
      />
    </div>
  );
}

function mulberry32(a: number) {
  return () => {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function ParticlesLayer() {
  const prng = useMemo(() => mulberry32(42), []);
  const particles = useMemo(() => {
    const arr: { x: number; y: number; d: number; o: number; s: number }[] = [];
    for (let i = 0; i < 30; i++) {
      arr.push({
        x: prng() * 100,
        y: prng() * 100,
        d: 1 + prng() * 2,
        o: 0.02 + prng() * 0.04,
        s: 15 + prng() * 25,
      });
    }
    return arr;
  }, [prng]);

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      {particles.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={p.d}
          fill="currentColor"
          opacity={p.o}
          className="text-brand-400"
          style={{
            animation: `particle-float ${p.s}s ease-in-out infinite`,
            animationDelay: `${i * 1.2}s`,
          }}
        />
      ))}
    </svg>
  );
}

function NoiseTexture() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
        mixBlendMode: 'overlay',
      }}
    />
  );
}

export default function LandingBackground() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const gridY = useTransform(scrollYProgress, [0, 1], [0, 40]);
  const contourY = useTransform(scrollYProgress, [0, 1], [0, 20]);
  const meshY = useTransform(scrollYProgress, [0, 1], [0, -15]);
  const particleY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <div
      ref={sectionRef}
      className="fixed inset-0 overflow-hidden pointer-events-none bg-bg-canvas"
      style={{ zIndex: 0 }}
    >
      <NoiseTexture />

      <AmbientLightLayer />

      <motion.div className="absolute inset-0" style={{ y: gridY }}>
        <GridLayer />
        <GridLayerSubdivisions />
      </motion.div>

      <motion.div className="absolute inset-0" style={{ y: contourY }}>
        <ContourLayer />
      </motion.div>

      <motion.div className="absolute inset-0" style={{ y: meshY }}>
        <DataMeshLayer />
        <CoordinateLayer />
      </motion.div>

      <motion.div className="absolute inset-0" style={{ y: particleY }}>
        <ParticlesLayer />
      </motion.div>
    </div>
  );
}
