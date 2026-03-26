import { Flame } from 'lucide-react';

interface StreakBadgeProps {
  days: number;
  className?: string;
}

export default function StreakBadge({ days, className = '' }: StreakBadgeProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(202,166,67,0.12) 0%, rgba(190,120,50,0.08) 100%)',
        borderColor: 'rgba(202,166,67,0.45)',
        boxShadow: '0 1px 3px rgba(30,28,24,0.06)',
      }}
      title="Current daily streak: days in a row with at least one habit marked done"
    >
      <Flame
        className="w-[1.15rem] h-[1.15rem] flex-shrink-0"
        style={{ color: 'var(--gold)', fill: 'rgba(202,166,67,0.35)' }}
        strokeWidth={1.75}
        aria-hidden
      />
      <div className="flex flex-col leading-none">
        <span className="text-[0.58rem] tracking-[0.1em] uppercase" style={{ color: 'var(--ink4)' }}>
          Streak
        </span>
        <span
          className="text-[1.05rem] font-semibold tabular-nums mt-0.5"
          style={{ fontFamily: 'var(--font-b)', color: 'var(--ink)' }}
        >
          {days}
          <span className="text-[0.72rem] font-medium ml-1" style={{ color: 'var(--ink3)' }}>
            {days === 1 ? 'day' : 'days'}
          </span>
        </span>
      </div>
    </div>
  );
}
