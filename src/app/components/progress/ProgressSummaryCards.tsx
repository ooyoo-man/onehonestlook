interface ProgressSummaryCardsProps {
  rate7: number;
  rate30: number;
  rate90: number;
  currentStreak: number;
  longestStreak: number;
}

interface CardProps {
  label: string;
  value: string;
  tone?: 'default' | 'positive';
}

function Card({ label, value, tone = 'default' }: CardProps) {
  return (
    <div
      className="rounded-[10px] border p-3"
      style={{
        background: 'var(--bg)',
        borderColor: 'var(--rule)',
      }}
    >
      <div className="text-[0.62rem] tracking-[0.08em] uppercase" style={{ color: 'var(--ink4)' }}>
        {label}
      </div>
      <div
        className="text-[0.95rem] mt-1"
        style={{
          color: tone === 'positive' ? 'var(--green)' : 'var(--ink)',
          fontFamily: 'var(--font-h)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function ProgressSummaryCards({
  rate7,
  rate30,
  rate90,
  currentStreak,
  longestStreak,
}: ProgressSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-5">
      <Card label="7-day" value={`${rate7}%`} />
      <Card label="30-day" value={`${rate30}%`} />
      <Card label="90-day" value={`${rate90}%`} />
      <Card label="Current streak" value={`${currentStreak}d`} tone="positive" />
      <Card label="Longest streak" value={`${longestStreak}d`} />
    </div>
  );
}

