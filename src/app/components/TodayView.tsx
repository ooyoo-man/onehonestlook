import { useEffect, useState } from 'react';
import { Bubble, DayReflection, Log } from '../types';
import { fmtDate, logKey, todayStr } from '../utils/helpers';

interface TodayViewProps {
  bubbles: Bubble[];
  logs: Record<string, Log>;
  onBulkSetYN: (bubbleId: number, dateStrs: string[], yn: 'yes' | 'no' | null) => void;
  onOpenNoteModal: (bubbleId: number, dateStr: string) => void;
  onGoToFocus: () => void;
  onOpenInMap: (bubbleId: number) => void;
  onDeferBubble: (bubbleId: number, lane: 'next' | 'later') => void;
  todayReflection?: DayReflection;
  onSaveDayReflection: (whyMediocre: string, selfForgiveness: string) => void;
}

const MAX_NOW = 3;

export default function TodayView({
  bubbles,
  logs,
  onBulkSetYN,
  onOpenNoteModal,
  onGoToFocus,
  onOpenInMap,
  onDeferBubble,
  todayReflection,
  onSaveDayReflection,
}: TodayViewProps) {
  const todayISO = todayStr();
  const todayDate = new Date(todayISO + 'T12:00:00');

  const [whyMediocre, setWhyMediocre] = useState('');
  const [selfForgiveness, setSelfForgiveness] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [reflectionOpen, setReflectionOpen] = useState(false);

  useEffect(() => {
    setWhyMediocre(todayReflection?.whyMediocre ?? '');
    setSelfForgiveness(todayReflection?.selfForgiveness ?? '');
  }, [todayISO, todayReflection?.updatedAt]);

  useEffect(() => {
    setReflectionOpen(false);
  }, [todayISO]);

  const nowItems = bubbles.filter((b) => (b.priorityLane ?? 'later') === 'now');
  const dueItems = nowItems.filter((b) => {
    const entry = logs[logKey(b.id, todayISO)];
    return !entry || entry.yn === null;
  });

  const handleSaveReflection = () => {
    onSaveDayReflection(whyMediocre.trim(), selfForgiveness.trim());
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2400);
  };

  const hasReflectionText = whyMediocre.trim().length > 0 || selfForgiveness.trim().length > 0;
  const hasPersistedReflection =
    !!(todayReflection?.whyMediocre?.trim() || todayReflection?.selfForgiveness?.trim());

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-7 pb-12">
        <div className="max-w-[860px] mx-auto">
          <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
            <div>
              <div style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }} className="text-[1.3rem] italic">
                Today
              </div>
              <div className="text-[0.72rem] leading-relaxed mt-1" style={{ color: 'var(--ink3)' }}>
                {fmtDate(todayDate)} · Log your Now priorities
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={onGoToFocus}
                className="text-[0.66rem] underline underline-offset-2 hover:opacity-80"
                style={{ color: 'var(--gold)', fontFamily: 'var(--font-b)' }}
              >
                Edit focus →
              </button>
              <div className="text-[0.68rem]" style={{ color: 'var(--ink3)' }}>
                Now lane: <strong style={{ color: 'var(--ink)' }}>{nowItems.length}</strong>/{MAX_NOW}
              </div>
            </div>
          </div>

          <div className="mb-8">
            {!reflectionOpen ? (
              <div
                className="rounded-[10px] border px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                style={{ background: 'var(--bg2)', borderColor: 'var(--rule)' }}
              >
                <div className="min-w-0">
                  <div className="text-[0.72rem] font-medium" style={{ color: 'var(--ink2)', fontFamily: 'var(--font-b)' }}>
                    Today feels mediocre or heavy?
                  </div>
                  <p className="text-[0.65rem] leading-relaxed mt-1" style={{ color: 'var(--ink4)' }}>
                    Optional private check-in—only if you need it. Doesn&apos;t affect your map or streaks.
                    {hasPersistedReflection ? (
                      <span className="block mt-1" style={{ color: 'var(--ink3)' }}>
                        You have a saved reflection for today.
                      </span>
                    ) : null}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setReflectionOpen(true)}
                  className="text-[0.72rem] font-medium px-3.5 py-2 rounded-md border transition-all duration-150 hover:opacity-90 flex-shrink-0 self-start sm:self-center"
                  style={{
                    fontFamily: 'var(--font-b)',
                    background: 'var(--bg)',
                    borderColor: 'rgba(30,28,24,0.22)',
                    color: 'var(--ink)',
                  }}
                >
                  {hasPersistedReflection ? 'Open reflection' : 'Write something'}
                </button>
              </div>
            ) : (
              <div
                className="rounded-[10px] border p-4"
                style={{ background: 'var(--bg2)', borderColor: 'var(--rule)' }}
              >
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="text-[0.72rem] font-medium" style={{ color: 'var(--ink2)', fontFamily: 'var(--font-b)' }}>
                    If today feels mediocre
                  </div>
                  <button
                    type="button"
                    onClick={() => setReflectionOpen(false)}
                    className="text-[0.66rem] underline underline-offset-2 hover:opacity-80 bg-transparent border-0 cursor-pointer p-0"
                    style={{ color: 'var(--ink4)', fontFamily: 'var(--font-b)' }}
                  >
                    Hide
                  </button>
                </div>
                <p className="text-[0.7rem] leading-[1.75] mb-4" style={{ color: 'var(--ink3)' }}>
                  A single day does not define you. What moves habits and goals forward is usually the quiet accumulation of
                  many days—showing up, adjusting, and trying again. Naming a hard day is honest; it does not cancel the
                  pattern you have been building.
                </p>

                <label className="block text-[0.62rem] tracking-[0.08em] uppercase mb-1.5" style={{ color: 'var(--ink4)' }}>
                  Why does today feel &ldquo;meh&rdquo; or heavy? (private)
                </label>
                <textarea
                  value={whyMediocre}
                  onChange={(e) => setWhyMediocre(e.target.value)}
                  rows={3}
                  placeholder="Tired, distracted, old story lines, something specific…"
                  className="w-full text-[0.72rem] px-3 py-2 rounded-md border outline-none resize-y mb-4"
                  style={{
                    borderColor: 'var(--rule)',
                    background: 'var(--bg)',
                    color: 'var(--ink2)',
                    fontFamily: 'var(--font-b)',
                  }}
                />

                <label className="block text-[0.62rem] tracking-[0.08em] uppercase mb-1.5" style={{ color: 'var(--ink4)' }}>
                  What do you want to forgive yourself for—or offer yourself—today?
                </label>
                <textarea
                  value={selfForgiveness}
                  onChange={(e) => setSelfForgiveness(e.target.value)}
                  rows={3}
                  placeholder="A sentence of compassion, permission to be human, or what you’ll try tomorrow instead…"
                  className="w-full text-[0.72rem] px-3 py-2 rounded-md border outline-none resize-y mb-3"
                  style={{
                    borderColor: 'var(--rule)',
                    background: 'var(--bg)',
                    color: 'var(--ink2)',
                    fontFamily: 'var(--font-b)',
                  }}
                />

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSaveReflection}
                    className="text-[0.72rem] font-medium px-3 py-1.5 rounded-md border transition-all duration-150 hover:opacity-90"
                    style={{
                      fontFamily: 'var(--font-b)',
                      background: 'var(--bg)',
                      borderColor: 'rgba(30,28,24,0.22)',
                      color: 'var(--ink)',
                    }}
                  >
                    Save today&apos;s reflection
                  </button>
                  {justSaved && (
                    <span className="text-[0.65rem]" style={{ color: 'var(--green)' }}>
                      Saved for this day
                    </span>
                  )}
                  {!justSaved && todayReflection?.updatedAt && (
                    <span className="text-[0.62rem]" style={{ color: 'var(--ink4)' }}>
                      Last saved{' '}
                      {new Date(todayReflection.updatedAt).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                {!hasReflectionText && (
                  <p className="text-[0.62rem] mt-3 leading-relaxed" style={{ color: 'var(--ink4)' }}>
                    Nothing here is required. When you&apos;re done, use Hide above to tuck this away.
                  </p>
                )}
              </div>
            )}
          </div>

          {dueItems.length === 0 ? (
            <div className="text-center py-10" style={{ color: 'var(--ink3)' }}>
              <div style={{ fontFamily: 'var(--font-h)', color: 'var(--ink4)' }} className="text-[1.6rem] italic block mb-3">
                —
              </div>
              <p className="text-[0.78rem] leading-[1.9]">
                Nothing to log today.
                <br />
                Move items into <strong>Now</strong> in the Focus tab to see them here.
              </p>
              <div className="mt-5 flex items-center justify-center">
                <button
                  type="button"
                  onClick={onGoToFocus}
                  className="text-[0.74rem] font-medium px-3.5 py-2 rounded-md border transition-all duration-150 hover:opacity-90"
                  style={{
                    fontFamily: 'var(--font-b)',
                    background: 'var(--bg)',
                    borderColor: 'rgba(30,28,24,0.22)',
                    color: 'var(--ink)',
                  }}
                >
                  Pick your Now for today →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {dueItems.map((b) => {
                const badgeBg =
                  b.cat === 'positive'
                    ? 'var(--green-bg)'
                    : b.cat === 'negative'
                    ? 'var(--red-bg)'
                    : 'var(--bg2)';
                const badgeColor =
                  b.cat === 'positive'
                    ? 'var(--green)'
                    : b.cat === 'negative'
                    ? 'var(--red)'
                    : 'var(--ink3)';

                return (
                  <div
                    key={b.id}
                    className="rounded-[10px] border p-3"
                    style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <div className="text-[0.88rem] font-medium" style={{ color: 'var(--ink)' }}>
                          {b.label}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className="text-[0.62rem] px-2 py-0.5 rounded-full"
                            style={{ background: badgeBg, color: badgeColor, border: '1px solid var(--rule)' }}
                          >
                            {b.cat === 'negative' ? 'Needs work' : b.cat === 'positive' ? 'Positive' : 'Neutral'}
                          </span>
                          <span className="text-[0.62rem]" style={{ color: 'var(--ink4)' }}>
                            Needs logging
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onBulkSetYN(b.id, [todayISO], 'yes')}
                          className="text-[0.72rem] font-medium px-3 py-1.5 rounded-md border-none transition-all duration-150 hover:opacity-90"
                          style={{ background: 'var(--green-bg)', color: 'var(--green)' }}
                        >
                          ✓ Yes
                        </button>
                        <button
                          onClick={() => onBulkSetYN(b.id, [todayISO], 'no')}
                          className="text-[0.72rem] font-medium px-3 py-1.5 rounded-md border-none transition-all duration-150 hover:opacity-90"
                          style={{ background: 'var(--red-bg)', color: 'var(--red)' }}
                        >
                          ✕ No
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => onOpenNoteModal(b.id, todayISO)}
                          className="text-[0.66rem] underline underline-offset-2 hover:opacity-80"
                          style={{ color: 'var(--gold)', fontFamily: 'var(--font-b)' }}
                        >
                          Add / edit note →
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenInMap(b.id)}
                          className="text-[0.66rem] underline underline-offset-2 hover:opacity-80"
                          style={{ color: 'var(--ink3)', fontFamily: 'var(--font-b)' }}
                          title="Open this item in the Map view"
                        >
                          Open in Map →
                        </button>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[0.62rem]" style={{ color: 'var(--ink4)' }}>
                            Defer:
                          </span>
                          <button
                            type="button"
                            onClick={() => onDeferBubble(b.id, 'next')}
                            className="text-[0.64rem] px-2 py-1 rounded-full border transition-all duration-150 hover:opacity-85"
                            style={{ borderColor: 'var(--rule)', background: 'var(--bg)', color: 'var(--ink3)', fontFamily: 'var(--font-b)' }}
                            title="Move this item to Next"
                          >
                            Next
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeferBubble(b.id, 'later')}
                            className="text-[0.64rem] px-2 py-1 rounded-full border transition-all duration-150 hover:opacity-85"
                            style={{ borderColor: 'var(--rule)', background: 'var(--bg)', color: 'var(--ink3)', fontFamily: 'var(--font-b)' }}
                            title="Move this item to Later"
                          >
                            Later
                          </button>
                        </div>
                      </div>
                      <span className="text-[0.62rem]" style={{ color: 'var(--ink4)' }}>
                        {b.priorityLane ? `Priority: ${b.priorityLane}` : 'Priority: later'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
