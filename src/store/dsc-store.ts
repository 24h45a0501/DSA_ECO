'use client';

import { create } from 'zustand';

// Structure categories with groups and subtypes
export const catalog = [
  {
    id: 'linear',
    name: 'Linear',
    groups: [
      {
        id: 'arrays', name: 'Arrays',
        items: [
          { id: 'static-array', name: 'Static Array' },
          { id: 'dynamic-array', name: 'Dynamic Array' },
          { id: '1d-array', name: '1D Array' },
          { id: '2d-array', name: '2D Array' },
          { id: '3d-array', name: '3D Array' },
          { id: 'jagged-array', name: 'Jagged Array' },
        ],
      },
      {
        id: 'linked-lists', name: 'Linked Lists',
        items: [
          { id: 'singly-linked-list', name: 'Singly Linked List' },
          { id: 'doubly-linked-list', name: 'Doubly Linked List' },
          { id: 'circular-linked-list', name: 'Circular Linked List' },
          { id: 'circular-doubly-linked-list', name: 'Circular Doubly Linked List' },
        ],
      },
      {
        id: 'stack', name: 'Stack',
        items: [{ id: 'stack', name: 'Standard Stack' }],
      },
      {
        id: 'queues', name: 'Queues',
        items: [
          { id: 'simple-queue', name: 'Simple Queue' },
          { id: 'circular-queue', name: 'Circular Queue' },
          { id: 'priority-queue', name: 'Priority Queue' },
          { id: 'deque', name: 'Deque' },
        ],
      },
      {
        id: 'hash-table', name: 'Hash Table',
        items: [{ id: 'hash-table', name: 'Hash Table' }],
      },
    ],
  },
  {
    id: 'non-linear',
    name: 'Non-Linear',
    groups: [
      {
        id: 'trees', name: 'Trees',
        items: [
          { id: 'binary-tree', name: 'Binary Tree' },
          { id: 'bst', name: 'Binary Search Tree' },
          { id: 'avl-tree', name: 'AVL Tree' },
          { id: 'red-black-tree', name: 'Red Black Tree' },
          { id: 'b-tree', name: 'B Tree' },
          { id: 'bplus-tree', name: 'B+ Tree' },
          { id: 'segment-tree', name: 'Segment Tree' },
          { id: 'fenwick-tree', name: 'Fenwick Tree' },
          { id: 'trie', name: 'Trie' },
          { id: 'heap', name: 'Heap' },
          { id: 'max-heap', name: 'Max Heap' },
          { id: 'min-heap', name: 'Min Heap' },
        ],
      },
      {
        id: 'graphs', name: 'Graphs',
        items: [
          { id: 'directed-graph', name: 'Directed Graph' },
          { id: 'undirected-graph', name: 'Undirected Graph' },
          { id: 'weighted-graph', name: 'Weighted Graph' },
          { id: 'dag', name: 'DAG' },
        ],
      },
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    groups: [
      {
        id: 'advanced-structures', name: 'Advanced',
        items: [
          { id: 'disjoint-set-union', name: 'Disjoint Set Union' },
          { id: 'skip-list', name: 'Skip List' },
          { id: 'bloom-filter', name: 'Bloom Filter' },
          { id: 'treap', name: 'Treap' },
        ],
      },
    ],
  },
];

export const defaultData: Record<string, number[]> = {
  'static-array': [10, 20, 30, 40, 50],
  'dynamic-array': [5, 15, 25, 35, 45, 55],
  '1d-array': [10, 20, 30, 40, 50],
  '2d-array': [10, 20, 30, 40, 50, 60, 70, 80, 90],
  '3d-array': [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
  'jagged-array': [10, 20, 30, 40, 50, 60, 70],
  'singly-linked-list': [10, 20, 30, 40, 50],
  'doubly-linked-list': [10, 20, 30, 40],
  'circular-linked-list': [10, 20, 30, 40, 50],
  'circular-doubly-linked-list': [10, 20, 30, 40],
  'stack': [10, 20, 30],
  'simple-queue': [10, 20, 30, 40],
  'circular-queue': [10, 20, 30, 40, 50],
  'priority-queue': [10, 20, 30, 40],
  'deque': [10, 20, 30, 40],
  'hash-table': [10, 20, 30, 40, 50],
  'binary-tree': [10, 5, 15, 3, 7, 12, 18],
  'bst': [10, 5, 15, 3, 7, 12, 18],
  'avl-tree': [10, 5, 15, 3, 7, 12, 18],
  'red-black-tree': [10, 5, 15, 3, 7, 12, 18],
  'b-tree': [10, 20, 30, 40, 50, 60, 70],
  'bplus-tree': [10, 20, 30, 40, 50, 60],
  'segment-tree': [10, 20, 30, 40, 50, 60, 70],
  'fenwick-tree': [10, 20, 30, 40, 50, 60, 70, 80],
  'trie': [10, 20, 30, 40],
  'heap': [90, 80, 70, 60, 50, 40, 30],
  'max-heap': [90, 80, 70, 60, 50, 40, 30],
  'min-heap': [10, 20, 30, 40, 50, 60, 70],
  'directed-graph': [10, 20, 30, 40],
  'undirected-graph': [10, 20, 30, 40, 50],
  'weighted-graph': [10, 20, 30, 40],
  'dag': [10, 20, 30, 40],
  'disjoint-set-union': [1, 2, 3, 4, 5, 6, 7],
  'skip-list': [10, 20, 30, 40, 50],
  'bloom-filter': [10, 20, 30, 40],
  'treap': [10, 5, 15, 3, 7],
};

export const operationsFor: Record<string, string[]> = {
  'static-array': ['Insert', 'Delete', 'Search', 'Update', 'Reverse', 'Sort', 'Traverse'],
  'dynamic-array': ['Insert', 'Delete', 'Search', 'Resize', 'Reverse', 'Traverse'],
  '1d-array': ['Insert', 'Delete', 'Search', 'Traverse', 'Rotate Left', 'Rotate Right'],
  '2d-array': ['Insert Row', 'Insert Col', 'Search', 'Traverse'],
  '3d-array': ['Insert', 'Search', 'Traverse'],
  'jagged-array': ['Insert Row', 'Delete Row', 'Search', 'Traverse'],
  'singly-linked-list': ['Insert Head', 'Insert Tail', 'Insert Position', 'Delete', 'Search', 'Reverse', 'Traverse'],
  'doubly-linked-list': ['Insert Head', 'Insert Tail', 'Delete', 'Search', 'Reverse', 'Traverse'],
  'circular-linked-list': ['Insert', 'Delete', 'Search', 'Traverse', 'Rotate'],
  'circular-doubly-linked-list': ['Insert', 'Delete', 'Search', 'Traverse'],
  'stack': ['Push', 'Pop', 'Peek', 'Size', 'Clear'],
  'simple-queue': ['Enqueue', 'Dequeue', 'Peek', 'Size', 'Clear'],
  'circular-queue': ['Enqueue', 'Dequeue', 'Peek', 'Is Full', 'Size'],
  'priority-queue': ['Enqueue', 'Dequeue', 'Peek', 'Change Priority'],
  'deque': ['Insert Front', 'Insert Rear', 'Delete Front', 'Delete Rear', 'Peek Front', 'Peek Rear'],
  'hash-table': ['Insert', 'Delete', 'Search', 'Clear'],
  'binary-tree': ['Insert', 'Search', 'Inorder', 'Preorder', 'Postorder', 'Level Order'],
  'bst': ['Insert', 'Delete', 'Search', 'Find Min', 'Find Max', 'Inorder'],
  'avl-tree': ['Insert', 'Delete', 'Search', 'Rotate Left', 'Rotate Right'],
  'red-black-tree': ['Insert', 'Delete', 'Search', 'Rotate'],
  'b-tree': ['Insert', 'Delete', 'Search'],
  'bplus-tree': ['Insert', 'Delete', 'Search', 'Range Query'],
  'segment-tree': ['Build', 'Range Query', 'Point Update'],
  'fenwick-tree': ['Build', 'Prefix Sum', 'Point Update'],
  'trie': ['Insert', 'Search', 'Delete', 'Starts With'],
  'heap': ['Insert', 'Extract Max', 'Heapify', 'Peek'],
  'max-heap': ['Insert', 'Extract Max', 'Heapify', 'Peek'],
  'min-heap': ['Insert', 'Extract Min', 'Heapify', 'Peek'],
  'directed-graph': ['Add Edge', 'BFS', 'DFS', 'Topological Sort'],
  'undirected-graph': ['Add Edge', 'BFS', 'DFS'],
  'weighted-graph': ['Add Edge', 'Shortest Path', 'MST'],
  'dag': ['Add Edge', 'Topological Sort', 'DFS'],
  'disjoint-set-union': ['Union', 'Find', 'Path Compress'],
  'skip-list': ['Insert', 'Delete', 'Search'],
  'bloom-filter': ['Insert', 'Check', 'Clear'],
  'treap': ['Insert', 'Delete', 'Search'],
};

export const complexity: Record<string, { best: string; avg: string; worst: string; space: string }> = {
  'static-array': { best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(n)' },
  'dynamic-array': { best: 'O(1)', avg: 'O(1)', worst: 'O(n)', space: 'O(n)' },
  '1d-array': { best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(n)' },
  'singly-linked-list': { best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(n)' },
  'doubly-linked-list': { best: 'O(1)', avg: 'O(n)', worst: 'O(n)', space: 'O(n)' },
  'stack': { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(n)' },
  'simple-queue': { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(n)' },
  'circular-queue': { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(n)' },
  'priority-queue': { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(n)' },
  'deque': { best: 'O(1)', avg: 'O(1)', worst: 'O(1)', space: 'O(n)' },
  'hash-table': { best: 'O(1)', avg: 'O(1)', worst: 'O(n)', space: 'O(n)' },
  'binary-tree': { best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)', space: 'O(n)' },
  'bst': { best: 'O(log n)', avg: 'O(log n)', worst: 'O(n)', space: 'O(n)' },
  'avl-tree': { best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(n)' },
  'red-black-tree': { best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(n)' },
  'heap': { best: 'O(1)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(n)' },
  'directed-graph': { best: 'O(V+E)', avg: 'O(V+E)', worst: 'O(V+E)', space: 'O(V+E)' },
  'trie': { best: 'O(m)', avg: 'O(m)', worst: 'O(m)', space: 'O(n*m)' },
  'segment-tree': { best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(n)' },
  'fenwick-tree': { best: 'O(log n)', avg: 'O(log n)', worst: 'O(log n)', space: 'O(n)' },
};

export function getGroupItems(groupId: string) {
  for (const cat of catalog) {
    for (const g of cat.groups) {
      if (g.id === groupId) return g.items;
    }
  }
  return [];
}

export function findItem(id: string) {
  for (const cat of catalog) {
    for (const g of cat.groups) {
      for (const item of g.items) {
        if (item.id === id) return item;
      }
    }
  }
  return null;
}

export function getGroupName(id: string) {
  for (const cat of catalog) {
    for (const g of cat.groups) {
      if (g.id === id) return g.name;
      for (const item of g.items) {
        if (item.id === id) return g.name;
      }
    }
  }
  return '';
}

interface DSCState {
  currentGroup: string;
  currentStructure: string;
  data: number[];
  highlights: number[];
  log: string[];
  xp: number;
  level: number;
  operationsExecuted: number;
}

interface DSCActions {
  selectGroup: (gid: string) => void;
  selectStructure: (sid: string) => void;
  setData: (d: number[]) => void;
  setHighlights: (h: number[]) => void;
  addLog: (msg: string) => void;
  addXp: (n: number) => void;
  trackOperation: () => void;
}

export const useStore = create<DSCState & DSCActions>((set, get) => ({
  currentGroup: 'arrays',
  currentStructure: 'static-array',
  data: [10, 20, 30, 40, 50],
  highlights: [],
  log: ['System ready'],
  xp: 0,
  level: 1,
  operationsExecuted: 0,

  selectGroup: (gid) => {
    const items = getGroupItems(gid);
    if (items.length > 0) {
      const first = items[0].id;
      set({
        currentGroup: gid,
        currentStructure: first,
        data: defaultData[first] || [10, 20, 30, 40, 50],
        highlights: [],
        log: [`Switched to ${items[0].name}`],
      });
    }
  },

  selectStructure: (sid) => {
    const item = findItem(sid);
    if (item) {
      set({
        currentStructure: sid,
        data: defaultData[sid] || [10, 20, 30, 40, 50],
        highlights: [],
        log: [`Selected: ${item.name}`],
      });
      get().addXp(2);
    }
  },

  setData: (d) => set({ data: d }),
  setHighlights: (h) => set({ highlights: h }),
  addLog: (msg) => set((s) => ({ log: [...s.log.slice(-19), `> ${msg}`] })),
  addXp: (n) => set((s) => ({ xp: s.xp + n, level: Math.floor((s.xp + n) / 500) + 1 })),
  trackOperation: () => set((s) => ({ operationsExecuted: s.operationsExecuted + 1 })),
}));
