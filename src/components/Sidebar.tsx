'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { catalog, useStore } from '@/store/dsc-store';
import { useThemeStore, themes } from '@/store/theme-store';

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

export default function Sidebar() {
  const { currentGroup, selectGroup, currentStructure, selectStructure } = useStore();
  const { currentTheme, setTheme } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const c = currentTheme.primary;

  return (
    <div className={`fixed left-0 top-0 h-screen z-30 transition-all duration-300 flex flex-col ${collapsed ? 'w-14' : 'w-56'}`}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="animate-scan-line w-full h-px absolute" style={{ background: c }} />
      </div>

      <div className="h-full backdrop-blur-xl border-r flex flex-col" style={{ background: `${currentTheme.bgFrom}cc`, borderColor: `${ha(c, 0.15)}` }}>
        {/* Logo */}
        <div className={`border-b flex items-center ${collapsed ? 'justify-center p-3' : 'p-3 gap-2'}`} style={{ borderColor: ha(c, 0.1) }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: c }}>
            <span className="text-xs font-bold text-white">D</span>
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-bold text-white tracking-tight">DSC<span style={{ color: c }}>_ECO</span></div>
              <div className="text-[8px] font-mono" style={{ color: ha(c, 0.5) }}>{currentTheme.effects.label}</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-gray-700 hover:text-gray-300 text-[10px] transition-colors">
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto p-2 space-y-3">
          {catalog.map((cat) => (
            <div key={cat.id}>
              {!collapsed && (
                <div className="px-2 mb-1">
                  <span className="text-[9px] font-mono uppercase tracking-[0.2em]" style={{ color: ha(c, 0.45) }}>{cat.name}</span>
                </div>
              )}
              <div className="space-y-0.5">
                {cat.groups.map((group) => {
                  const active = currentGroup === group.id;
                  return (
                    <div key={group.id}>
                      <button
                        onClick={() => selectGroup(group.id)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${collapsed ? 'justify-center' : ''}`}
                        style={{
                          background: active ? ha(c, 0.12) : 'transparent',
                          border: active ? `1px solid ${ha(c, 0.25)}` : '1px solid transparent',
                          color: active ? c : '#6b7280',
                        }}
                        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#d1d5db'; } }}
                        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280'; } }}
                        title={collapsed ? group.name : ''}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: active ? c : '#374151', boxShadow: active ? `0 0 8px ${ha(c, 0.6)}` : 'none' }} />
                        {!collapsed && <span className="font-medium">{group.name}</span>}
                      </button>
                      {active && !collapsed && (
                        <div className="ml-3 mt-1 space-y-0.5 border-l pl-2" style={{ borderColor: ha(c, 0.15) }}>
                          {group.items.map((item) => {
                            const isSelected = currentStructure === item.id;
                            return (
                              <button key={item.id} onClick={() => selectStructure(item.id)}
                                className="block w-full text-left px-2 py-1 rounded text-[10px] font-mono transition-all"
                                style={{ color: isSelected ? c : '#6b7280', background: isSelected ? ha(c, 0.08) : 'transparent' }}
                                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.color = '#9ca3af'; }}
                                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.color = '#6b7280'; }}>
                                {item.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ─── THEME SELECTOR AT LEFT BOTTOM ───────────── */}
        <div className="border-t p-2" style={{ borderColor: ha(c, 0.1) }}>
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-[10px] font-mono transition-all"
            style={{ color: ha(c, 0.6), background: showThemePicker ? ha(c, 0.06) : 'transparent' }}
          >
            <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" style={{ background: `linear-gradient(135deg, ${currentTheme.primary}, ${currentTheme.secondary})` }} />
            {!collapsed && <span className="truncate">{currentTheme.name}</span>}
            {!collapsed && <span className="ml-auto text-[8px] opacity-60">▼</span>}
          </button>

          <AnimatePresence>
            {showThemePicker && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-1.5 pt-1 pb-1">
                  {themes.map((t: any) => {
                    const isActive = currentTheme.id === t.id;
                    return (
                      <motion.button
                        key={t.id}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => { setTheme(t); setShowThemePicker(false); }}
                        className="rounded-full border-2 transition-all"
                        style={{
                          width: isActive ? 22 : 18,
                          height: isActive ? 22 : 18,
                          background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})`,
                          borderColor: isActive ? '#fff' : 'transparent',
                          boxShadow: isActive ? `0 0 10px ${t.primary}66` : 'none',
                        }}
                        title={t.name}
                      />
                    );
                  })}
                </div>
                <div className="text-[7px] font-mono text-center pb-1" style={{ color: ha(c, 0.3) }}>{themes.length} themes</div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* XP footer */}
          {!collapsed && (
            <div className="flex items-center justify-between text-[9px] font-mono mt-1 px-1" style={{ color: '#4b5563' }}>
              <span>⚡ {useStore.getState().xp} XP</span>
              <span style={{ color: ha(c, 0.5) }}>Lv.{useStore.getState().level}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
