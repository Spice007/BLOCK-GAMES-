import React from 'react';
import type { BlockShape } from '../types/game';

interface BlockPieceProps {
  shape: BlockShape;
  color: string;
  size?: number; // Size of each cell in px
}

export const BlockPiece: React.FC<BlockPieceProps> = ({
  shape,
  color,
  size = 28,
}) => {
  return (
    <div
      className="flex flex-col gap-[3px] select-none pointer-events-none"
      style={{
        width: `${shape[0].length * size + (shape[0].length - 1) * 3}px`,
        height: `${shape.length * size + (shape.length - 1) * 3}px`,
      }}
    >
      {shape.map((row, r) => (
        <div key={r} className="flex gap-[3px]">
          {row.map((cell, c) => (
            <div
              key={c}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                backgroundColor: cell === 1 ? color : 'transparent',
                borderColor: cell === 1 ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
              }}
              className={`
                rounded-[4px]
                transition-all
                duration-150
                ${cell === 1 ? 'block-tile-3d border' : ''}
              `}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
