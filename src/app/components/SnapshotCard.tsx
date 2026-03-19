import { Snapshot } from '../types';
import { fmtDate } from '../utils/helpers';

interface SnapshotCardProps {
  snapshot: Snapshot;
  onDelete: (id: number) => void;
  onRestore: (id: number) => void;
}

export default function SnapshotCard({ snapshot, onDelete, onRestore }: SnapshotCardProps) {
  const positiveCount = snapshot.bubbles.filter(b => b.cat === 'positive').length;
  const negativeCount = snapshot.bubbles.filter(b => b.cat === 'negative').length;

  const getTagStyles = (cat: string) => {
    if (cat === 'positive') return { background: 'var(--green-bg)', color: 'var(--green)' };
    if (cat === 'negative') return { background: 'var(--red-bg)', color: 'var(--red)' };
    if (cat === 'habit') return { background: 'var(--blue-bg)', color: 'var(--blue)' };
    return { background: 'var(--bg2)', color: 'var(--ink3)' };
  };

  return (
    <div
      className="rounded-[10px] border p-4 relative transition-shadow duration-150 hover:shadow-md group"
      style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}
    >
      <button
        onClick={() => onDelete(snapshot.id)}
        className="absolute top-3 right-3 bg-transparent border-none text-[0.65rem] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:!text-[var(--red)]"
        style={{ color: 'var(--ink4)' }}
      >
        ✕
      </button>

      <div className="text-[0.62rem] tracking-[0.08em] uppercase mb-2" style={{ color: 'var(--ink4)' }}>
        {fmtDate(new Date(snapshot.date))}
      </div>

      <div style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }} className="text-[0.92rem] italic mb-2">
        {snapshot.name}
      </div>

      {snapshot.note && (
        <div className="text-[0.7rem] leading-relaxed mb-2.5 italic" style={{ color: 'var(--ink3)' }}>
          "{snapshot.note}"
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-2.5">
        {snapshot.bubbles.map(b => (
          <span key={b.id} className="text-[0.62rem] px-2 py-0.5 rounded-full" style={getTagStyles(b.cat)}>
            {b.label}
          </span>
        ))}
      </div>

      <div className="flex gap-2.5 text-[0.64rem] border-t pt-2.5 items-center" style={{ color: 'var(--ink3)', borderColor: 'var(--rule2)' }}>
        <span>{snapshot.bubbles.length} items</span>
        <span style={{ color: 'var(--green)' }}>{positiveCount} positive</span>
        <span style={{ color: 'var(--red)' }}>{negativeCount} needs work</span>
        <button
          onClick={() => onRestore(snapshot.id)}
          className="text-[0.64rem] bg-transparent border-none cursor-pointer p-0 underline underline-offset-2 ml-auto hover:opacity-80"
          style={{ color: 'var(--gold)', fontFamily: 'var(--font-b)' }}
        >
          Restore →
        </button>
      </div>
    </div>
  );
}
