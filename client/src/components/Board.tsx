import React from 'react';
import type { BoardGrid, BlockInstance } from '../types/game';
import { canPlaceBlock } from '../utils/gameHelpers';

interface BoardProps {
  board: BoardGrid;
  draggedBlock: BlockInstance | null;
  hoveredCell: { row: number; col: number } | null;
  activePowerUp: 'hammer' | 'bomb' | 'shuffle' | 'undo' | null;
  onCellClick: (row: number, col: number) => void;
}

export const Board: React.FC<BoardProps> = ({
  board,
  draggedBlock,
  hoveredCell,
  activePowerUp,
  onCellClick,
}) => {
  const isPreviewCell = (row: number, col: number): boolean => {
    if (!draggedBlock || !hoveredCell) return false;

    const startRow = hoveredCell.row;
    const startCol = hoveredCell.col;

    const isValid = canPlaceBlock(board, draggedBlock.shape, startRow, startCol);
    if (!isValid) return false;

    const shapeRow = row - startRow;
    const shapeCol = col - startCol;

    if (
      shapeRow >= 0 &&
      shapeRow < draggedBlock.shape.length &&
      shapeCol >= 0 &&
      shapeCol < draggedBlock.shape[shapeRow].length
    ) {
      return draggedBlock.shape[shapeRow][shapeCol] === 1;
    }

    return false;
  };

  const isPowerUpHighlight = (row: number, col: number): boolean => {
    if (!activePowerUp || !hoveredCell) return false;

    if (activePowerUp === 'hammer') {
      return row === hoveredCell.row && col === hoveredCell.col;
    }

    if (activePowerUp === 'bomb') {
      return (
        Math.abs(row - hoveredCell.row) <= 1 &&
        Math.abs(col - hoveredCell.col) <= 1
      );
    }

    return false;
  };

  return (
    <div className="relative bg-[#121930] rounded-xl p-2.5 shadow-2xl border-4 border-[#2c3960] max-w-full w-[420px] aspect-square flex flex-col justify-between">
      <div className="grid grid-cols-10 gap-[3px] w-full h-full">
        {board.map((row, rIndex) =>
          row.map((cell, cIndex) => {
            const hasBlock = cell.filled;
            const showPreview = isPreviewCell(rIndex, cIndex);
            const showPowerUp = isPowerUpHighlight(rIndex, cIndex);

            return (
              <button
                key={`${rIndex}-${cIndex}`}
                onClick={() => onCellClick(rIndex, cIndex)}
                className={`
                  relative
                  aspect-square
                  rounded-[4px]
                  transition-all
                  duration-150
                  flex
                  items-center
                  justify-center
                  ${
                    hasBlock
                      ? 'block-tile-3d border'
                      : showPreview
                      ? 'scale-[0.98] border border-white/20 opacity-50 block-tile-3d'
                      : showPowerUp
                      ? 'bg-rose-500/20 border border-rose-500/60 scale-[0.96] animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                      : 'bg-[#151d35] border border-[#232d4b] hover:bg-white/[0.02]'
                  }
                `}
                style={{
                  backgroundColor: hasBlock
                    ? cell.color
                    : showPreview && draggedBlock
                    ? draggedBlock.color
                    : undefined,
                  borderColor: hasBlock
                    ? 'rgba(255, 255, 255, 0.25)'
                    : showPreview
                    ? 'rgba(255, 255, 255, 0.15)'
                    : undefined,
                }}
              >
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
