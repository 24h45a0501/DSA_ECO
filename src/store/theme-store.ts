'use client';

import { create } from 'zustand';

export interface ThemeDef {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  bgFrom: string;
  bgTo: string;
  // Effects configuration — each theme has a unique feel
  effects: {
    glowIntensity: number;
    sparkleColor: string;
    scanLine: boolean;
    particleCount: number;
    animationStyle: 'spring' | 'bounce' | 'gentle' | 'energetic';
    highlightEffect: 'pulse' | 'ripple' | 'scan' | 'glow' | 'rainbow';
    barStyle: 'gradient' | 'solid' | 'metallic';
    nodeStyle: 'rounded' | 'sharp' | 'glassy';
    label: string;
  };
}

export const themes: ThemeDef[] = [
  {
    id: 'crimson', name: '🔥 Crimson Inferno', primary: '#dc2626', secondary: '#ef4444', accent: '#f87171',
    bgFrom: '#05050f', bgTo: '#0a0a1a',
    effects: { glowIntensity: 0.4, sparkleColor: '#f87171', scanLine: true, particleCount: 35,
      animationStyle: 'spring', highlightEffect: 'pulse', barStyle: 'gradient', nodeStyle: 'rounded', label: 'intense' },
  },
  {
    id: 'neon-blue', name: '💎 Neon Crystal', primary: '#3b82f6', secondary: '#60a5fa', accent: '#93c5fd',
    bgFrom: '#050510', bgTo: '#0a0a20',
    effects: { glowIntensity: 0.5, sparkleColor: '#93c5fd', scanLine: false, particleCount: 45,
      animationStyle: 'bounce', highlightEffect: 'ripple', barStyle: 'metallic', nodeStyle: 'glassy', label: 'crystal' },
  },
  {
    id: 'cyber-green', name: '🌿 Cyber Matrix', primary: '#22c55e', secondary: '#4ade80', accent: '#86efac',
    bgFrom: '#050f0a', bgTo: '#0a1a10',
    effects: { glowIntensity: 0.45, sparkleColor: '#86efac', scanLine: true, particleCount: 40,
      animationStyle: 'gentle', highlightEffect: 'scan', barStyle: 'gradient', nodeStyle: 'rounded', label: 'matrix' },
  },
  {
    id: 'royal-purple', name: '👑 Royal Amethyst', primary: '#a855f7', secondary: '#c084fc', accent: '#d8b4fe',
    bgFrom: '#0a0510', bgTo: '#150a20',
    effects: { glowIntensity: 0.55, sparkleColor: '#d8b4fe', scanLine: false, particleCount: 50,
      animationStyle: 'energetic', highlightEffect: 'glow', barStyle: 'metallic', nodeStyle: 'glassy', label: 'royal' },
  },
  {
    id: 'sunset-amber', name: '🌅 Sunset Blaze', primary: '#f59e0b', secondary: '#fbbf24', accent: '#fde047',
    bgFrom: '#0f0a05', bgTo: '#1a1005',
    effects: { glowIntensity: 0.5, sparkleColor: '#fde047', scanLine: true, particleCount: 30,
      animationStyle: 'bounce', highlightEffect: 'rainbow', barStyle: 'gradient', nodeStyle: 'rounded', label: 'warm' },
  },
  {
    id: 'ocean-teal', name: '🌊 Deep Ocean', primary: '#14b8a6', secondary: '#2dd4bf', accent: '#5eead4',
    bgFrom: '#050f0f', bgTo: '#051515',
    effects: { glowIntensity: 0.4, sparkleColor: '#5eead4', scanLine: false, particleCount: 38,
      animationStyle: 'gentle', highlightEffect: 'ripple', barStyle: 'gradient', nodeStyle: 'glassy', label: 'calm' },
  },
  {
    id: 'pink-dream', name: '🌸 Pink Dream', primary: '#ec4899', secondary: '#f472b6', accent: '#f9a8d4',
    bgFrom: '#0f050a', bgTo: '#1a0a10',
    effects: { glowIntensity: 0.5, sparkleColor: '#f9a8d4', scanLine: true, particleCount: 42,
      animationStyle: 'energetic', highlightEffect: 'pulse', barStyle: 'metallic', nodeStyle: 'rounded', label: 'dreamy' },
  },
  {
    id: 'electric-lime', name: '⚡ Electric Lime', primary: '#84cc16', secondary: '#a3e635', accent: '#bef264',
    bgFrom: '#050f00', bgTo: '#0a1a00',
    effects: { glowIntensity: 0.6, sparkleColor: '#bef264', scanLine: false, particleCount: 48,
      animationStyle: 'bounce', highlightEffect: 'scan', barStyle: 'solid', nodeStyle: 'sharp', label: 'electric' },
  },
  {
    id: 'frost-ice', name: '❄️ Frost Ice', primary: '#06b6d4', secondary: '#22d3ee', accent: '#67e8f9',
    bgFrom: '#050a0f', bgTo: '#0a1520',
    effects: { glowIntensity: 0.35, sparkleColor: '#67e8f9', scanLine: true, particleCount: 35,
      animationStyle: 'gentle', highlightEffect: 'glow', barStyle: 'metallic', nodeStyle: 'glassy', label: 'frosty' },
  },
  {
    id: 'gold-luxury', name: '⭐ Gold Luxury', primary: '#eab308', secondary: '#facc15', accent: '#fde047',
    bgFrom: '#0f0a00', bgTo: '#1a1000',
    effects: { glowIntensity: 0.55, sparkleColor: '#fde047', scanLine: true, particleCount: 32,
      animationStyle: 'energetic', highlightEffect: 'rainbow', barStyle: 'metallic', nodeStyle: 'rounded', label: 'luxury' },
  },
  {
    id: 'cosmic-violet', name: '🌌 Cosmic Void', primary: '#8b5cf6', secondary: '#a78bfa', accent: '#c4b5fd',
    bgFrom: '#050010', bgTo: '#0f0020',
    effects: { glowIntensity: 0.6, sparkleColor: '#c4b5fd', scanLine: false, particleCount: 55,
      animationStyle: 'energetic', highlightEffect: 'ripple', barStyle: 'gradient', nodeStyle: 'glassy', label: 'cosmic' },
  },
];

// Global theme store — persists across page navigation
export const useThemeStore = create<{
  currentTheme: ThemeDef;
  setTheme: (t: ThemeDef) => void;
}>((set) => ({
  currentTheme: themes[0],
  setTheme: (t) => set({ currentTheme: t }),
}));
