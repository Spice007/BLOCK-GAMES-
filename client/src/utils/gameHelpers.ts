import type { BoardGrid, BlockShape, BlockInstance } from '../types/game';
import { BLOCK_TEMPLATES } from '../constants/blocks';

export const BOARD_SIZE = 10;

export function createEmptyBoard(): BoardGrid {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() =>
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => ({ filled: false, color: '' }))
    );
}

/**
 * Validates if a block shape can be placed at the given row/col offset on the board.
 */
export function canPlaceBlock(
  board: BoardGrid,
  shape: BlockShape,
  startRow: number,
  startCol: number
): boolean {
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        const boardRow = startRow + r;
        const boardCol = startCol + c;

        // Check boundary limits
        if (
          boardRow < 0 ||
          boardRow >= BOARD_SIZE ||
          boardCol < 0 ||
          boardCol >= BOARD_SIZE
        ) {
          return false;
        }

        // Check if cell is already occupied
        if (board[boardRow][boardCol].filled) {
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * Places a block onto the board, returns a new board grid.
 */
export function placeBlock(
  board: BoardGrid,
  shape: BlockShape,
  startRow: number,
  startCol: number,
  color: string,
  blockId: string
): BoardGrid {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] === 1) {
        const boardRow = startRow + r;
        const boardCol = startCol + c;
        newBoard[boardRow][boardCol] = {
          filled: true,
          color,
          blockId,
        };
      }
    }
  }

  return newBoard;
}

/**
 * Detects full rows/columns and clears them.
 * Returns the cleared board and the count of cleared lines.
 */
export function checkLineClears(board: BoardGrid): {
  clearedBoard: BoardGrid;
  clearedLines: { rows: number[]; cols: number[] };
} {
  const rowsToClear: number[] = [];
  const colsToClear: number[] = [];

  // Check rows
  for (let r = 0; r < BOARD_SIZE; r++) {
    let rowFilled = true;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (!board[r][c].filled) {
        rowFilled = false;
        break;
      }
    }
    if (rowFilled) {
      rowsToClear.push(r);
    }
  }

  // Check columns
  for (let c = 0; c < BOARD_SIZE; c++) {
    let colFilled = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (!board[r][c].filled) {
        colFilled = false;
        break;
      }
    }
    if (colFilled) {
      colsToClear.push(c);
    }
  }

  if (rowsToClear.length === 0 && colsToClear.length === 0) {
    return { clearedBoard: board, clearedLines: { rows: [], cols: [] } };
  }

  // Create a new board copy and clear the filled lines
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

  // Clear rows
  for (const r of rowsToClear) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      newBoard[r][c] = { filled: false, color: '' };
    }
  }

  // Clear columns
  for (const c of colsToClear) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      newBoard[r][c] = { filled: false, color: '' };
    }
  }

  return {
    clearedBoard: newBoard,
    clearedLines: { rows: rowsToClear, cols: colsToClear },
  };
}

/**
 * Generates three random block instances from the template pool.
 */
export function generateRandomBlocks(): BlockInstance[] {
  const instances: BlockInstance[] = [];

  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * BLOCK_TEMPLATES.length);
    const template = BLOCK_TEMPLATES[randomIndex];

    const shape = template.shape;
    const height = shape.length;
    const width = shape[0].length;

    instances.push({
      id: `block-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
      shape,
      color: template.color,
      width,
      height,
      used: false,
    });
  }

  return instances;
}

/**
 * Checks if there's any legal move left for any of the unused blocks on the board.
 */
export function hasAnyLegalMoves(
  board: BoardGrid,
  blocks: BlockInstance[]
): boolean {
  const activeBlocks = blocks.filter((b) => !b.used);

  // If no blocks are left to place, we'll generate new ones, so there are still legal moves.
  if (activeBlocks.length === 0) {
    return true;
  }

  for (const block of activeBlocks) {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (canPlaceBlock(board, block.shape, r, c)) {
          return true;
        }
      }
    }
  }

  return false;
}
