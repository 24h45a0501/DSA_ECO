'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Zap, Swords, Code2, Palette, Play, Shuffle, RotateCcw, ChevronRight, Sparkles, Star } from 'lucide-react';
import { themes, useThemeStore } from '@/store/theme-store';

// ─── HEX TO RGBA ──────────────────────────────────────────
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

// ─── MINI DEMO PLAYGROUND ─────────────────────────────────
function MiniDemo() {
  const { currentTheme } = useThemeStore();
  const [data, setData] = useState([10, 20, 30, 40, 50]);
  const [highlights, setHighlights] = useState<number[]>([]);
  const [log, setLog] = useState('Ready — click an operation');

  const run = (op: string) => {
    let val = Math.floor(Math.random() * 90) + 10;
    switch (op) {
      case 'Insert':
        setData(d => [...d, val]);
        setHighlights([data.length]);
        setLog(`insert(${val}) → appended`);
        break;
      case 'Delete':
        if (data.length > 0) {
          setData(d => d.slice(0, -1));
          setLog('pop() → removed last');
        }
        break;
      case 'Search':
        const target = data[Math.floor(Math.random() * data.length)];
        const idx = data.indexOf(target);
        if (idx !== -1) {
          setHighlights([idx]);
          setLog(`search(${target}) → found at index ${idx}`);
        }
        break;
      case 'Reverse':
        setData(d => [...d].reverse());
        setLog('reverse() → reversed');
        break;
      case 'Sort':
        setData(d => [...d].sort((a, b) => a - b));
        setLog('sort() → sorted ascending');
        break;
      case 'Random':
        const arr = Array.from({ length: 5 }, () => Math.floor(Math.random() * 90) + 10);
        setData(arr);
        setLog(`rand() → [${arr.join(', ')}]`);
        break;
    }
    setTimeout(() => setHighlights([]), 1200);
  };

  const maxVal = Math.max(...data, 1);

  return (
    <div className="rounded-2xl border overflow-hidden backdrop-blur-sm"
      style={{ background: `${currentTheme.bgFrom}dd`, borderColor: ha(currentTheme.primary, 0.15) }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: ha(currentTheme.primary, 0.08) }}>
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5" style={{ color: currentTheme.primary }} />
          <span className="text-xs font-mono font-semibold" style={{ color: currentTheme.primary }}>
            playground@demo
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono text-gray-600">n={data.length}</span>
          <span className="w-1 h-1 rounded-full" style={{ background: data.length > 0 ? '#22c55e' : '#6b7280' }} />
        </div>
      </div>

      {/* Visualization */}
      <div className="h-40 flex items-end justify-center gap-2 px-4 py-4">
        <AnimatePresence>
          {data.map((v, i) => {
            const hl = highlights.includes(i);
            const h = Math.max(24, (v / maxVal) * 110);
            return (
              <motion.div key={`${i}-${v}`}
                initial={{ opacity: 0, y: 30, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.3 }}
                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: i * 0.04 }}
                className="relative flex flex-col items-center"
              >
                <motion.div
                  animate={{
                    height: h,
                    background: hl
                      ? `linear-gradient(180deg, ${currentTheme.primary}, ${ha(currentTheme.primary, 0.3)})`
                      : `linear-gradient(180deg, #1a1a35, #0f0f20)`,
                    borderColor: hl ? ha(currentTheme.primary, 0.6) : ha(currentTheme.primary, 0.05),
                    boxShadow: hl ? `0 0 20px ${ha(currentTheme.primary, 0.4)}` : '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                  className="w-8 rounded-lg border relative overflow-hidden"
                >
                  {hl && (
                    <motion.div animate={{ opacity: [0, 0.5, 0] }} transition={{ duration: 0.8, repeat: Infinity }}
                      className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${ha(currentTheme.primary, 0.3)}, transparent)` }} />
                  )}
                </motion.div>
                <span className={`text-[9px] font-mono font-bold mt-1 ${hl ? 'text-white' : 'text-gray-500'}`}
                  style={{ color: hl ? currentTheme.primary : undefined }}>{v}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        {data.length === 0 && <div className="text-gray-700 text-sm font-mono">∅ empty</div>}
      </div>

      {/* Operation buttons */}
      <div className="flex items-center gap-1.5 px-4 pb-3 flex-wrap">
        {['Insert', 'Delete', 'Search', 'Reverse', 'Sort', 'Random'].map((op) => (
          <motion.button
            key={op}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => run(op)}
            className="px-2.5 py-1 rounded-lg text-[9px] font-mono border transition-all hover:text-white"
            style={{
              background: ha(currentTheme.primary, 0.06),
              borderColor: ha(currentTheme.primary, 0.15),
              color: '#9ca3af',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = ha(currentTheme.primary, 0.12); e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = ha(currentTheme.primary, 0.06); e.currentTarget.style.color = '#9ca3af'; }}
          >
            {op}
          </motion.button>
        ))}
        <button onClick={() => { setData([10, 20, 30, 40, 50]); setHighlights([]); setLog('reset() → default values'); }}
          className="ml-auto p-1.5 rounded-lg text-gray-600 hover:text-gray-300 transition-all">
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>

      {/* Log */}
      <div className="px-4 pb-3">
        <AnimatePresence mode="wait">
          <motion.div key={log} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
            className="text-[9px] font-mono truncate" style={{ color: ha(currentTheme.primary, 0.5) }}>
            <span className="text-gray-700">$ </span>{log}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const { currentTheme, setTheme } = useThemeStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showDemo, setShowDemo] = useState(false);

  // Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pts = Array.from({ length: 70 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      s: Math.random() * 2 + 0.5, a: Math.random() * 0.25 + 0.05,
    }));
    let anim: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { r, g, b } = hexToRgb(currentTheme.primary);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${p.a})`; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(${r},${g},${b},${(1 - dist / 100) * 0.06})`;
            ctx.lineWidth = 0.5; ctx.stroke();
          }
        }
      }
      anim = requestAnimationFrame(draw);
    };
    draw();
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(anim); window.removeEventListener('resize', resize); };
  }, [currentTheme]);

  return (
    <main className="relative min-h-screen bg-black overflow-hidden">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      <div className="fixed inset-0 z-[1]"
        style={{ background: `radial-gradient(ellipse at center, ${ha(currentTheme.primary, 0.06)} 0%, transparent 70%)` }}
      />
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-black z-[1]" />
      {currentTheme.effects.scanLine && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[2] opacity-[0.025]">
          <div className="animate-scan-line w-full h-px absolute" style={{ background: currentTheme.primary }} />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center min-h-screen px-4 pt-20 pb-16">
        {/* 🎨 THEME SELECTOR — Circular Swatches */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col items-center"
        >
          <div className="flex items-center gap-1.5 mb-3">
            <Palette className="w-3 h-3" style={{ color: ha(currentTheme.primary, 0.5) }} />
            <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: ha(currentTheme.primary, 0.4) }}>
              Choose Theme
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            {themes.map((t) => {
              const isActive = currentTheme.id === t.id;
              return (
                <motion.button
                  key={t.id}
                  whileHover={{ scale: 1.12, y: -2 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setTheme(t)}
                  className="relative flex flex-col items-center gap-1"
                >
                  {/* Color swatch */}
                  <div
                    className="rounded-full border-2 transition-all duration-300"
                    style={{
                      width: isActive ? 38 : 30,
                      height: isActive ? 38 : 30,
                      background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                      borderColor: isActive ? '#fff' : ha(t.primary, 0.2),
                      boxShadow: isActive
                        ? `0 0 20px ${ha(t.primary, 0.5)}, 0 0 40px ${ha(t.primary, 0.2)}`
                        : '0 2px 8px rgba(0,0,0,0.3)',
                    }}
                  />
                  {/* Theme name */}
                  <span
                    className="text-[8px] font-mono whitespace-nowrap transition-all"
                    style={{
                      color: isActive ? t.primary : '#4b5563',
                      fontWeight: isActive ? 700 : 400,
                      opacity: isActive ? 1 : 0.6,
                    }}
                  >
                    {t.name.split(' ').slice(1).join(' ')}
                  </span>
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="themeIndicator"
                      className="absolute -bottom-0.5 w-4 h-0.5 rounded-full"
                      style={{ background: t.primary }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl"
        >
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-4 tracking-tighter">
            <span style={{
              color: currentTheme.primary,
              textShadow: `0 0 40px ${ha(currentTheme.primary, 0.3)}, 0 0 80px ${ha(currentTheme.primary, 0.12)}`,
            }}>
              DSC
            </span>
            <span className="text-gray-600">_ECO</span>
          </h1>

          <div className="text-lg md:text-xl text-gray-500 font-mono mb-2">
            <span style={{ color: ha(currentTheme.primary, 0.6) }}>$</span> execute --interactive --visualize --learn
          </div>

          <p className="text-base text-gray-600 mb-10 max-w-xl mx-auto font-mono">
            Interactive platform for mastering data structures through real-time visualization, simulation, and AI-powered guidance.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => router.push('/workspace')}
              className="group relative px-7 py-3.5 rounded-xl text-white font-semibold text-base overflow-hidden transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                boxShadow: `0 4px 25px ${ha(currentTheme.primary, 0.35)}`,
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Launch Workspace
              </span>
            </button>

            <button
              onClick={() => { setShowDemo(!showDemo); setTimeout(() => { if (!showDemo) document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 100); }}
              className="px-7 py-3.5 rounded-xl border text-gray-300 font-semibold text-base bg-black/50 hover:bg-white/5 transition-all hover:scale-105 flex items-center gap-2"
              style={{ borderColor: ha(currentTheme.primary, 0.3) }}
            >
              <Play className="w-4 h-4" /> Explore Structures
            </button>

            <button
              onClick={() => router.push('/arena')}
              className="px-7 py-3.5 rounded-xl border text-gray-300 font-semibold text-base bg-black/50 hover:bg-white/5 transition-all hover:scale-105 flex items-center gap-2"
              style={{ borderColor: ha(currentTheme.primary, 0.3) }}
            >
              <Swords className="w-4 h-4" /> Battle Arena
            </button>
          </div>
        </motion.div>

        {/* 🎮 INTERACTIVE DEMO PLAYGROUND — appears on "Explore Structures" click */}
        <AnimatePresence>
          {showDemo && (
            <motion.div
              id="demo-section"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="w-full max-w-2xl mt-12"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: currentTheme.primary }} />
                  <span className="text-xs font-mono font-semibold text-gray-300">Live Demo — Try Operations</span>
                </div>
                <button onClick={() => setShowDemo(false)}
                  className="text-[9px] font-mono text-gray-600 hover:text-gray-300 transition-all px-2 py-1 rounded-lg border border-transparent hover:border-white/10">
                  Close ✕
                </button>
              </div>
              <MiniDemo />
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-[9px] font-mono text-gray-700">Click any operation to see it animate in real-time</span>
                <ChevronRight className="w-3 h-3 text-gray-700" />
                <button
                  onClick={() => router.push('/workspace')}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold text-white transition-all"
                  style={{ background: currentTheme.primary, boxShadow: `0 2px 12px ${ha(currentTheme.primary, 0.3)}` }}
                >
                  Open Full Workspace →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Theme Effect Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-3xl mx-auto w-full"
        >
          {[
            { label: 'Animation', value: currentTheme.effects.animationStyle, icon: '⚡' },
            { label: 'Highlight', value: currentTheme.effects.highlightEffect, icon: '✨' },
            { label: 'Bars', value: currentTheme.effects.barStyle, icon: '📊' },
            { label: 'Nodes', value: currentTheme.effects.nodeStyle, icon: '●' },
          ].map((feat, i) => (
            <div key={i} className="rounded-xl p-2.5 text-center border backdrop-blur-sm flex flex-col items-center gap-1"
              style={{ background: ha(currentTheme.primary, 0.05), borderColor: ha(currentTheme.primary, 0.12) }}>
              <span className="text-sm">{feat.icon}</span>
              <div className="text-[8px] font-mono uppercase tracking-wider" style={{ color: ha(currentTheme.primary, 0.5) }}>
                {feat.label}
              </div>
              <div className="text-xs font-semibold text-white capitalize">{feat.value}</div>
            </div>
          ))}
        </motion.div>

        {/* Footer stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-10 flex items-center gap-5 text-xs font-mono text-gray-700"
        >
          <span>{themes.length} Themes</span>
          <span className="w-1 h-1 rounded-full bg-gray-800" />
          <span>40+ Structures</span>
          <span className="w-1 h-1 rounded-full bg-gray-800" />
          <span>50+ Operations</span>
          <span className="w-1 h-1 rounded-full bg-gray-800" />
          <span>Real-time FX</span>
        </motion.div>
      </div>
    </main>
  );
}
