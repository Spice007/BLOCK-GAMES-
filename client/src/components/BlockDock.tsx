import React from 'react';
import type { BlockInstance } from '../types/game';
import { BlockPiece } from './BlockPiece';

interface BlockDockProps {
  blocks: BlockInstance[];
  onStartDrag: (event: React.PointerEvent<HTMLDivElement>, block: BlockInstance) => void;
}

export const BlockDock: React.FC<BlockDockProps> = ({ blocks, onStartDrag }) => {
  return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-[420px] mt-6">
      {blocks.map((block) => (
        <div
          key={block.id}
          className={`
            aspect-square
            flex
            items-center
            justify-center
            relative
            rounded-2xl
            bg-[#090b14]/90
            border
            border-white/[0.03]
            shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]
            transition-all
            duration-200
            ${block.used ? 'opacity-10 scale-75 select-none pointer-events-none' : 'hover:bg-white/[0.01] hover:border-white/5 cursor-grab active:cursor-grabbing'}
          `}
          onPointerDown={(e) => {
            if (!block.used) {
              onStartDrag(e, block);
            }
          }}
          style={{ touchAction: 'none' }} // Prevent scrolling while dragging
        >
          {!block.used && (
            <div className="transform scale-90 hover:scale-95 transition-transform duration-200 pointer-events-none">
              <BlockPiece shape={block.shape} color={block.color} size={20} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
