import { Bubble, Log } from '../types';
import { todayStr, logKey, mkDate } from '../utils/helpers';

interface TrackerBlockProps {
  bubble: Bubble;
  viewMonth: { y: number; m: number };
  logs: Record<string, Log>;
  onOpenNoteModal: (bubbleId: number, dateStr: string) => void;
}

export default function TrackerBlock({ bubble, viewMonth, logs, onOpenNoteModal }: TrackerBlockProps) {
  const { y, m } = viewMonth;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const todayISO = todayStr();

  // Calculate stats
  let yesCount = 0;
  let noCount = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = mkDate(y, m, d);
    const log = logs[logKey(bubble.id, dateStr)];
    if (log?.yn === 'yes') yesCount++;
    else if (log?.yn === 'no') noCount++;
  }

  const logged = yesCount + noCount;
  const percentage = logged ? Math.round((yesCount / logged) * 100) : 0;
  const barColor = percentage >= 60 ? 'var(--green)' : percentage >= 30 ? 'var(--gold)' : 'var(--red)';

  // Get notes for the month
  const monthNotes: Array<{ ds: string; yn: 'yes' | 'no' | null; note: string }> = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = mkDate(y, m, d);
    const log = logs[logKey(bubble.id, ds)];
    if (log?.yn || log?.note) {
      monthNotes.push({ ds, yn: log.yn, note: log.note });
    }
  }

  const getCatStyles = () => {
    if (bubble.cat === 'positive') return { background: 'var(--green-bg)', color: 'var(--green)' };
    if (bubble.cat === 'negative') return { background: 'var(--red-bg)', color: 'var(--red)' };
    if (bubble.cat === 'habit') return { background: 'var(--blue-bg)', color: 'var(--blue)' };
    return { background: 'var(--bg2)', color: 'var(--ink3)' };
  };

  return (
    <div className="mb-9 pb-9 border-b last:border-b-0" style={{ borderColor: 'var(--rule2)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[0.82rem] font-medium" style={{ color: 'var(--ink)' }}>
          {bubble.label}
        </span>
        <span className="text-[0.62rem] px-2 py-0.5 rounded-full" style={getCatStyles()}>
          {bubble.cat}
        </span>
        <span className="text-[0.68rem] ml-auto" style={{ color: 'var(--ink3)' }}>
          <strong style={{ color: 'var(--ink)' }}>{yesCount}</strong>/{logged} logged &nbsp;·&nbsp; {percentage}% yes
        </span>
      </div>

      {/* Day grid */}
      <div className="flex flex-wrap gap-[3px] mb-2.5">
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dateStr = mkDate(y, m, day);
          const log = logs[logKey(bubble.id, dateStr)];
          const isFuture = dateStr > todayISO;
          const isToday = dateStr === todayISO;

          return (
            <div
              key={day}
              onClick={() => !isFuture && onOpenNoteModal(bubble.id, dateStr)}
              className={`w-[30px] h-[30px] rounded-[5px] border flex flex-col items-center justify-center transition-all duration-150 flex-shrink-0 relative ${
                isFuture ? 'opacity-30 cursor-default pointer-events-none' : 'cursor-pointer hover:opacity-80'
              } ${isToday ? 'outline outline-[1.5px] outline-offset-1' : ''}`}
              style={{
                borderColor: log?.yn === 'yes' ? 'var(--green-ln)' : log?.yn === 'no' ? 'var(--red-ln)' : 'var(--rule)',
                background: log?.yn === 'yes' ? 'var(--green-bg)' : log?.yn === 'no' ? 'var(--red-bg)' : 'var(--bg2)',
                outlineColor: isToday ? 'var(--gold-lt)' : undefined,
              }}
            >
              <span className="text-[0.54rem] leading-none" style={{ color: 'var(--ink4)' }}>
                {day}
              </span>
              <span className="text-[0.68rem] leading-none mt-[1px]">
                {log?.yn === 'yes' ? '✓' : log?.yn === 'no' ? '✕' : ''}
              </span>
              {log?.note && (
                <div
                  className="absolute top-[2px] right-[2px] w-[3px] h-[3px] rounded-full"
                  style={{ background: 'var(--gold)' }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2.5 mb-2">
        <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: 'var(--bg3)' }}>
          <div
            className="h-full rounded-full transition-all duration-[450ms] ease-out"
            style={{ width: `${percentage}%`, background: barColor }}
          />
        </div>
        <span className="text-[0.68rem] font-medium min-w-[30px] text-right" style={{ color: barColor }}>
          {logged ? `${percentage}%` : '—'}
        </span>
      </div>

      {/* Notes list */}
      {monthNotes.length > 0 && (
        <div className="mt-2.5">
          {monthNotes.reverse().map(note => {
            const date = new Date(note.ds + 'T12:00:00');
            return (
              <div
                key={note.ds}
                className="flex gap-2.5 py-1.5 border-b last:border-b-0 items-start"
                style={{ borderColor: 'var(--rule2)' }}
              >
                <span className="text-[0.62rem] whitespace-nowrap min-w-[68px] pt-[1px]" style={{ color: 'var(--ink4)' }}>
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-[0.72rem] leading-relaxed flex-1" style={{ color: 'var(--ink2)' }}>
                  {note.note || <em style={{ color: 'var(--ink4)' }}>No note written</em>}
                </span>
                {note.yn && (
                  <span
                    className="text-[0.63rem] font-medium whitespace-nowrap"
                    style={{ color: note.yn === 'yes' ? 'var(--green)' : 'var(--red)' }}
                  >
                    {note.yn === 'yes' ? '✓ Yes' : '✕ No'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
