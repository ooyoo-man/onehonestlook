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
  onSetLane: (bubbleId: number, lane: 'now' | 'next' | 'later') => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const LANES: { key: 'now' | 'next' | 'later'; label: string }[] = [
  { key: 'now', label: 'Now' },
  { key: 'next', label: 'Next' },
  { key: 'later', label: 'Later' },
];

export default function BubbleNode({
  bubble,
  logs,
  onRemove,
  onUpdatePosition,
  onOpenNote,
  onOpenExplore,
  onSetLane,
  canvasRef,
}: BubbleNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const bubbleRef = useRef<HTMLDivElement>(null);

  const todayLog = logs[logKey(bubble.id, todayStr())];

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.del-btn') ||
      target.closest('.note-badge') ||
      target.closest('.explore-btn') ||
      target.closest('.lane-row')
    )
      return;
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.del-btn') ||
      target.closest('.note-badge') ||
      target.closest('.explore-btn') ||
      target.closest('.lane-row')
    )
      return;
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
    }

    return baseStyles;
  };

  const getDotColor = () => {
    if (bubble.cat === 'positive') return 'var(--green)';
    if (bubble.cat === 'negative') return 'var(--red)';
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
  const activeLane = bubble.priorityLane ?? 'later';

  return (
    <div
      ref={bubbleRef}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      className="absolute rounded-[11px] px-2 py-1 text-[0.72rem] font-normal flex flex-col gap-1 transition-shadow duration-150 z-10 select-none border group hover:shadow-md animate-[popIn_0.28s_cubic-bezier(0.34,1.45,0.64,1)_both] max-w-[min(232px,calc(100vw-40px))]"
      style={{
        left: bubble.x,
        top: bubble.y,
        transform: 'translate(-50%, -50%)',
        cursor: isDragging ? 'grabbing' : 'grab',
        ...bubbleStyles,
      }}
    >
      <div className="flex items-center gap-1 min-h-[18px]">
        <span className="w-[4px] h-[4px] rounded-full flex-shrink-0" style={{ background: getDotColor() }} />
        <span className="truncate min-w-0 flex-1 leading-tight">{bubble.label}</span>
        <button
          className={`explore-btn w-[14px] h-[14px] rounded-full flex items-center justify-center cursor-pointer border-none transition-all duration-150 p-0 flex-shrink-0 ${hasReflections ? '' : 'opacity-0 group-hover:opacity-100'}`}
          style={{
            background: hasReflections ? 'var(--gold-bg)' : 'transparent',
            color: hasReflections ? 'var(--gold)' : 'var(--ink4)',
            opacity: hasReflections ? 1 : 0,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onOpenExplore(bubble);
          }}
          title="Explore why this matters"
        >
          <Lightbulb className="w-[8px] h-[8px]" strokeWidth={2.5} />
        </button>
        <span
          className="note-badge text-[7px] rounded px-0.5 py-px border cursor-pointer flex-shrink-0 transition-all duration-150 hover:opacity-80 leading-none"
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
          className="del-btn w-[12px] h-[12px] rounded-full bg-transparent border-none text-[9px] leading-none cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 p-0 flex-shrink-0 hover:!text-[var(--red)]"
          style={{ color: 'var(--ink4)' }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(bubble.id);
          }}
        >
          ×
        </button>
      </div>

      <div
        className="lane-row flex w-full rounded-md overflow-hidden border"
        style={{ borderColor: 'rgba(30,28,24,0.14)' }}
        role="group"
        aria-label="Focus priority — Now, Next, or Later"
        title="Focus priority (same as Focus tab)"
      >
        {LANES.map(({ key, label }, i) => {
          const selected = activeLane === key;
          return (
            <button
              key={key}
              type="button"
              className="lane-btn flex-1 min-w-0 text-center font-medium leading-none py-[5px] px-0.5 border-none transition-colors duration-150"
              style={{
                fontFamily: 'var(--font-b)',
                fontSize: '0.58rem',
                letterSpacing: '0.02em',
                background: selected ? 'rgba(202,166,67,0.2)' : 'rgba(30,28,24,0.03)',
                color: selected ? 'var(--ink)' : 'var(--ink3)',
                borderRight: i < 2 ? '1px solid rgba(30,28,24,0.12)' : undefined,
                boxShadow: selected ? 'inset 0 0 0 1px rgba(202,166,67,0.45)' : 'none',
              }}
              aria-pressed={selected}
              aria-label={`${label} priority`}
              title={`${label} — Focus lane`}
              onClick={(e) => {
                e.stopPropagation();
                onSetLane(bubble.id, key);
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
