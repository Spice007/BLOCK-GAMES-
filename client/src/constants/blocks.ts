import type { BlockShape } from '../types/game';

export type BlockTemplate = {
  shape: BlockShape;
  color: string;
};

export const BLOCK_COLORS = {
  cyan: '#00d2d3',     // Vibrant Cyan
  blue: '#00a8ff',     // Vibrant Blue
  indigo: '#3b82f6',   // Indigo
  purple: '#9c88ff',   // Vibrant Purple
  pink: '#ec4899',     // Pink
  rose: '#e84118',     // Vibrant Red
  amber: '#fbc531',    // Vibrant Yellow
  orange: '#e67e22',   // Vibrant Orange
  emerald: '#4cd137',  // Vibrant Green
};

export const BLOCK_TEMPLATES: BlockTemplate[] = [
  // 1x1 Single
  { shape: [[1]], color: BLOCK_COLORS.cyan },

  // 1x2 Line
  { shape: [[1, 1]], color: BLOCK_COLORS.indigo },
  { shape: [[1], [1]], color: BLOCK_COLORS.indigo },

  // 1x3 Line
  { shape: [[1, 1, 1]], color: BLOCK_COLORS.blue },
  { shape: [[1], [1], [1]], color: BLOCK_COLORS.blue },

  // 1x4 Line
  { shape: [[1, 1, 1, 1]], color: BLOCK_COLORS.emerald },
  { shape: [[1], [1], [1], [1]], color: BLOCK_COLORS.emerald },

  // 1x5 Line (Long)
  { shape: [[1, 1, 1, 1, 1]], color: BLOCK_COLORS.pink },
  { shape: [[1], [1], [1], [1], [1]], color: BLOCK_COLORS.pink },

  // 2x2 Square
  { shape: [[1, 1], [1, 1]], color: BLOCK_COLORS.amber },

  // 3x3 Big Square
  { shape: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: BLOCK_COLORS.orange },

  // L-Shapes (Corner)
  { shape: [[1, 0], [1, 0], [1, 1]], color: BLOCK_COLORS.purple },
  { shape: [[1, 1, 1], [1, 0, 0]], color: BLOCK_COLORS.purple },
  { shape: [[1, 1], [0, 1], [0, 1]], color: BLOCK_COLORS.purple },
  { shape: [[0, 0, 1], [1, 1, 1]], color: BLOCK_COLORS.purple },

  // J-Shapes (Inverse L)
  { shape: [[0, 1], [0, 1], [1, 1]], color: BLOCK_COLORS.rose },
  { shape: [[1, 0, 0], [1, 1, 1]], color: BLOCK_COLORS.rose },
  { shape: [[1, 1], [1, 0], [1, 0]], color: BLOCK_COLORS.rose },
  { shape: [[1, 1, 1], [0, 0, 1]], color: BLOCK_COLORS.rose },

  // Small Corner (2x2)
  { shape: [[1, 1], [1, 0]], color: BLOCK_COLORS.pink },
  { shape: [[1, 1], [0, 1]], color: BLOCK_COLORS.pink },
  { shape: [[1, 0], [1, 1]], color: BLOCK_COLORS.pink },
  { shape: [[0, 1], [1, 1]], color: BLOCK_COLORS.pink },

  // T-Shapes
  { shape: [[1, 1, 1], [0, 1, 0]], color: BLOCK_COLORS.emerald },
  { shape: [[0, 1], [1, 1], [0, 1]], color: BLOCK_COLORS.emerald },
  { shape: [[0, 1, 0], [1, 1, 1]], color: BLOCK_COLORS.emerald },
  { shape: [[1, 0], [1, 1], [1, 0]], color: BLOCK_COLORS.emerald },

  // S-Shapes
  { shape: [[0, 1, 1], [1, 1, 0]], color: BLOCK_COLORS.orange },
  { shape: [[1, 0], [1, 1], [0, 1]], color: BLOCK_COLORS.orange },

  // Z-Shapes
  { shape: [[1, 1, 0], [0, 1, 1]], color: BLOCK_COLORS.rose },
  { shape: [[0, 1], [1, 1], [1, 0]], color: BLOCK_COLORS.rose },
];
