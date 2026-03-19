import { useState, useRef, useEffect } from 'react';
import { Bubble, Log } from '../types';
import { todayStr, logKey } from '../utils/helpers';
import BubbleNode from './BubbleNode';
import ColumnView from './ColumnView';
import { LayoutGrid, Network } from 'lucide-react';

interface MapViewProps {
  bubbles: Bubble[];
  setBubbles: (bubbles: Bubble[]) => void;
  logs: Record<string, Log>;
  onOpenNoteModal: (bubbleId: number, dateStr: string) => void;
  onOpenExploreModal: (bubble: Bubble) => void;
}

export default function MapView({ bubbles, setBubbles, logs, onOpenNoteModal, onOpenExploreModal }: MapViewProps) {
  const [selectedCat, setSelectedCat] = useState<Bubble['cat']>('neutral');
  const [inputValue, setInputValue] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'columns'>('map');
  const [transition, setTransition] = useState<{
    from: 'map' | 'columns';
    to: 'map' | 'columns';
    phase: 'start' | 'end';
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [centerPos, setCenterPos] = useState({ x: 400, y: 300 });
  const transitionMs = 320;
  const isTransitioning = transition !== null;

  useEffect(() => {
    const updateCenter = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCenterPos({ x: rect.width / 2, y: rect.height / 2 });
      }
    };
    updateCenter();
    window.addEventListener('resize', updateCenter);
    return () => window.removeEventListener('resize', updateCenter);
  }, []);

  useEffect(() => {
    if (!transition || transition.phase !== 'end') return;
    const t = window.setTimeout(() => {
      setViewMode(transition.to);
      setTransition(null);
    }, transitionMs);
    return () => window.clearTimeout(t);
  }, [transition]);

  const addBubble = () => {
    const label = inputValue.trim();
    if (!label) return;

    const angle = Math.random() * Math.PI * 2;
    const radius = 112 + Math.random() * 100;
    const x = Math.max(55, Math.min(centerPos.x * 2 - 55, centerPos.x + Math.cos(angle) * radius));
    const y = Math.max(55, Math.min(centerPos.y * 2 - 55, centerPos.y + Math.sin(angle) * radius));

    const newBubble: Bubble = {
      id: Date.now() + Math.random(),
      label,
      cat: selectedCat,
      x,
      y,
    };

    setBubbles([...bubbles, newBubble]);
    setInputValue('');
  };

  const removeBubble = (id: number) => {
    setBubbles(bubbles.filter(b => b.id !== id));
  };

  const updateBubblePosition = (id: number, x: number, y: number) => {
    setBubbles(bubbles.map(b => (b.id === id ? { ...b, x, y } : b)));
  };

  const updateBubbleReflections = (id: number, reflections: Record<string, string>) => {
    setBubbles(bubbles.map(b => (b.id === id ? { ...b, reflections } : b)));
  };

  const clearAll = () => {
    if (window.confirm('Clear your entire map?')) {
      setBubbles([]);
    }
  };

  const stats = {
    total: bubbles.length,
    positive: bubbles.filter(b => b.cat === 'positive').length,
    negative: bubbles.filter(b => b.cat === 'negative').length,
    habit: bubbles.filter(b => b.cat === 'habit').length,
  };

  const shouldRenderMap = viewMode === 'map' || transition?.from === 'map' || transition?.to === 'map';
  const shouldRenderColumns = viewMode === 'columns' || transition?.from === 'columns' || transition?.to === 'columns';
  const effectiveMode = transition?.to ?? viewMode;

  const requestViewMode = (next: 'map' | 'columns') => {
    if (next === effectiveMode) return;
    if (isTransitioning) return;
    setTransition({ from: viewMode, to: next, phase: 'start' });
    window.requestAnimationFrame(() => {
      setTransition(t => (t ? { ...t, phase: 'end' } : t));
    });
  };

  const mapStyle = (() => {
    if (!transition) {
      return {
        opacity: 1,
        translateY: 0,
        blurPx: 0,
      };
    }

    // Map is exiting when going map -> columns
    if (transition.from === 'map' && transition.to === 'columns') {
      return transition.phase === 'start'
        ? { opacity: 1, translateY: 0, blurPx: 0 }
        : { opacity: 0, translateY: -8, blurPx: 3 };
    }

    // Map is entering when going columns -> map
    if (transition.from === 'columns' && transition.to === 'map') {
      return transition.phase === 'start'
        ? { opacity: 0, translateY: -8, blurPx: 3 }
        : { opacity: 1, translateY: 0, blurPx: 0 };
    }

    return { opacity: 1, translateY: 0, blurPx: 0 };
  })();

  const columnsStyle = (() => {
    if (!transition) {
      return {
        opacity: 1,
        translateY: 0,
        blurPx: 0,
      };
    }

    // Columns is entering when going map -> columns
    if (transition.from === 'map' && transition.to === 'columns') {
      return transition.phase === 'start'
        ? { opacity: 0, translateY: 8, blurPx: 3 }
        : { opacity: 1, translateY: 0, blurPx: 0 };
    }

    // Columns is exiting when going columns -> map
    if (transition.from === 'columns' && transition.to === 'map') {
      return transition.phase === 'start'
        ? { opacity: 1, translateY: 0, blurPx: 0 }
        : { opacity: 0, translateY: 8, blurPx: 3 };
    }

    return { opacity: 1, translateY: 0, blurPx: 0 };
  })();

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Layers */}
      <div className="absolute inset-0">
        {shouldRenderMap && (
          <div
            className="absolute inset-0 flex flex-col overflow-hidden"
            style={{
              opacity: mapStyle.opacity,
              transform: `translate3d(0, ${mapStyle.translateY}px, 0)`,
              filter: `blur(${mapStyle.blurPx}px)`,
              transition: `opacity ${transitionMs}ms ease-out, transform ${transitionMs}ms ease-out, filter ${transitionMs}ms ease-out`,
              pointerEvents: effectiveMode === 'map' ? 'auto' : 'none',
            }}
          >
            {/* Canvas */}
            <div className="flex-1 relative overflow-hidden" ref={canvasRef}>
              <div className="absolute inset-0">
                {/* SVG for connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]">
                  {bubbles.map(b => (
                    <line
                      key={b.id}
                      x1={centerPos.x}
                      y1={centerPos.y}
                      x2={b.x}
                      y2={b.y}
                      stroke="var(--rule)"
                      strokeWidth="1"
                      fill="none"
                    />
                  ))}
                </svg>

                {/* Concentric rings */}
                {[125, 205, 285].map(radius => (
                  <div
                    key={radius}
                    className="absolute rounded-full border pointer-events-none z-0"
                    style={{
                      left: centerPos.x,
                      top: centerPos.y,
                      width: radius * 2,
                      height: radius * 2,
                      marginLeft: -radius,
                      marginTop: -radius,
                      borderColor: 'var(--rule2)',
                    }}
                  />
                ))}

                {/* You node */}
                <div
                  className="absolute w-[68px] h-[68px] rounded-full flex items-center justify-center z-20 pointer-events-none"
                  style={{
                    left: centerPos.x,
                    top: centerPos.y,
                    transform: 'translate(-50%, -50%)',
                    background: 'var(--bg)',
                    border: '1.5px solid var(--gold-lt)',
                    boxShadow: '0 0 0 5px rgba(138,108,62,0.06), var(--sh)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-h)', color: 'var(--gold)' }} className="text-[0.82rem] italic">
                    you
                  </span>
                </div>

                {/* Bubbles */}
                {bubbles.map(bubble => (
                  <BubbleNode
                    key={bubble.id}
                    bubble={bubble}
                    logs={logs}
                    onRemove={removeBubble}
                    onUpdatePosition={updateBubblePosition}
                    onOpenNote={onOpenNoteModal}
                    onOpenExplore={onOpenExploreModal}
                    canvasRef={canvasRef}
                  />
                ))}

                {/* Hint */}
                {bubbles.length === 0 && (
                  <div
                    className="absolute text-center pointer-events-none z-[2] transition-opacity duration-400"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, calc(-50% + 62px))',
                    }}
                  >
                    <p className="text-[0.74rem] leading-[2.1]" style={{ color: 'var(--ink4)' }}>
                      Add something honest about yourself below.
                      <br />
                      A habit, a quality, something you want to change.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Stats strip */}
            <div
              className="flex-shrink-0 flex items-center gap-6 px-6 h-[35px] border-t text-[0.68rem] tracking-wide"
              style={{ borderColor: 'var(--rule2)', background: 'var(--bg2)', color: 'var(--ink3)' }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--ink4)' }} />
                Total: <span className="font-medium" style={{ color: 'var(--ink)' }}>{stats.total}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--green)' }} />
                Positive: <span className="font-medium" style={{ color: 'var(--ink)' }}>{stats.positive}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--red)' }} />
                Needs work: <span className="font-medium" style={{ color: 'var(--ink)' }}>{stats.negative}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--blue)' }} />
                Habits: <span className="font-medium" style={{ color: 'var(--ink)' }}>{stats.habit}</span>
              </div>
            </div>

            {/* Add bar */}
            <div
              className="flex-shrink-0 flex items-center gap-2 px-6 py-2.5 border-t flex-wrap"
              style={{ borderColor: 'var(--rule)', background: 'var(--bg)' }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addBubble()}
                placeholder="Add something honest about yourself…"
                maxLength={40}
                className="text-[0.78rem] rounded-lg px-3 py-1.5 w-[200px] border outline-none transition-all duration-150"
                style={{
                  fontFamily: 'var(--font-b)',
                  background: 'var(--bg2)',
                  borderColor: 'var(--rule)',
                  color: 'var(--ink)',
                }}
              />
              <div className="flex gap-1">
                {(['neutral', 'positive', 'negative', 'habit'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={`text-[0.66rem] font-medium px-2 py-1 rounded-full border transition-all duration-150 ${
                      selectedCat === cat ? 'shadow-sm' : ''
                    }`}
                    style={{
                      fontFamily: 'var(--font-b)',
                      background:
                        selectedCat === cat
                          ? cat === 'neutral'
                            ? 'var(--bg)'
                            : cat === 'positive'
                            ? 'var(--green-bg)'
                            : cat === 'negative'
                            ? 'var(--red-bg)'
                            : 'var(--blue-bg)'
                          : 'var(--bg2)',
                      borderColor:
                        selectedCat === cat
                          ? cat === 'neutral'
                            ? 'rgba(30,28,24,0.28)'
                            : cat === 'positive'
                            ? 'var(--green-ln)'
                            : cat === 'negative'
                            ? 'var(--red-ln)'
                            : 'var(--blue-ln)'
                          : 'var(--rule)',
                      color:
                        selectedCat === cat
                          ? cat === 'neutral'
                            ? 'var(--ink)'
                            : cat === 'positive'
                            ? 'var(--green)'
                            : cat === 'negative'
                            ? 'var(--red)'
                            : 'var(--blue)'
                          : 'var(--ink3)',
                    }}
                  >
                    {cat === 'negative' ? 'Needs work' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
              <div className="w-px h-[18px] flex-shrink-0" style={{ background: 'var(--rule)' }} />
              <button
                onClick={addBubble}
                className="text-[0.71rem] font-medium px-3 py-1.5 rounded-md border-none transition-all duration-150 tracking-wide whitespace-nowrap hover:opacity-90"
                style={{
                  fontFamily: 'var(--font-b)',
                  background: 'var(--gold)',
                  color: '#fff',
                }}
              >
                Add →
              </button>
              <button
                onClick={clearAll}
                className="text-[0.71rem] font-medium px-3 py-1.5 rounded-md border transition-all duration-150 tracking-wide whitespace-nowrap hover:opacity-80"
                style={{
                  fontFamily: 'var(--font-b)',
                  borderColor: 'var(--rule)',
                  background: 'var(--bg)',
                  color: 'var(--ink3)',
                }}
              >
                Clear
              </button>
              <button
                onClick={() => requestViewMode('columns')}
                className="flex items-center gap-1.5 text-[0.71rem] font-medium px-3 py-1.5 rounded-md border transition-all duration-150 tracking-wide whitespace-nowrap hover:opacity-80"
                style={{
                  fontFamily: 'var(--font-b)',
                  borderColor: 'var(--rule)',
                  background: 'var(--bg)',
                  color: 'var(--ink2)',
                }}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Columns
              </button>
            </div>
          </div>
        )}

        {shouldRenderColumns && (
          <div
            className="absolute inset-0 flex flex-col overflow-hidden"
            style={{
              opacity: columnsStyle.opacity,
              transform: `translate3d(0, ${columnsStyle.translateY}px, 0)`,
              filter: `blur(${columnsStyle.blurPx}px)`,
              transition: `opacity ${transitionMs}ms ease-out, transform ${transitionMs}ms ease-out, filter ${transitionMs}ms ease-out`,
              pointerEvents: effectiveMode === 'columns' ? 'auto' : 'none',
            }}
          >
            <ColumnView
              bubbles={bubbles}
              setBubbles={setBubbles}
              logs={logs}
              onOpenNoteModal={onOpenNoteModal}
              onOpenExploreModal={onOpenExploreModal}
            />

            {/* Stats strip */}
            <div
              className="flex-shrink-0 flex items-center justify-between px-6 h-[35px] border-t text-[0.68rem] tracking-wide"
              style={{ borderColor: 'var(--rule2)', background: 'var(--bg2)', color: 'var(--ink3)' }}
            >
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--ink4)' }} />
                  Total: <span className="font-medium" style={{ color: 'var(--ink)' }}>{stats.total}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--green)' }} />
                  Positive: <span className="font-medium" style={{ color: 'var(--ink)' }}>{stats.positive}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--red)' }} />
                  Needs work: <span className="font-medium" style={{ color: 'var(--ink)' }}>{stats.negative}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--blue)' }} />
                  Habits: <span className="font-medium" style={{ color: 'var(--ink)' }}>{stats.habit}</span>
                </div>
              </div>
              <button
                onClick={() => requestViewMode('map')}
                className="flex items-center gap-1.5 text-[0.71rem] font-medium px-3 py-1 rounded-md border transition-all duration-150 tracking-wide hover:opacity-80"
                style={{
                  fontFamily: 'var(--font-b)',
                  borderColor: 'var(--rule)',
                  background: 'var(--bg)',
                  color: 'var(--ink2)',
                }}
              >
                <Network className="w-3.5 h-3.5" />
                Map View
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}