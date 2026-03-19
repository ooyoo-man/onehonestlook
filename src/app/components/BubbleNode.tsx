import { useState, useRef, useEffect } from 'react';
import { Bubble, Log } from '../types';
import { todayStr, logKey } from '../utils/helpers';
import { Lightbulb } from 'lucide-react';

interface BubbleNodeProps {
  bubble: Bubble;
  logs: Record<string, Log>;
  onRemove: (id: number) => void;
  onUpdatePosition: (id: number, x: number, y: number) => void;
  onOpenNote: (bubbleId: number, dateStr: string) => void;
  onOpenExplore: (bubble: Bubble) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export default function BubbleNode({
  bubble,
  logs,
  onRemove,
  onUpdatePosition,
  onOpenNote,
  onOpenExplore,
  canvasRef,
}: BubbleNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const todayLog = logs[logKey(bubble.id, todayStr())];

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.del-btn') || target.closest('.note-badge') || target.closest('.explore-btn')) return;
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.del-btn') || target.closest('.note-badge') || target.closest('.explore-btn')) return;
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const x = Math.max(50, Math.min(rect.width - 50, clientX - rect.left));
      const y = Math.max(50, Math.min(rect.height - 50, clientY - rect.top));

      onUpdatePosition(bubble.id, x, y);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, bubble.id, canvasRef, onUpdatePosition]);

  const getBubbleStyles = () => {
    const baseStyles = {
      background: 'var(--bg)',
      borderColor: 'var(--rule)',
      color: 'var(--ink2)',
    };

    if (bubble.cat === 'positive') {
      return {
        background: 'var(--green-bg)',
        borderColor: 'var(--green-ln)',
        color: 'var(--green)',
      };
    } else if (bubble.cat === 'negative') {
      return {
        background: 'var(--red-bg)',
        borderColor: 'var(--red-ln)',
        color: 'var(--red)',
      };
    } else if (bubble.cat === 'habit') {
      return {
        background: 'var(--blue-bg)',
        borderColor: 'var(--blue-ln)',
        color: 'var(--blue)',
      };
    }

    return baseStyles;
  };

  const getDotColor = () => {
    if (bubble.cat === 'positive') return 'var(--green)';
    if (bubble.cat === 'negative') return 'var(--red)';
    if (bubble.cat === 'habit') return 'var(--blue)';
    return 'var(--ink4)';
  };

  const getBadgeStyles = () => {
    if (todayLog?.yn === 'yes') {
      return {
        background: 'var(--green-bg)',
        color: 'var(--green)',
        borderColor: 'var(--green-ln)',
      };
    } else if (todayLog?.yn === 'no') {
      return {
        background: 'var(--red-bg)',
        color: 'var(--red)',
        borderColor: 'var(--red-ln)',
      };
    }
    return {
      background: 'var(--gold-bg)',
      color: 'var(--gold)',
      borderColor: 'rgba(138,108,62,0.18)',
    };
  };

  const badgeText = todayLog?.yn === 'yes' ? '✓' : todayLog?.yn === 'no' ? '✕' : '✎';

  const hasReflections = bubble.reflections && Object.values(bubble.reflections).some(r => r?.trim().length > 0);

  const bubbleStyles = getBubbleStyles();
  const badgeStyles = getBadgeStyles();

  return (
    <div
      ref={bubbleRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className="absolute rounded-full px-3 py-1.5 text-[0.74rem] font-normal flex items-center gap-1.5 whitespace-nowrap transition-shadow duration-150 z-10 select-none border group hover:shadow-md animate-[popIn_0.28s_cubic-bezier(0.34,1.45,0.64,1)_both]"
      style={{
        left: bubble.x,
        top: bubble.y,
        transform: 'translate(-50%, -50%)',
        cursor: isDragging ? 'grabbing' : 'grab',
        ...bubbleStyles,
      }}
    >
      <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: getDotColor() }} />
      <span>{bubble.label}</span>
      <button
        className={`explore-btn w-[15px] h-[15px] rounded-full flex items-center justify-center cursor-pointer border-none transition-all duration-150 p-0 flex-shrink-0 ${hasReflections ? '' : 'opacity-0 group-hover:opacity-100'}`}
        style={{ 
          background: hasReflections ? 'var(--gold-bg)' : 'transparent',
          color: hasReflections ? 'var(--gold)' : 'var(--ink4)',
          opacity: hasReflections ? 1 : 0
        }}
        onClick={(e) => {
          e.stopPropagation();
          onOpenExplore(bubble);
        }}
        title="Explore why this matters"
      >
        <Lightbulb className="w-[9px] h-[9px]" strokeWidth={2.5} />
      </button>
      <span
        className="note-badge text-[8px] rounded px-1 py-0.5 border cursor-pointer flex-shrink-0 transition-all duration-150 hover:opacity-80"
        onClick={(e) => {
          e.stopPropagation();
          onOpenNote(bubble.id, todayStr());
        }}
        title="Log today"
        style={badgeStyles}
      >
        {badgeText}
      </span>
      <button
        className="del-btn w-[13px] h-[13px] rounded-full bg-transparent border-none text-[10px] cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-0 flex-shrink-0 hover:!text-[var(--red)]"
        style={{ color: 'var(--ink4)' }}
        onClick={(e) => {
          e.stopPropagation();
          onRemove(bubble.id);
        }}
      >
        ×
      </button>
    </div>
  );
}