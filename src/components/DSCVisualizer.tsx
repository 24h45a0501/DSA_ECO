'use client';

import { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore, ThemeDef } from '@/store/theme-store';

interface Props { dataType: string; data: number[]; highlights: number[] }

// ─── UTILITIES ────────────────────────────────────────────
function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}
function ha(hex: string, a: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
function grad(hex: string, dir = '180deg') {
  const { r, g, b } = hexToRgb(hex);
  return `linear-gradient(${dir}, rgba(${r},${g},${b},0.25), rgba(${r},${g},${b},0.04))`;
}

// ─── PARTICLE BG ──────────────────────────────────────────
function ParticleBg({ theme }: { theme: ThemeDef }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d'); if (!ctx) return;
    let w = c.width = c.clientWidth, h = c.height = c.clientHeight;
    const { r, g, b } = hexToRgb(theme.primary);
    const count = theme.effects.particleCount;
    const pts = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.12, vy: (Math.random() - 0.5) * 0.12,
      rn: Math.random() * 1.5 + 0.5, a: Math.random() * 0.1 + 0.02,
    }));
    let anim: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.rn, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.a})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - dist / 90) * 0.05})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      anim = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { w = c.width = c.clientWidth; h = c.height = c.clientHeight; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [theme]);
  return <canvas ref={ref} className="absolute inset-0 pointer-events-none" />;
}

// ─── SPARKLE LAYER ────────────────────────────────────────
function SparkleLayer({ theme }: { theme: ThemeDef }) {
  const sparkles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i, x: 10 + Math.random() * 80, y: 10 + Math.random() * 80,
      s: 2 + Math.random() * 3, d: Math.random() * 3,
    })), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {sparkles.map(s => (
        <motion.div
          key={s.id} className="absolute rounded-full"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, background: theme.effects.sparkleColor,
            boxShadow: `0 0 ${s.s * 2}px ${theme.effects.sparkleColor}` }}
          animate={{ opacity: [0, 0.5, 0], scale: [0, 1.3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: s.d, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ─── HELPER: Get spring config from animation style ───────
function springConfig(theme: ThemeDef, delay = 0) {
  const map: Record<string, { stiffness: number; damping: number }> = {
    spring: { stiffness: 280, damping: 18 },
    bounce: { stiffness: 400, damping: 12 },
    gentle: { stiffness: 150, damping: 22 },
    energetic: { stiffness: 500, damping: 10 },
  };
  const cfg = map[theme.effects.animationStyle] || map.spring;
  return { type: 'spring' as const, ...cfg, delay };
}

// ─── ARRAY ─────────────────────────────────────────────────
function ArrayViz({ data, highlights, theme }: { data: number[]; highlights: number[]; theme: ThemeDef }) {
  const maxVal = Math.max(...data, 1);
  return (
    <div className="flex items-end justify-center gap-3 h-full px-6 py-5">
      <AnimatePresence>
        {data.map((v, i) => {
          const hl = highlights.includes(i);
          const h = Math.max(30, (v / maxVal) * 170);
          return (
            <motion.div key={`a-${i}-${v}`}
              initial={{ opacity: 0, y: 40, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3, y: -30 }}
              transition={springConfig(theme, i * 0.04)}
              className="relative flex flex-col items-center"
            >
              <motion.div layout
                animate={{
                  height: h,
                  background: hl
                    ? `linear-gradient(180deg, ${theme.primary}, ${ha(theme.primary, 0.3)}, ${ha(theme.primary, 0.08)})`
                    : `linear-gradient(180deg, #1a1a35, #0f0f20)`,
                  borderColor: hl ? ha(theme.primary, 0.6) : ha(theme.primary, 0.05),
                  boxShadow: hl
                    ? `0 0 30px ${ha(theme.primary, 0.4)}, 0 0 60px ${ha(theme.primary, 0.12)}`
                    : '0 2px 8px rgba(0,0,0,0.3)',
                }}
                className="w-11 rounded-lg border relative overflow-hidden"
              >
                {/* Highlight effect */}
                {hl && theme.effects.highlightEffect === 'pulse' && (
                  <motion.div animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 0.8, repeat: Infinity }}
                    className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${ha(theme.primary, 0.3)}, transparent)` }} />
                )}
                {hl && theme.effects.highlightEffect === 'scan' && (
                  <motion.div animate={{ top: ['-100%', '200%'] }} transition={{ duration: 0.6, repeat: Infinity }}
                    className="absolute left-0 right-0 h-8" style={{ background: `linear-gradient(180deg, transparent, ${ha(theme.primary, 0.2)}, transparent)` }} />
                )}
                {hl && theme.effects.highlightEffect === 'glow' && (
                  <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0" style={{ background: theme.primary, filter: 'blur(8px)' }} />
                )}
                {hl && theme.effects.highlightEffect === 'ripple' && (
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}
                    className="absolute inset-0 rounded-lg" style={{ border: `2px solid ${theme.primary}` }} />
                )}
                {hl && theme.effects.highlightEffect === 'rainbow' && (
                  <motion.div animate={{ background: ['#ff000033', '#00ff0033', '#0000ff33', '#ff000033'] }}
                    transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0" />
                )}
              </motion.div>
              <motion.span
                animate={{ color: hl ? theme.primary : '#94a3b8', scale: hl ? 1.2 : 1, y: hl ? -3 : 0 }}
                className="text-xs font-mono mt-1.5 font-bold"
              >{v}</motion.span>
              <span className="text-[8px] font-mono text-gray-700 mt-0.5">{i}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
      {data.length === 0 && <div className="text-gray-700 text-sm font-mono">∅ empty</div>}
    </div>
  );
}

// ─── LINKED LIST ───────────────────────────────────────────
function LinkedListViz({ data, highlights, theme }: { data: number[]; highlights: number[]; theme: ThemeDef }) {
  return (
    <div className="flex items-center justify-center h-full px-6 overflow-x-auto">
      <AnimatePresence>
        {data.map((v, i) => {
          const hl = highlights.includes(i);
          return (
            <motion.div key={`ll-${i}-${v}`}
              initial={{ opacity: 0, x: -40, scale: 0.3 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.2 }}
              transition={springConfig(theme, i * 0.06)}
              className="flex items-center"
            >
              <motion.div
                animate={{
                  borderColor: hl ? ha(theme.primary, 0.7) : ha(theme.primary, 0.08),
                  background: hl ? grad(theme.primary) : 'rgba(17,17,34,0.8)',
                  boxShadow: hl ? `0 0 30px ${ha(theme.primary, 0.35)}` : '0 2px 8px rgba(0,0,0,0.3)',
                  borderRadius: theme.effects.nodeStyle === 'rounded' ? '9999px' :
                    theme.effects.nodeStyle === 'sharp' ? '4px' : '16px',
                }}
                className="w-14 h-14 border-2 flex items-center justify-center relative"
              >
                <motion.span
                  animate={{ color: hl ? theme.primary : '#94a3b8', scale: hl ? 1.25 : 1 }}
                  className="text-sm font-mono font-bold"
                >{v}</motion.span>
                <span className="absolute -bottom-4 text-[7px] font-mono text-gray-700">#{i}</span>
              </motion.div>
              {i < data.length - 1 && (
                <motion.div initial={{ width: 0 }} animate={{ width: 32 }} className="relative mx-0.5">
                  <div className="h-[2px]" style={{ background: `linear-gradient(90deg, ${ha(theme.primary, 0.4)}, ${ha(theme.primary, 0.1)})` }} />
                  <div className="absolute -right-0.5 -top-[4px] w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-b-[4px] border-b-transparent"
                    style={{ borderLeftColor: ha(theme.primary, 0.35) }} />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ─── STACK ─────────────────────────────────────────────────
function StackViz({ data, highlights, theme }: { data: number[]; highlights: number[]; theme: ThemeDef }) {
  return (
    <div className="flex flex-col-reverse items-center justify-center h-full px-6">
      <AnimatePresence>
        {data.map((v, i) => {
          const isTop = i === data.length - 1;
          const hl = highlights.includes(i) || (isTop && !highlights.length);
          return (
            <motion.div key={`st-${i}-${v}`}
              initial={{ opacity: 0, y: -50, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.3 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22, delay: (data.length - 1 - i) * 0.05 }}
              className="relative mb-1.5"
            >
              <motion.div
                animate={{
                  borderColor: hl ? ha(theme.primary, 0.7) : ha(theme.primary, 0.06),
                  background: hl ? `linear-gradient(135deg, ${ha(theme.primary, 0.2)}, ${ha(theme.primary, 0.05)})` : 'rgba(17,17,34,0.6)',
                  boxShadow: hl ? `0 0 30px ${ha(theme.primary, 0.3)}` : '0 2px 4px rgba(0,0,0,0.2)',
                }}
                className="w-36 h-10 rounded-xl border flex items-center justify-center"
              >
                <motion.span animate={{ color: hl ? theme.primary : '#94a3b8', scale: hl ? 1.15 : 1 }}
                  className="text-sm font-mono font-bold">{v}</motion.span>
              </motion.div>
              {isTop && (
                <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="absolute -right-14 top-1/2 -translate-y-1/2">
                  <span className="text-[9px] font-mono font-bold" style={{ color: theme.primary }}>← TOP</span>
                  <motion.div className="h-[2px] rounded-full mt-0.5"
                    animate={{ width: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ background: `linear-gradient(90deg, transparent, ${ha(theme.primary, 0.5)}, transparent)` }} />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      {data.length === 0 && <div className="text-gray-700 text-sm font-mono">∅ empty</div>}
      {data.length > 0 && (
        <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 160, opacity: 1 }}
          className="h-1 rounded-full mt-1"
          style={{ background: `linear-gradient(90deg, transparent, ${ha(theme.primary, 0.35)}, transparent)` }} />
      )}
    </div>
  );
}

// ─── QUEUE ─────────────────────────────────────────────────
function QueueViz({ data, highlights, theme }: { data: number[]; highlights: number[]; theme: ThemeDef }) {
  return (
    <div className="flex items-center justify-center h-full px-6">
      <div className="relative flex items-center">
        <div className="absolute -bottom-2 left-0 right-0 flex items-center gap-1">
          {data.map((_, i) => (
            <motion.div key={i} className="flex-1 h-[2px] rounded-full"
              animate={{ background: highlights.includes(i) ? ha(theme.primary, 0.4) : 'rgba(255,255,255,0.03)' }} />
          ))}
        </div>
        <AnimatePresence>
          {data.map((v, i) => {
            const isFront = i === 0;
            const isRear = i === data.length - 1;
            const hl = highlights.includes(i);
            let bg = 'rgba(17,17,34,0.7)';
            let bc = ha(theme.primary, 0.06);
            let bs = '0 2px 8px rgba(0,0,0,0.3)';
            let lc = '#94a3b8';
            if (hl) { bg = grad(theme.primary); bc = ha(theme.primary, 0.7); bs = `0 0 25px ${ha(theme.primary, 0.3)}`; lc = theme.primary; }
            else if (isFront) { bg = 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))'; bc = 'rgba(34,197,94,0.5)'; bs = '0 0 15px rgba(34,197,94,0.15)'; lc = '#22c55e'; }
            else if (isRear) { bg = 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.04))'; bc = 'rgba(245,158,11,0.5)'; bs = '0 0 15px rgba(245,158,11,0.15)'; lc = '#f59e0b'; }
            return (
              <motion.div key={`q-${i}-${v}`}
                initial={{ opacity: 0, x: 60, scale: 0.4 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -60, scale: 0.4 }}
                transition={springConfig(theme, i * 0.05)}
                className="flex flex-col items-center mx-1">
                <motion.div animate={{ borderColor: bc, background: bg, boxShadow: bs }}
                  className="w-14 h-14 rounded-xl border-2 flex items-center justify-center">
                  <motion.span animate={{ color: lc, scale: hl ? 1.2 : 1 }}
                    className="text-sm font-mono font-bold">{v}</motion.span>
                </motion.div>
                {isFront && <span className="text-[8px] font-mono text-green-500 mt-1 font-bold">FRONT</span>}
                {isRear && <span className="text-[8px] font-mono text-amber-500 mt-1 font-bold">REAR</span>}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {data.length === 0 && <div className="text-gray-700 text-sm font-mono">∅ empty</div>}
      </div>
    </div>
  );
}

// ─── TREE ──────────────────────────────────────────────────
function TreeViz({ data, highlights, theme }: { data: number[]; highlights: number[]; theme: ThemeDef }) {
  const levels = Math.ceil(Math.log2(data.length + 1));
  const nodes = useMemo(() => data.map((v, i) => {
    const lvl = Math.floor(Math.log2(i + 1));
    const pos = i - Math.pow(2, lvl) + 1;
    const cnt = Math.pow(2, lvl);
    const off = Math.pow(2, levels - lvl - 1) * 55;
    return { id: i, v, x: (pos - cnt / 2 + 0.5) * off * 2 + 250, y: (levels - lvl) * 75 + 25 };
  }), [data]);
  return (
    <svg className="w-full h-full" viewBox="0 0 500 320" preserveAspectRatio="xMidYMid meet">
      {data.map((_, i) => {
        if (i === 0) return null;
        const from = nodes[Math.floor((i - 1) / 2)], to = nodes[i];
        if (!from || !to) return null;
        const hl = highlights.includes(i) || highlights.includes(from.id);
        return (
          <motion.line key={`e${i}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            stroke={hl ? ha(theme.primary, 0.5) : ha(theme.primary, 0.06)}
            strokeWidth={hl ? 2.5 : 1.5} strokeDasharray={hl ? 'none' : '5 3'} />
        );
      })}
      {nodes.map((n) => {
        const hl = highlights.includes(n.id);
        return (
          <motion.g key={n.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: n.id * 0.04 }}>
            <motion.circle cx={n.x} cy={n.y} r={18}
              animate={{
                fill: hl ? grad(theme.primary, '135deg') : 'rgba(17,17,34,0.7)',
                stroke: hl ? ha(theme.primary, 0.7) : ha(theme.primary, 0.08),
                filter: hl ? `drop-shadow(0 0 8px ${ha(theme.primary, 0.3)})` : 'none',
              }}
              strokeWidth={2.5} />
            {hl && (
              <motion.circle cx={n.x} cy={n.y} r={22}
                animate={{ opacity: [0, 0.35, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                fill={ha(theme.primary, 0.15)} />
            )}
            <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
              className="text-[10px] font-mono font-bold"
              style={{ fill: hl ? theme.primary : '#94a3b8' }} fontSize="11">{n.v}</text>
          </motion.g>
        );
      })}
    </svg>
  );
}

// ─── GRAPH ─────────────────────────────────────────────────
function GraphViz({ data, highlights, theme }: { data: number[]; highlights: number[]; theme: ThemeDef }) {
  const R = 130, cx = 200, cy = 110;
  const nodes = useMemo(() => data.map((v, i) => ({ id: i, v, x: cx + Math.cos((i / data.length) * Math.PI * 2) * R, y: cy + Math.sin((i / data.length) * Math.PI * 2) * R })), [data]);
  const edges = useMemo(() => { const e: { f: number; t: number }[] = []; data.forEach((_, i) => { for (let c = 1; c <= 2 && c < data.length; c++) { const j = (i + c) % data.length; if (j > i) e.push({ f: i, t: j }); } }); return e; }, [data]);
  return (
    <svg className="w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="xMidYMid meet">
      {edges.map((e, i) => {
        const hl = highlights.includes(e.f) || highlights.includes(e.t);
        return (
          <motion.line key={i} x1={nodes[e.f].x} y1={nodes[e.f].y} x2={nodes[e.t].x} y2={nodes[e.t].y}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            stroke={hl ? ha(theme.primary, 0.35) : ha(theme.primary, 0.05)}
            strokeWidth={hl ? 3 : 1.5} strokeDasharray="4 3" />
        );
      })}
      {nodes.map((n) => {
        const hl = highlights.includes(n.id);
        return (
          <motion.g key={n.id} initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 12 }}>
            <motion.circle cx={n.x} cy={n.y} r={16}
              animate={{
                fill: hl ? grad(theme.primary, '135deg') : 'rgba(17,17,34,0.7)',
                stroke: hl ? ha(theme.primary, 0.7) : ha(theme.primary, 0.08),
                filter: hl ? `drop-shadow(0 0 8px ${ha(theme.primary, 0.3)})` : 'none',
              }}
              strokeWidth={2.5} />
            <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
              className="text-[10px] font-mono font-bold"
              style={{ fill: hl ? theme.primary : '#94a3b8' }} fontSize="11">{n.v}</text>
          </motion.g>
        );
      })}
    </svg>
  );
}

// ─── HEAP ──────────────────────────────────────────────────
function HeapViz({ data, highlights, theme }: { data: number[]; highlights: number[]; theme: ThemeDef }) {
  const levels = Math.ceil(Math.log2(data.length + 1));
  const nodes = useMemo(() => data.map((v, i) => {
    const lvl = Math.floor(Math.log2(i + 1));
    const pos = i - Math.pow(2, lvl) + 1;
    const cnt = Math.pow(2, lvl);
    const off = Math.pow(2, levels - lvl - 1) * 45;
    return { id: i, v, x: (pos - cnt / 2 + 0.5) * off * 2 + 200, y: (levels - lvl) * 65 + 30, s: 15 + (levels - lvl) * 4 };
  }), [data]);
  return (
    <svg className="w-full h-full" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid meet">
      {nodes.map((n, i) => {
        if (i === 0) return null;
        const p = nodes[Math.floor((i - 1) / 2)];
        const hl = highlights.includes(i) || highlights.includes(p.id);
        return (
          <motion.line key={`e${i}`} x1={p.x} y1={p.y} x2={n.x} y2={n.y}
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            stroke={hl ? ha(theme.primary, 0.35) : ha(theme.primary, 0.05)}
            strokeWidth={hl ? 2.5 : 1.5} />
        );
      })}
      {nodes.map((n) => {
        const hl = highlights.includes(n.id);
        return (
          <motion.g key={n.id} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 14, delay: n.id * 0.04 }}>
            <motion.rect x={n.x - n.s / 2} y={n.y - n.s / 2} width={n.s} height={n.s} rx={5}
              animate={{
                fill: hl ? grad(theme.primary, '135deg') : 'rgba(17,17,34,0.7)',
                stroke: hl ? ha(theme.primary, 0.7) : ha(theme.primary, 0.08),
                filter: hl ? `drop-shadow(0 0 6px ${ha(theme.primary, 0.3)})` : 'none',
              }}
              strokeWidth={2.5} />
            <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle"
              className="text-[9px] font-mono font-bold"
              style={{ fill: hl ? theme.primary : '#94a3b8' }} fontSize="10">{n.v}</text>
          </motion.g>
        );
      })}
    </svg>
  );
}

// ─── MAIN ──────────────────────────────────────────────────
export default function DSCVisualizer({ dataType, data, highlights }: Props) {
  const { currentTheme } = useThemeStore();
  const t = dataType.toLowerCase();
  const theme = currentTheme;

  const viz = (() => {
    if (t.includes('array') || t === 'hash-table') return <ArrayViz data={data} highlights={highlights} theme={theme} />;
    if (t.includes('list')) return <LinkedListViz data={data} highlights={highlights} theme={theme} />;
    if (t.includes('stack')) return <StackViz data={data} highlights={highlights} theme={theme} />;
    if (t.includes('queue') || t.includes('deque')) return <QueueViz data={data} highlights={highlights} theme={theme} />;
    if (t.includes('heap')) return <HeapViz data={data} highlights={highlights} theme={theme} />;
    if (t.includes('graph') || t.includes('dag')) return <GraphViz data={data} highlights={highlights} theme={theme} />;
    if (t.includes('tree') || t.includes('bst') || t.includes('avl') || t.includes('trie')) return <TreeViz data={data} highlights={highlights} theme={theme} />;
    return <ArrayViz data={data} highlights={highlights} theme={theme} />;
  })();

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl border border-white/5"
      style={{ background: `linear-gradient(135deg, ${theme.bgFrom}, ${theme.bgTo})` }}>
      <ParticleBg theme={theme} />
      <SparkleLayer theme={theme} />
      {theme.effects.scanLine && (
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]">
          <div className="animate-scan-line w-full h-px absolute" style={{ background: theme.primary }} />
        </div>
      )}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      <div className="relative z-10 w-full h-full flex items-center justify-center">{viz}</div>
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l rounded-tl" style={{ borderColor: ha(theme.primary, 0.2) }} />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r rounded-tr" style={{ borderColor: ha(theme.primary, 0.2) }} />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l rounded-bl" style={{ borderColor: ha(theme.primary, 0.2) }} />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r rounded-br" style={{ borderColor: ha(theme.primary, 0.2) }} />
    </div>
  );
}
