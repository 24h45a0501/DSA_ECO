'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/dsc-store';

const challenges = [
  { id: 1, title: 'Array Rotation', difficulty: 'Easy', xp: 50, description: 'Rotate an array of n elements to the right by k steps.' },
  { id: 2, title: 'Valid Parentheses', difficulty: 'Easy', xp: 75, description: 'Given a string containing brackets, determine if it is valid.' },
  { id: 3, title: 'Queue with Stacks', difficulty: 'Medium', xp: 150, description: 'Implement a queue using two stacks.' },
  { id: 4, title: 'BST Validation', difficulty: 'Medium', xp: 200, description: 'Validate if a binary tree is a valid BST.' },
  { id: 5, title: 'AVL Insertion', difficulty: 'Hard', xp: 350, description: 'Insert into an AVL tree and perform necessary rotations.' },
  { id: 6, title: 'Dijkstra Algorithm', difficulty: 'Hard', xp: 400, description: 'Implement Dijkstra\'s shortest path algorithm.' },
];
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import {
  Swords, Trophy, Zap, Clock, Target, TrendingUp, Star,
  ChevronRight, Shield, Sword, Flame, Medal, Crown,
} from 'lucide-react';

const leaderboard = [
  { rank: 1, name: 'CyberCoder', xp: 15400, badges: 14, streak: 67 },
  { rank: 2, name: 'DataWizard', xp: 12800, badges: 12, streak: 52 },
  { rank: 3, name: 'AlgoMaster', xp: 10200, badges: 10, streak: 41 },
  { rank: 4, name: 'StructNinja', xp: 8900, badges: 9, streak: 33 },
  { rank: 5, name: 'HeapHero', xp: 7600, badges: 8, streak: 28 },
];

export default function ArenaPage() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard'>('challenges');
  const [completed, setCompleted] = useState<number[]>([]);

  const handleComplete = (id: number, xp: number) => {
    setCompleted((prev) => [...prev, id]);
    store.addXp(xp);
    toast.success(`Challenge Complete! +${xp} XP`, { duration: 3000, style: { background: '#111', color: '#fafafa', border: '1px solid rgba(220,38,38,0.3)' } });
    toast.success(`Challenge Complete! +${xp} XP`, { duration: 3000, style: { background: '#111', color: '#fafafa', border: '1px solid rgba(220,38,38,0.3)' } });
  };

  return (
    <main className="min-h-screen bg-black">
      <Toaster position="bottom-right" />
      <div className="animate-scan-line fixed inset-0 pointer-events-none opacity-[0.02]" />

      {/* Header */}
      <div className="relative border-b border-red-900/20 bg-black/80">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-2">
            <Swords className="w-8 h-8 text-red-500" />
            <div>
              <h1 className="text-3xl font-bold">
                <span className="cyber-text text-red-500">BATTLE</span>
                <span className="text-gray-400"> ARENA</span>
              </h1>
              <p className="text-sm text-gray-600 font-mono">Challenge yourself and climb the ranks</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: 'XP', value: store.xp, icon: Zap, color: 'text-yellow-500' },
              { label: 'Level', value: store.level, icon: Trophy, color: 'text-red-400' },
              { label: 'Completed', value: completed.length, icon: Target, color: 'text-green-400' },
            ].map((stat) => (
              <div key={stat.label} className="glass-card p-3 flex items-center gap-3">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                <div>
                  <div className="text-lg font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] text-gray-600 font-mono">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['challenges', 'leaderboard'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-mono transition-all ${
                activeTab === tab
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-black/40 text-gray-600 border border-gray-800 hover:text-gray-400'
              }`}
            >
              {tab === 'challenges' ? '⚔️ Challenges' : '🏆 Leaderboard'}
            </button>
          ))}
        </div>

        {activeTab === 'challenges' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => {
              const isCompleted = completed.includes(challenge.id);
              const diffColor = challenge.difficulty === 'Easy' ? 'text-green-400' :
                challenge.difficulty === 'Medium' ? 'text-yellow-400' : 'text-red-400';
              const diffBg = challenge.difficulty === 'Easy' ? 'bg-green-500/10 border-green-500/20' :
                challenge.difficulty === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-red-500/10 border-red-500/20';

              return (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`glass-card p-5 ${isCompleted ? 'opacity-60' : 'hover:border-red-500/30'} transition-all`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">{challenge.title}</h3>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-mono ${diffBg} ${diffColor}`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    {isCompleted && <Shield className="w-5 h-5 text-green-400" />}
                  </div>
                  <p className="text-xs text-gray-500 mb-4">{challenge.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-yellow-500">+{challenge.xp} XP</span>
                    <button
                      onClick={() => handleComplete(challenge.id, challenge.xp)}
                      disabled={isCompleted}
                      className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                        isCompleted
                          ? 'bg-green-500/10 text-green-400 cursor-default'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                      }`}
                    >
                      {isCompleted ? '✓ Complete' : '⚔️ Battle'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="glass-card">
            <div className="p-4 border-b border-red-900/20 flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-semibold text-gray-300">Global Leaderboard</span>
            </div>
            <div className="divide-y divide-gray-900">
              {leaderboard.map((player) => (
                <div key={player.rank} className="flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold font-mono ${
                      player.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                      player.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                      player.rank === 3 ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-900 text-gray-600'
                    }`}>
                      #{player.rank}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{player.name}</div>
                      <div className="text-[10px] text-gray-600 font-mono">🔥 {player.streak} day streak</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-mono text-yellow-500">{player.xp.toLocaleString()} XP</div>
                      <div className="text-[10px] text-gray-600">{player.badges} badges</div>
                    </div>
                    <Star className={`w-4 h-4 ${player.rank <= 3 ? 'text-yellow-500' : 'text-gray-800'}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 text-center text-xs font-mono text-gray-700">
              Complete challenges to appear on the leaderboard
            </div>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-red-900/20 bg-black/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between text-xs font-mono text-gray-700">
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.href = '/'} className="hover:text-red-400 transition-all">Home</button>
            <button onClick={() => window.location.href = '/workspace'} className="hover:text-red-400 transition-all">Workspace</button>
          </div>
          <div className="text-gray-800">DSC ECO // ARENA MODE</div>
        </div>
      </div>
    </main>
  );
}
