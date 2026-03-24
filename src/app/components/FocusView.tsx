import { Bubble, FocusSprint } from '../types';

interface FocusViewProps {
  bubbles: Bubble[];
  setBubbles: (bubbles: Bubble[]) => void;
  focusSprint: FocusSprint | null;
  setFocusSprint: (sprint: FocusSprint | null) => void;
}

const MAX_NOW = 3;

export default function FocusView({ bubbles, setBubbles, focusSprint, setFocusSprint }: FocusViewProps) {
  const nowItems = bubbles.filter((b) => (b.priorityLane ?? 'later') === 'now');
  const nextItems = bubbles.filter((b) => (b.priorityLane ?? 'later') === 'next');
  const laterItems = bubbles.filter((b) => (b.priorityLane ?? 'later') === 'later');

  const daysLeft = focusSprint
    ? Math.max(
        0,
        Math.ceil((new Date(focusSprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      )
    : 0;

  const moveBubbleToLane = (bubbleId: number, lane: 'now' | 'next' | 'later') => {
    const bubble = bubbles.find((b) => b.id === bubbleId);
    if (!bubble) return;
    if (lane === 'now' && (bubble.priorityLane ?? 'later') !== 'now' && nowItems.length >= MAX_NOW) {
      window.alert('Focus limit reached: keep at most 3 items in Now.');
      return;
    }
    setBubbles(bubbles.map((b) => (b.id === bubbleId ? { ...b, priorityLane: lane } : b)));
  };

  const startSprint = (days: 7 | 14 | 30) => {
    if (nowItems.length === 0) {
      window.alert('Select at least one Now item first.');
      return;
    }
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + days);
    setFocusSprint({
      id: Date.now(),
      name: `${days}-day focus sprint`,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      active: true,
      goalNote: '',
    });
  };

  const endSprint = () => {
    if (!focusSprint) return;
    if (!window.confirm('End current sprint?')) return;
    setFocusSprint({ ...focusSprint, active: false });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-7 pb-12">
        <div className="max-w-[1080px] mx-auto">
          <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
            <div>
              <div style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }} className="text-[1.3rem] italic">
                Focus
              </div>
              <div className="text-[0.72rem] leading-relaxed mt-1" style={{ color: 'var(--ink3)' }}>
                Work on a small number of priorities to make real progress.
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!focusSprint || !focusSprint.active ? (
                <>
                  <button
                    onClick={() => startSprint(7)}
                    className="text-[0.7rem] px-3 py-1.5 rounded-md border transition-all duration-150 hover:opacity-85"
                    style={{ borderColor: 'var(--rule)', background: 'var(--bg)', color: 'var(--ink2)' }}
                  >
                    Start 7d
                  </button>
                  <button
                    onClick={() => startSprint(14)}
                    className="text-[0.7rem] px-3 py-1.5 rounded-md border transition-all duration-150 hover:opacity-85"
                    style={{ borderColor: 'var(--rule)', background: 'var(--bg)', color: 'var(--ink2)' }}
                  >
                    Start 14d
                  </button>
                  <button
                    onClick={() => startSprint(30)}
                    className="text-[0.7rem] px-3 py-1.5 rounded-md border-none transition-all duration-150 hover:opacity-90"
                    style={{ background: 'var(--gold)', color: '#fff' }}
                  >
                    Start 30d
                  </button>
                </>
              ) : (
                <>
                  <span className="text-[0.72rem] px-2.5 py-1 rounded-full" style={{ background: 'var(--gold-bg)', color: 'var(--gold)' }}>
                    Sprint active · {daysLeft}d left
                  </span>
                  <button
                    onClick={endSprint}
                    className="text-[0.7rem] px-3 py-1.5 rounded-md border transition-all duration-150 hover:opacity-85"
                    style={{ borderColor: 'var(--rule)', background: 'var(--bg)', color: 'var(--ink3)' }}
                  >
                    End sprint
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <LaneColumn
              title={`Now (${nowItems.length}/${MAX_NOW})`}
              subtitle="Active priorities"
              bubbles={nowItems}
              lane="now"
              onMove={moveBubbleToLane}
            />
            <LaneColumn
              title={`Next (${nextItems.length})`}
              subtitle="Queued items"
              bubbles={nextItems}
              lane="next"
              onMove={moveBubbleToLane}
            />
            <LaneColumn
              title={`Later (${laterItems.length})`}
              subtitle="Parked backlog"
              bubbles={laterItems}
              lane="later"
              onMove={moveBubbleToLane}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LaneColumn({
  title,
  subtitle,
  bubbles,
  lane,
  onMove,
}: {
  title: string;
  subtitle: string;
  bubbles: Bubble[];
  lane: 'now' | 'next' | 'later';
  onMove: (id: number, lane: 'now' | 'next' | 'later') => void;
}) {
  const cardStyle = { background: 'var(--bg)', borderColor: 'var(--rule)' };
  return (
    <div className="rounded-[10px] border p-3 min-h-[260px]" style={cardStyle}>
      <div className="mb-2">
        <div style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }} className="text-[0.96rem] italic">
          {title}
        </div>
        <div className="text-[0.66rem]" style={{ color: 'var(--ink4)' }}>{subtitle}</div>
      </div>

      <div className="space-y-2">
        {bubbles.length === 0 ? (
          <div className="text-[0.68rem] italic py-4" style={{ color: 'var(--ink4)' }}>
            No items
          </div>
        ) : (
          bubbles.map((b) => (
            <div key={b.id} className="rounded-md border p-2" style={{ borderColor: 'var(--rule2)', background: 'var(--bg2)' }}>
              <div className="text-[0.76rem] font-medium" style={{ color: 'var(--ink)' }}>{b.label}</div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {(['now', 'next', 'later'] as const).filter((x) => x !== lane).map((target) => (
                  <button
                    key={target}
                    onClick={() => onMove(b.id, target)}
                    className="text-[0.62rem] px-2 py-0.5 rounded-full border transition-all duration-150 hover:opacity-85"
                    style={{ borderColor: 'var(--rule)', background: 'var(--bg)', color: 'var(--ink3)' }}
                  >
                    Move to {target}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

