import type { WeekSummaryStats } from '../../utils/streakMetrics';

interface WeeklySummaryCardProps {
  stats: WeekSummaryStats;
}

export default function WeeklySummaryCard({ stats }: WeeklySummaryCardProps) {
  const pct =
    stats.totalDays > 0 ? Math.round((stats.completedDays / stats.totalDays) * 100) : 0;

  return (
    <div
      className="rounded-[10px] border p-4 mb-5"
      style={{
        background: 'linear-gradient(180deg, var(--bg) 0%, rgba(202,166,67,0.06) 100%)',
        borderColor: 'rgba(202,166,67,0.35)',
      }}
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div
            className="text-[0.62rem] tracking-[0.12em] uppercase mb-1"
            style={{ color: 'var(--gold)', fontFamily: 'var(--font-b)' }}
          >
            Sunday check-in
          </div>
          <div style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }} className="text-[1.05rem] italic">
            Weekly recap
          </div>
          <div className="text-[0.72rem] mt-1" style={{ color: 'var(--ink4)' }}>
            {stats.rangeLabel}
          </div>
        </div>
        <div
          className="rounded-lg border px-3 py-2 text-center min-w-[72px]"
          style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}
        >
          <div className="text-[0.58rem] uppercase tracking-wide" style={{ color: 'var(--ink4)' }}>
            Week %
          </div>
          <div
            className="text-[1.25rem] font-semibold tabular-nums"
            style={{ fontFamily: 'var(--font-b)', color: 'var(--ink)' }}
          >
            {pct}%
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[0.72rem]" style={{ color: 'var(--ink3)' }}>
        <div className="rounded-md border p-2.5" style={{ borderColor: 'var(--rule2)', background: 'var(--bg2)' }}>
          <div className="text-[0.6rem] uppercase tracking-wide mb-0.5" style={{ color: 'var(--ink4)' }}>
            Active days
          </div>
          <div className="font-medium" style={{ color: 'var(--ink)' }}>
            {stats.completedDays} / {stats.totalDays}
          </div>
          <div className="text-[0.65rem] mt-0.5">Days with at least one habit done</div>
        </div>
        <div className="rounded-md border p-2.5" style={{ borderColor: 'var(--rule2)', background: 'var(--bg2)' }}>
          <div className="text-[0.6rem] uppercase tracking-wide mb-0.5" style={{ color: 'var(--ink4)' }}>
            Longest run
          </div>
          <div className="font-medium" style={{ color: 'var(--ink)' }}>
            {stats.bestStreakInWeek} {stats.bestStreakInWeek === 1 ? 'day' : 'days'}
          </div>
          <div className="text-[0.65rem] mt-0.5">Best back-to-back streak this week</div>
        </div>
        <div className="rounded-md border p-2.5" style={{ borderColor: 'var(--rule2)', background: 'var(--bg2)' }}>
          <div className="text-[0.6rem] uppercase tracking-wide mb-0.5" style={{ color: 'var(--ink4)' }}>
            Tip
          </div>
          <div className="leading-snug">
            {stats.completedDays >= 5
              ? 'Solid week. Protect one anchor day next week.'
              : 'Pick one habit to protect next week—even a small win counts.'}
          </div>
        </div>
      </div>
    </div>
  );
}
