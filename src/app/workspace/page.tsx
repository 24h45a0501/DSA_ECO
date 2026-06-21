'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import DSCVisualizer from '@/components/DSCVisualizer';
import { useStore, getGroupItems, findItem, operationsFor, complexity, defaultData, getGroupName } from '@/store/dsc-store';
import { useThemeStore, themes } from '@/store/theme-store';
import toast, { Toaster } from 'react-hot-toast';
import {
  Zap, Shuffle, RotateCcw, Info, ChevronRight, ChevronLeft, BarChart3, Hash,
  Sparkles, Code, Lightbulb, Play, Trash2, Terminal, StepForward, FileText,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
//  OPERATION ENGINE
// ═══════════════════════════════════════════════════════════════
function runOperation(op: string, data: number[], val: number): { data: number[]; highlights: number[]; msg: string; output?: string } {
  const key = op.toLowerCase().replace(/\s+/g, '-');
  const hl: number[] = [];
  let d = [...data];

  switch (key) {
    case 'insert': case 'insert-head': case 'insert-front': case 'insert-row':
      d = [val, ...d]; hl.push(0); return { data: d, highlights: hl, msg: `Inserted ${val} at front` };
    case 'insert-tail': case 'insert-rear':
      d.push(val); hl.push(d.length - 1); return { data: d, highlights: hl, msg: `Inserted ${val} at rear` };
    case 'insert-position':
      if (!d.length) { d.push(val); hl.push(0); return { data: d, highlights: hl, msg: `Inserted ${val} at pos 0` }; }
      d.splice(Math.min(val, d.length), 0, Math.floor(Math.random() * 90) + 10); hl.push(Math.min(val, d.length));
      return { data: d, highlights: hl, msg: `Inserted at pos ${Math.min(val, d.length)}` };
    case 'insert-col': d.push(val); hl.push(d.length - 1); return { data: d, highlights: hl, msg: `Column ${val} inserted` };
    case 'delete': case 'delete-front': case 'delete-row':
      if (!d.length) return { data: d, highlights: [], msg: 'Nothing to delete' };
      const dv = d[0]; d.shift(); return { data: d, highlights: [], msg: `Deleted ${dv} from front` };
    case 'delete-rear':
      if (!d.length) return { data: d, highlights: [], msg: 'Nothing to delete' };
      const dr = d.pop(); return { data: d, highlights: [], msg: `Deleted ${dr} from rear` };
    case 'delete-position':
      if (!d.length) return { data: d, highlights: [], msg: 'Nothing to delete' };
      const idx = Math.min(val, d.length - 1); const dv2 = d[idx]; d.splice(idx, 1);
      return { data: d, highlights: [], msg: `Deleted ${dv2} from pos ${idx}` };
    case 'search': {
      const si = d.indexOf(val);
      if (si !== -1) { hl.push(si); return { data: d, highlights: hl, msg: `Found ${val} at [${si}]`, output: `🔍 search(${val}) → index ${si}` }; }
      return { data: d, highlights: [], msg: `${val} not found`, output: `🔍 search(${val}) → not found` };
    }
    case 'update':
      if (d.length > 0) { d[d.length - 1] = val; hl.push(d.length - 1); return { data: d, highlights: hl, msg: `Updated last → ${val}` }; }
      return { data: d, highlights: [], msg: 'Nothing to update' };
    case 'traverse': case 'inorder': case 'preorder': case 'postorder': case 'level-order':
      d.forEach((_, i) => hl.push(i));
      return { data: d, highlights: hl, msg: `Traversed: [${d.join(', ')}]`, output: `📋 [${d.join(', ')}]` };
    case 'reverse': d.reverse(); return { data: d, highlights: [], msg: 'Reversed ✓', output: '🔄 reverse() → done' };
    case 'sort': d.sort((a, b) => a - b); return { data: d, highlights: [], msg: 'Sorted ✓', output: '📊 sort() → ascending' };
    case 'rotate': case 'rotate-left':
      if (d.length > 1) d.push(d.shift()!);
      return { data: d, highlights: [], msg: 'Rotated left', output: '🔄 rotate left' };
    case 'rotate-right':
      if (d.length > 1) d.unshift(d.pop()!);
      return { data: d, highlights: [], msg: 'Rotated right', output: '🔄 rotate right' };
    case 'push': d.push(val); hl.push(d.length - 1); return { data: d, highlights: hl, msg: `Pushed ${val}`, output: `📥 push(${val})` };
    case 'pop':
      if (!d.length) return { data: d, highlights: [], msg: 'Stack empty', output: '⚠️ stack empty' };
      const pv = d.pop(); return { data: d, highlights: [], msg: `Popped ${pv}`, output: `📤 pop() → ${pv}` };
    case 'enqueue': d.push(val); hl.push(d.length - 1); return { data: d, highlights: hl, msg: `Enqueued ${val}`, output: `📥 enqueue(${val})` };
    case 'dequeue': {
      if (!d.length) return { data: d, highlights: [], msg: 'Queue empty', output: '⚠️ queue empty' };
      const qv = d.shift(); return { data: d, highlights: d.length > 0 ? [0] : [], msg: `Dequeued ${qv}`, output: `📤 dequeue() → ${qv}` };
    }
    case 'peek': case 'peek-front': case 'peek-rear': {
      const pk = d[d.length - 1] ?? d[0] ?? '—';
      const hi = d.length - 1 >= 0 ? d.length - 1 : 0;
      return { data: d, highlights: [hi], msg: `Peek: ${pk}`, output: `👁️ peek() → ${pk}` };
    }
    case 'size': case 'is-empty': case 'is-full':
      return { data: d, highlights: [], msg: `Size: ${d.length}`, output: `📏 size() → ${d.length}` };
    case 'clear': return { data: [], highlights: [], msg: 'Cleared ✓', output: '🗑️ clear() → done' };
    case 'find-min': {
      if (!d.length) return { data: d, highlights: [], msg: 'Empty', output: '⚠️ no data' };
      const min = Math.min(...d); hl.push(d.indexOf(min)); return { data: d, highlights: hl, msg: `Min: ${min}`, output: `⬇️ min() → ${min}` };
    }
    case 'find-max': {
      if (!d.length) return { data: d, highlights: [], msg: 'Empty', output: '⚠️ no data' };
      const max = Math.max(...d); hl.push(d.indexOf(max)); return { data: d, highlights: hl, msg: `Max: ${max}`, output: `⬆️ max() → ${max}` };
    }
    case 'add-edge': case 'add-vertex': d.push(val); hl.push(d.length - 1); return { data: d, highlights: hl, msg: `Added vertex ${val}` };
    case 'remove-edge':
      if (d.length > 0) { const rv = d.pop(); return { data: d, highlights: [], msg: `Removed ${rv}` }; }
      return { data: d, highlights: [], msg: 'Nothing to remove' };
    case 'bfs': case 'dfs': case 'topological-sort': case 'shortest-path': case 'mst':
      d.forEach((_, i) => hl.push(i)); return { data: d, highlights: hl, msg: `${key.toUpperCase()} → done`, output: `🌐 ${key}() → traversed` };
    case 'extract-max': case 'extract-min':
      if (!d.length) return { data: d, highlights: [], msg: 'Heap empty' };
      const ev = d.shift(); return { data: d, highlights: [], msg: `Extracted ${ev}`, output: `📤 extract() → ${ev}` };
    case 'heapify': d.sort((a, b) => b - a); return { data: d, highlights: [], msg: 'Heapified', output: '🔨 heapify() → max-heap' };
    case 'heap-sort': d.sort((a, b) => a - b); return { data: d, highlights: [], msg: 'Heap sort ✓', output: '📊 heapSort() → sorted' };
    case 'change-priority':
      if (d.length > 0) { d[d.length - 1] = val; hl.push(d.length - 1); return { data: d, highlights: hl, msg: `Priority → ${val}` }; }
      return { data: d, highlights: [], msg: 'Nothing to change' };
    case 'build': return { data: d, highlights: d.map((_, i) => i), msg: `Built with ${d.length} elements`, output: `🏗️ build() → ${d.length} nodes` };
    case 'range-query': return { data: d, highlights: d.map((_, i) => i), msg: `Range [0..${d.length - 1}]`, output: `📐 range(0,${d.length - 1})` };
    case 'point-update':
      if (d.length > 0) { d[d.length - 1] = val; hl.push(d.length - 1); return { data: d, highlights: hl, msg: `Point update → ${val}` }; }
      return { data: d, highlights: [], msg: 'Nothing to update' };
    case 'prefix-sum': return { data: d, highlights: d.map((_, i) => i), msg: `Prefix sum: ${d.reduce((a, b) => a + b, 0)}`, output: `➕ prefixSum() → ${d.reduce((a, b) => a + b, 0)}` };
    case 'union': d.push(val); return { data: d, highlights: [d.length - 1], msg: `Union(${val})` };
    case 'starts-with': return { data: d, highlights: d.map((_, i) => i), msg: 'Prefix check ✓', output: '🔤 startsWith() → true' };
    case 'auto-complete': return { data: d, highlights: d.map((_, i) => i), msg: `${d.length} suggestions`, output: `💡 autoComplete() → ${d.length} results` };
    case 'check': { const ci = d.indexOf(val); return { data: d, highlights: ci !== -1 ? [ci] : [], msg: ci !== -1 ? `${val} exists` : `${val} not found`, output: ci !== -1 ? `✅ contains(${val}) → true` : `❌ contains(${val}) → false` }; }
    case 'resize': case 'split': case 'merge': case 'lcp': case 'split-treap': case 'merge-treap': case 'union-by-rank': case 'path-compress': case 'find':
      return { data: d, highlights: [], msg: `${key} ✓` };
    default:
      if (val) { d.push(val); hl.push(d.length - 1); return { data: d, highlights: hl, msg: `${op} → ${val}` }; }
      return { data: d, highlights: [], msg: `${op} ✓` };
  }
}

// ═══════════════════════════════════════════════════════════════
//  EXAMPLE PROGRAMS for each structure type
// ═══════════════════════════════════════════════════════════════
const examples: Record<string, string> = {
  'static-array': `// Array — Static Operations
let arr = [10, 20, 30, 40, 50];

// Insert at end
arr.push(60);

// Search for value
let idx = arr.indexOf(30);

// Delete last element
arr.pop();

// Reverse the array
arr.reverse();

// Sort the array
arr.sort((a,b) => a-b);

console.log(arr);`,

  'dynamic-array': `// Dynamic Array
let arr = [5, 15, 25, 35];

// Grow the array
arr.push(45);

// Insert at front
arr.unshift(1);

arr.push(55);
arr.push(65);

// Remove from end
arr.pop();

console.log(arr);`,

  'singly-linked-list': `// Singly Linked List simulation
let list = [10, 20, 30, 40, 50];

// Insert at head
list.unshift(5);

// Insert at tail
list.push(60);

// Insert at position 3
list.splice(3, 0, 25);

// Delete from head  
list.shift();

// Search for 30
let found = list.indexOf(30);

// Reverse
list.reverse();

console.log(list);`,

  'doubly-linked-list': `// Doubly Linked List
let list = [10, 20, 30, 40];

// Insert at both ends
list.unshift(5);
list.push(50);

// Delete from tail
list.pop();

// Traverse forward
let forward = [...list];

// Reverse traversal simulation
list.reverse();

console.log('Forward:', forward);
console.log('Reversed:', list);`,

  'stack': `// Stack — LIFO Operations
let stack = [];

// Push elements onto stack
stack.push(10);
stack.push(20);
stack.push(30);
stack.push(40);
stack.push(50);

// Peek at top element
let top = stack[stack.length - 1];

// Pop elements from stack
let popped1 = stack.pop();
let popped2 = stack.pop();

// Push more
stack.push(60);

console.log('Stack:', stack);
console.log('Popped:', popped1, popped2);`,

  'simple-queue': `// Queue — FIFO Operations
let queue = [];

// Enqueue elements
queue.push(10);
queue.push(20);
queue.push(30);
queue.push(40);
queue.push(50);

// Peek at front
let front = queue[0];

// Dequeue elements
let dq1 = queue.shift();
let dq2 = queue.shift();

// Enqueue more
queue.push(60);
queue.push(70);

console.log('Queue:', queue);
console.log('Dequeued:', dq1, dq2);`,

  'circular-queue': `// Circular Queue simulation
let cq = [10, 20, 30, 40, 50];

// Enqueue (add at end)
cq.push(60);

// Dequeue (remove from front)
cq.shift();

cq.push(70);
cq.push(80);
cq.shift();

console.log('Circular Queue:', cq);
console.log('Size:', cq.length);`,

  'priority-queue': `// Priority Queue (min-heap simulation)
let pq = [50, 40, 30, 20, 10];

// Sort by priority (ascending)
pq.sort((a,b) => a-b);

// Dequeue highest priority
let highest = pq.shift();

// Enqueue with priority
pq.push(25);
pq.sort((a,b) => a-b);

console.log('Priority Queue:', pq);
console.log('Processed:', highest);`,

  'deque': `// Deque — Double Ended Queue
let deque = [];

// Insert at both ends
deque.push(30);     // rear
deque.unshift(10);  // front
deque.push(40);     // rear
deque.unshift(5);   // front
deque.push(50);     // rear

// Delete from both ends
let front = deque.shift();
let rear = deque.pop();

console.log('Deque:', deque);
console.log('Removed front:', front, 'rear:', rear);`,

  'hash-table': `// Hash Table simulation
let ht = [];

// Insert key-value pairs
ht.push(10);
ht.push(20);
ht.push(30);

// Search for value
let search = ht.indexOf(20);

// Delete value
let idx = ht.indexOf(20);
if (idx >= 0) ht.splice(idx, 1);

console.log('Hash Table:', ht);
console.log('Search 20:', search >= 0 ? 'found' : 'not found');`,

  'bst': `// Binary Search Tree simulation
let bst = [10, 5, 15, 3, 7, 12, 18];

// In-order traversal (sorted)
let inorder = [...bst].sort((a,b) => a-b);

// Find minimum
let min = Math.min(...bst);

// Find maximum  
let max = Math.max(...bst);

// Search for value
let search = bst.indexOf(7);

// Insert
bst.push(13);

console.log('In-order:', inorder);
console.log('Min:', min, 'Max:', max);`,

  'avl-tree': `// AVL Tree — Self-Balancing BST
let avl = [10, 5, 15, 3, 7, 12, 18];

// Insert maintaining balance
avl.push(20);
avl.push(25);

// Rebalance simulation (sort)
avl.sort((a,b) => a-b);

// Search
let found = avl.indexOf(12);

console.log('AVL Tree:', avl);
console.log('Found 12 at index:', found);`,

  'heap': `// Max Heap Operations
let heap = [90, 80, 70, 60, 50, 40, 30];

// Insert
heap.push(85);

// Heapify (reorder to maintain heap property)
heap.sort((a,b) => b-a);

// Extract max
let max = heap.shift();

// Insert more
heap.push(95);
heap.sort((a,b) => b-a);

console.log('Heap:', heap);
console.log('Extracted max:', max);`,

  'min-heap': `// Min Heap Operations
let heap = [10, 20, 30, 40, 50, 60, 70];

// Insert
heap.push(5);

// Heapify (min at root)
heap.sort((a,b) => a-b);

// Extract min
let min = heap.shift();

// Insert more
heap.push(3);
heap.sort((a,b) => a-b);

console.log('Min Heap:', heap);
console.log('Extracted min:', min);`,

  'directed-graph': `// Directed Graph
let graph = [10, 20, 30, 40];

// Add vertices
graph.push(50);
graph.push(60);

// BFS traversal simulation
let bfs = [...graph];

// DFS traversal simulation  
let dfs = [...graph].reverse();

console.log('Graph vertices:', graph);
console.log('BFS order:', bfs);
console.log('DFS order:', dfs);`,

  'undirected-graph': `// Undirected Graph
let graph = [10, 20, 30, 40, 50];

// Add vertex
graph.push(60);

// Remove vertex
graph.shift();

// Traversal
let traversed = [...graph];

console.log('Graph:', graph);
console.log('Traversal:', traversed);
console.log('Vertices:', graph.length);`,

  'trie': `// Trie — Prefix Tree
let trie = [];

// Insert words (simulated as numbers)
trie.push(10);
trie.push(20);
trie.push(30);
trie.push(40);

// Search for prefix
let found = trie.indexOf(20);

// Auto-complete (return all)
let suggestions = [...trie];

console.log('Trie contents:', trie);
console.log('Contains 20?', found >= 0 ? 'yes' : 'no');
console.log('Suggestions:', suggestions);`,

  'segment-tree': `// Segment Tree
let seg = [];

// Build tree from array
let arr = [10, 20, 30, 40, 50, 60, 70];
seg = [...arr];

// Range query (sum simulation)
let rangeSum = seg.slice(0, 4).reduce((a,b) => a+b, 0);

// Point update
seg[2] = 35;

console.log('Segment Tree:', seg);
console.log('Range sum [0..3]:', rangeSum);`,
};

// ═══════════════════════════════════════════════════════════════
//  WORKSPACE PAGE
// ═══════════════════════════════════════════════════════════════
export default function WorkspacePage() {
  const store = useStore();
  const { currentTheme } = useThemeStore();
  const [val, setVal] = useState('');
  const [showInfo, setShowInfo] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [lastOutput, setLastOutput] = useState<string | null>(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [code, setCode] = useState('');
  const [codeOutput, setCodeOutput] = useState<string[]>([]);
  const [codeRunning, setCodeRunning] = useState(false);
  const codeTimeoutRef = useRef<number[]>([]);

  const items = getGroupItems(store.currentGroup);
  const ops = operationsFor[store.currentStructure] || ['Insert', 'Delete', 'Search'];
  const cx = complexity[store.currentStructure];
  const item = findItem(store.currentStructure);

  // Cleanup timeouts
  useEffect(() => {
    return () => codeTimeoutRef.current.forEach(clearTimeout);
  }, []);

  // Load example for current structure
  const loadExample = useCallback(() => {
    const ex = examples[store.currentStructure];
    if (ex) setCode(ex);
    else setCode(examples['static-array']);
    setCodeOutput([]);
  }, [store.currentStructure]);

  // Init code when opening editor
  useEffect(() => {
    if (showCodeEditor) loadExample();
  }, [showCodeEditor, store.currentStructure]);

  // ─── OPERATION BUTTON EXECUTION ──────────────────────
  const execute = useCallback((op: string) => {
    if (animating) return;
    let num = parseInt(val);
    if (isNaN(num)) num = Math.floor(Math.random() * 90) + 10;

    const result = runOperation(op, store.data, num);
    setAnimating(true);
    store.addLog(result.msg);

    if (result.output) {
      setLastOutput(result.output);
      setTimeout(() => setLastOutput(null), 2000);
    }

    store.setHighlights([]);
    setTimeout(() => {
      store.setData(result.data);
      store.setHighlights(result.highlights);
      store.addXp(3);
      store.trackOperation();
      setAnimating(false);
      if (result.highlights.length > 0) setTimeout(() => store.setHighlights([]), 1200);
    }, 100);
  }, [store, val, animating]);

  const randomize = useCallback(() => {
    const count = Math.floor(Math.random() * 5) + 4;
    const arr = Array.from({ length: count }, () => Math.floor(Math.random() * 90) + 10);
    store.setData(arr);
    store.addLog(`Random: [${arr.join(', ')}]`);
    store.addXp(5);
  }, [store]);

  const resetDefault = useCallback(() => {
    store.setData(defaultData[store.currentStructure] || [10, 20, 30, 40, 50]);
    store.addLog('Reset to defaults');
  }, [store]);

  // ─── STEP-BY-STEP CODE RUNNER ────────────────────────
  const runCodeStepByStep = useCallback(async () => {
    if (codeRunning) return;
    setCodeRunning(true);
    setCodeOutput([]);

    // Clear any previous timeouts
    codeTimeoutRef.current.forEach(clearTimeout);
    codeTimeoutRef.current = [];

    const lines = code.split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('//') && !l.startsWith('console') && !l.startsWith('let ') && !l.startsWith('const ') && !l.startsWith('var '));

    const outputs: string[] = ['$ Executing step by step...'];
    let currentData = [...store.data];
    let stepDelay = 0;

    lines.forEach((line, lineIdx) => {
      // Parse command
      let cmdOp = '';
      let cmdVal = 0;

      const pushMatch = line.match(/(?:push|enqueue|unshift)\((\d+)\)/);
      const popMatch = line.match(/^(?:pop|shift)\(\)/);
      const spliceMatch = line.match(/splice\((\d+),\s*\d+,\s*(\d+)\)/);
      const indexOfMatch = line.match(/indexOf\((\d+)\)/);
      const reverseMatch = line.match(/reverse\(\)/);
      const sortMatch = line.match(/sort\(/);
      const minMatch = line.match(/Math\.min/);
      const maxMatch = line.match(/Math\.max/);

      const delay = (idx: number) => 400 + idx * 300;

      if (pushMatch) {
        cmdVal = parseInt(pushMatch[1]);
        cmdOp = line.includes('unshift') ? 'Insert' : (line.includes('enqueue') ? 'Enqueue' : 'Push');
        const t = setTimeout(() => {
          const r = runOperation(cmdOp, currentData, cmdVal);
          currentData = r.data;
          store.setData(r.data);
          store.setHighlights(r.highlights);
          setLastOutput(r.output || r.msg);
          setCodeOutput(prev => [...prev, `  ✓ ${r.msg}`]);
          setTimeout(() => store.setHighlights([]), 800);
        }, delay(lineIdx));
        codeTimeoutRef.current.push(t as unknown as number);
      } else if (popMatch) {
        cmdOp = line.includes('shift') ? 'Dequeue' : 'Pop';
        const t = setTimeout(() => {
          const r = runOperation(cmdOp, currentData, 0);
          currentData = r.data;
          store.setData(r.data);
          store.setHighlights(r.highlights);
          setLastOutput(r.output || r.msg);
          setCodeOutput(prev => [...prev, `  ✓ ${r.msg}`]);
          setTimeout(() => store.setHighlights([]), 800);
        }, delay(lineIdx));
        codeTimeoutRef.current.push(t as unknown as number);
      } else if (spliceMatch) {
        cmdVal = parseInt(spliceMatch[2]);
        const t = setTimeout(() => {
          const r = runOperation('Insert', currentData, cmdVal);
          currentData = r.data;
          store.setData(r.data);
          store.setHighlights(r.highlights);
          setLastOutput(r.output || r.msg);
          setCodeOutput(prev => [...prev, `  ✓ ${r.msg}`]);
          setTimeout(() => store.setHighlights([]), 800);
        }, delay(lineIdx));
        codeTimeoutRef.current.push(t as unknown as number);
      } else if (indexOfMatch) {
        const sv = parseInt(indexOfMatch[1]);
        const t = setTimeout(() => {
          const idx = currentData.indexOf(sv);
          const msg = idx !== -1 ? `🔍 Found ${sv} at index ${idx}` : `🔍 ${sv} not found`;
          setLastOutput(msg);
          if (idx !== -1) store.setHighlights([idx]);
          setCodeOutput(prev => [...prev, `  ✓ ${msg}`]);
          setTimeout(() => store.setHighlights([]), 1000);
        }, delay(lineIdx));
        codeTimeoutRef.current.push(t as unknown as number);
      } else if (reverseMatch) {
        const t = setTimeout(() => {
          const r = runOperation('Reverse', currentData, 0);
          currentData = r.data;
          store.setData(r.data);
          setLastOutput(r.output || r.msg);
          setCodeOutput(prev => [...prev, `  ✓ ${r.msg}`]);
        }, delay(lineIdx));
        codeTimeoutRef.current.push(t as unknown as number);
      } else if (sortMatch) {
        const t = setTimeout(() => {
          const r = runOperation('Sort', currentData, 0);
          currentData = r.data;
          store.setData(r.data);
          setLastOutput(r.output || r.msg);
          setCodeOutput(prev => [...prev, `  ✓ ${r.msg}`]);
        }, delay(lineIdx));
        codeTimeoutRef.current.push(t as unknown as number);
      } else if (minMatch) {
        const t = setTimeout(() => {
          const min = Math.min(...currentData);
          const mi = currentData.indexOf(min);
          setLastOutput(`⬇️ min → ${min}`);
          store.setHighlights([mi]);
          setCodeOutput(prev => [...prev, `  ✓ Min: ${min}`]);
          setTimeout(() => store.setHighlights([]), 1000);
        }, delay(lineIdx));
        codeTimeoutRef.current.push(t as unknown as number);
      } else if (maxMatch) {
        const t = setTimeout(() => {
          const max = Math.max(...currentData);
          const mi = currentData.indexOf(max);
          setLastOutput(`⬆️ max → ${max}`);
          store.setHighlights([mi]);
          setCodeOutput(prev => [...prev, `  ✓ Max: ${max}`]);
          setTimeout(() => store.setHighlights([]), 1000);
        }, delay(lineIdx));
        codeTimeoutRef.current.push(t as unknown as number);
      }
    });

    // Final done message
    const doneTimeout = setTimeout(() => {
      // Ensure final data state
      if (currentData.length !== store.data.length || JSON.stringify(currentData) !== JSON.stringify(store.data)) {
        store.setData(currentData);
      }
      setCodeOutput(prev => [...prev, `$ Done — n=${currentData.length}`, `$ ${store.operationsExecuted + 1} ops executed`]);
      setCodeRunning(false);
      store.addLog('Code executed ✓');
      store.addXp(15);
    }, lines.length * 300 + 500);
    codeTimeoutRef.current.push(doneTimeout as unknown as number);

  }, [code, store, codeRunning]);

  const level = Math.floor(store.xp / 100) + 1;
  const progress = ((store.xp % 100) / 100) * 100;

  return (
    <main className="min-h-screen bg-[#05050f] overflow-hidden">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#0a0a1a', color: '#fafafa', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px' }, duration: 2000 }} />
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]"><div className="animate-scan-line w-full h-px bg-red-500 absolute" /></div>
      <Sidebar />

      <div className="pl-56 min-h-screen flex flex-col">
        {/* ─── TOP BAR ─────────────────────────────── */}
        <div className="h-11 bg-[#0a0a1a]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-gray-500">{getGroupName(store.currentStructure)}</span>
            <span className="text-gray-800 text-[10px]">/</span>
            <span className="text-xs font-mono text-gray-300 font-semibold">{item?.name || 'Select Structure'}</span>
            <span className="text-[10px] text-gray-700 font-mono ml-1 bg-white/5 px-2 py-0.5 rounded-full">n={store.data.length}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Code toggle */}
            <button onClick={() => { setShowCodeEditor(!showCodeEditor); if (!showCodeEditor) loadExample(); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-mono border transition-all ${
                showCodeEditor ? 'text-white bg-white/10 border-white/20' : 'text-gray-500 border-white/5 hover:text-white hover:bg-white/5'
              }`}>
              <Code className="w-3 h-3" /> Code
            </button>

            {/* XP */}
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg text-[10px] font-mono">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="text-yellow-500 font-bold">{store.xp}</span>
              <div className="w-12 h-1 bg-gray-900 rounded-full overflow-hidden ml-1">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <button onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-mono text-gray-500 hover:text-white hover:bg-white/5 transition-all">
              {showInfo ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
              <Info className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ─── SUBTYPE TABS ─────────────────────────── */}

        {/* ─── MAIN CONTENT ─────────────────────────── */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 relative flex flex-col">
            {/* Visualization */}
            <div className="flex-1 relative p-2">
              <DSCVisualizer dataType={store.currentStructure} data={store.data} highlights={store.highlights} />

              {/* 3D Tablet Output Overlay */}
              <AnimatePresence>
                {lastOutput && (
                  <motion.div
                    initial={{ opacity: 0, y: 40, rotateX: -30, scale: 0.7 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 30, rotateX: 20, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 250, damping: 18 }}
                    className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 perspective-[800px]"
                  >
                    {/* 3D Tablet */}
                    <div className="relative"
                      style={{
                        transform: 'rotateY(-2deg) rotateX(2deg)',
                        transformStyle: 'preserve-3d',
                      }}
                    >
                      {/* Main face */}
                      <div className="px-6 py-3 rounded-2xl text-xs font-mono font-bold backdrop-blur-xl border relative overflow-hidden"
                        style={{
                          background: `linear-gradient(145deg, ${currentTheme.bgFrom}dd, ${currentTheme.bgTo}ee)`,
                          borderColor: `${currentTheme.primary}55`,
                          color: currentTheme.primary,
                          boxShadow: `
                            0 4px 6px -1px rgba(0,0,0,0.3),
                            0 10px 25px -5px ${currentTheme.primary}33,
                            0 0 0 1px ${currentTheme.primary}22 inset,
                            0 0 40px ${currentTheme.primary}11
                          `,
                          transform: 'translateZ(12px)',
                          textShadow: `0 0 12px ${currentTheme.primary}44`,
                        }}
                      >
                        {/* Top edge shine */}
                        <div className="absolute top-0 left-0 right-0 h-px"
                          style={{ background: `linear-gradient(90deg, transparent, ${currentTheme.primary}66, transparent)` }} />
                        {/* Bottom edge shadow */}
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-black/40" />

                        <span className="relative z-10">{lastOutput}</span>

                        {/* Progress bar */}
                        <motion.div
                          initial={{ width: '100%' }}
                          animate={{ width: '0%' }}
                          transition={{ duration: 2, ease: 'linear' }}
                          className="h-0.5 rounded-full mt-2 relative overflow-hidden"
                          style={{
                            background: `linear-gradient(90deg, ${currentTheme.primary}, ${currentTheme.secondary})`,
                            boxShadow: `0 0 8px ${currentTheme.primary}44`,
                          }}
                        />
                      </div>

                      {/* 3D Bottom edge (thickness) */}
                      <div className="absolute -bottom-1 left-2 right-2 h-2 rounded-b-2xl"
                        style={{
                          background: currentTheme.bgTo,
                          border: `1px solid ${currentTheme.primary}33`,
                          borderTop: 'none',
                          transform: 'translateZ(-2px) translateY(2px)',
                          opacity: 0.6,
                        }}
                      />

                      {/* 3D Right edge */}
                      <div className="absolute top-2 -right-1 bottom-2 w-1.5 rounded-r-2xl"
                        style={{
                          background: currentTheme.bgTo,
                          border: `1px solid ${currentTheme.primary}22`,
                          borderLeft: 'none',
                          transform: 'translateZ(-1px) translateX(1px)',
                          opacity: 0.4,
                        }}
                      />

                      {/* Reflection shine */}
                      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                        <div className="absolute -top-10 -left-10 w-20 h-20 rounded-full opacity-10"
                          style={{ background: currentTheme.primary, filter: 'blur(20px)' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── BOTTOM PANEL ──────────────────────── */}
            <div className="bg-[#0a0a1a]/90 backdrop-blur-md border-t border-white/5">
              {showCodeEditor ? (
                /* ═══ CODE WORKSPACE ═══ */
                <div className="flex" style={{ height: 210 }}>
                  {/* Left: Code input */}
                  <div className="flex-1 border-r border-white/5 p-3 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-gray-500" />
                        <span className="text-[10px] font-mono font-semibold text-gray-400">example.{store.currentStructure}.js</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={loadExample}
                          className="text-[9px] font-mono text-gray-600 hover:text-gray-300 px-2 py-1 rounded border border-white/5 hover:border-white/20 transition-all">
                          Reload Example
                        </button>
                        <button onClick={runCodeStepByStep}
                          disabled={codeRunning}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-mono font-semibold text-white transition-all disabled:opacity-40"
                          style={{
                            background: currentTheme.primary,
                            boxShadow: `0 2px 10px ${currentTheme.primary}44`,
                          }}>
                          {codeRunning ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white" />
                          ) : <Play className="w-3 h-3" />}
                          {codeRunning ? 'Running...' : 'Run Code'}
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="flex-1 w-full bg-black/80 border border-white/10 rounded-lg p-3 text-xs font-mono text-gray-200 placeholder-gray-700 focus:outline-none focus:border-white/20 resize-none"
                      placeholder="// Write your code here...&#10;// Each operation animates visually!"
                      spellCheck={false}
                    />
                  </div>

                  {/* Right: Code output + step visualization */}
                  <div className="w-60 p-3 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Terminal className="w-3 h-3 text-gray-500" />
                      <span className="text-[10px] font-mono font-semibold text-gray-500">Output</span>
                      {codeRunning && (
                        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }}
                          className="ml-auto text-[8px] font-mono" style={{ color: currentTheme.primary }}>● running</motion.div>
                      )}
                    </div>
                    <div className="flex-1 overflow-y-auto bg-black/60 rounded-lg border border-white/5 p-2.5 space-y-0.5">
                      {codeOutput.length === 0 ? (
                        <div className="text-[9px] font-mono text-gray-700 mt-4 text-center">Click Run to execute code<br/>Each step animates visually →</div>
                      ) : (
                        codeOutput.map((line, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                            className={`text-[9px] font-mono ${
                              line.startsWith('$') ? 'text-gray-600 font-semibold' :
                              line.startsWith('  ✓') ? 'text-green-500/80' : 'text-gray-400'
                            }`}>
                            {line}
                          </motion.div>
                        ))
                      )}
                    </div>
                    {/* Step indicator */}
                    <div className="mt-1.5 flex items-center gap-1 text-[8px] font-mono text-gray-700">
                      <StepForward className="w-2.5 h-2.5" />
                      <span>Step-by-step animation</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* ═══ OPERATION BUTTONS ═══ */
                <div className="px-4 py-2.5 space-y-1.5">
                  <div className="flex items-start gap-3">
                    {/* Input */}
                    <div className="flex items-center gap-2 shrink-0">
                      <input type="number" value={val} onChange={(e) => setVal(e.target.value)}
                        placeholder="val"
                        className="w-20 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 text-xs text-gray-200 placeholder-gray-700 focus:outline-none focus:border-white/30 font-mono text-center" />
                      <button onClick={randomize} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="Random">
                        <Shuffle className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={resetDefault} className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all" title="Reset">
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <div className="w-px h-7 bg-white/5 mx-0.5" />
                    </div>

                    {/* Operations grid */}
                    <div className="flex-1 flex flex-wrap gap-1">
                      {ops.map((op) => (
                        <motion.button key={op}
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                          onClick={() => execute(op)}
                          disabled={animating}
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono transition-all border ${
                            animating ? 'opacity-40 cursor-not-allowed border-white/5 text-gray-600' :
                            'border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 bg-white/[0.03]'
                          }`}>
                          {op}
                        </motion.button>
                      ))}
                    </div>

                    {/* Status */}
                    <div className="shrink-0">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-600 bg-white/5 px-2.5 py-1.5 rounded-lg">
                        {animating || codeRunning ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }}
                            className="w-3 h-3 rounded-full border-2 border-white/20" style={{ borderTopColor: currentTheme.primary }} />
                        ) : <Lightbulb className="w-3 h-3" />}
                        <span>{animating || codeRunning ? '...' : 'ready'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Log */}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-700">
                    <span className="text-gray-800">$</span>
                    <motion.span key={store.log[store.log.length - 1]}
                      initial={{ opacity: 0, x: -3 }} animate={{ opacity: 1, x: 0 }}
                      className="truncate">
                      {store.log[store.log.length - 1] || 'Ready'}
                    </motion.span>
                    <span className="ml-auto text-gray-800">{store.operationsExecuted || 0} ops</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── INFO PANEL ──────────────────────────── */}
          <AnimatePresence>
            {showInfo && (
              <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 220, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
                className="border-l border-white/5 bg-[#0a0a1a]/80 backdrop-blur-sm overflow-y-auto">
                <div className="p-3 space-y-3">
                  {/* Complexity */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-600 uppercase tracking-wider mb-2">
                      <BarChart3 className="w-3 h-3" /> Complexity
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {cx ? [['Best', cx.best], ['Avg', cx.avg], ['Worst', cx.worst], ['Space', cx.space]].map(([k, v]) => (
                        <div key={k as string} className="bg-black/60 rounded-lg px-2.5 py-2 border border-white/5">
                          <div className="text-[8px] text-gray-700 font-mono uppercase">{k as string}</div>
                          <div className="text-sm font-mono font-bold" style={{ color: currentTheme.primary }}>{v}</div>
                        </div>
                      )) : <div className="col-span-2 text-gray-700 text-[10px] font-mono py-2">Select a structure</div>}
                    </div>
                  </div>

                  {/* Memory */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-600 uppercase tracking-wider mb-2">
                      <Hash className="w-3 h-3" /> Memory
                    </div>
                    <div className="space-y-0.5 max-h-32 overflow-y-auto">
                      {store.data.map((v, i) => {
                        const hl = store.highlights.includes(i);
                        return (
                          <motion.div key={i}
                            animate={{ backgroundColor: hl ? `${currentTheme.primary}18` : 'transparent' }}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-mono ${hl ? 'text-red-300' : 'text-gray-600'}`}>
                            <span className="text-gray-700">0x{(0x7ffd00000000 + i * 8).toString(16).slice(-8)}</span>
                            <motion.span animate={{ color: hl ? currentTheme.primary : '#94a3b8', scale: hl ? 1.15 : 1 }} className="font-bold">{v}</motion.span>
                            <span className="text-gray-800">+{i * 8}B</span>
                          </motion.div>
                        );
                      })}
                      {store.data.length === 0 && <div className="text-gray-800 text-center py-4 text-[10px]">Empty</div>}
                    </div>
                  </div>

                  {/* History */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-600 uppercase tracking-wider mb-2">
                      <Terminal className="w-3 h-3" /> History
                    </div>
                    <div className="space-y-0.5 max-h-24 overflow-y-auto">
                      {store.log.slice(-6).reverse().map((l, i) => (
                        <div key={i} className="text-[9px] font-mono text-gray-700 truncate px-1">{l}</div>
                      ))}
                      {store.log.length <= 1 && <div className="text-gray-800 text-[10px] font-mono px-1">No operations</div>}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="border-t border-white/5 pt-3">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="bg-black/40 rounded-lg px-2.5 py-2 border border-white/5 text-center">
                        <div className="text-[9px] text-gray-700 font-mono">Elements</div>
                        <div className="text-sm font-bold text-white">{store.data.length}</div>
                      </div>
                      <div className="bg-black/40 rounded-lg px-2.5 py-2 border border-white/5 text-center">
                        <div className="text-[9px] text-gray-700 font-mono">XP</div>
                        <div className="text-sm font-bold text-yellow-500">{store.xp}</div>
                      </div>
                      <div className="bg-black/40 rounded-lg px-2.5 py-2 border border-white/5 text-center">
                        <div className="text-[9px] text-gray-700 font-mono">Level</div>
                        <div className="text-sm font-bold" style={{ color: currentTheme.primary }}>{level}</div>
                      </div>
                      <div className="bg-black/40 rounded-lg px-2.5 py-2 border border-white/5 text-center">
                        <div className="text-[9px] text-gray-700 font-mono">Ops</div>
                        <div className="text-sm font-bold text-white">{store.operationsExecuted || 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
