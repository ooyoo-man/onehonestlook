interface TrendPoint {
  date: string;
  day: number;
  ratio: number | null;
  isFuture: boolean;
  isSelected: boolean;
}

interface ProgressTrendLineProps {
  monthLabel: string;
  points: TrendPoint[];
  onSelectDate: (date: string) => void;
}

export default function ProgressTrendLine({ monthLabel, points, onSelectDate }: ProgressTrendLineProps) {
  const width = 760;
  const height = 180;
  const paddingX = 24;
  const paddingY = 24;
  const usableW = width - paddingX * 2;
  const usableH = height - paddingY * 2;

  const valid = points.filter((p) => p.ratio !== null && !p.isFuture);
  const path = valid
    .map((p, idx) => {
      const x = paddingX + ((p.day - 1) / Math.max(points.length - 1, 1)) * usableW;
      const y = paddingY + (1 - (p.ratio as number)) * usableH;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="rounded-[10px] border p-3 mb-5" style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[0.62rem] tracking-[0.08em] uppercase" style={{ color: 'var(--ink4)' }}>
          Trend line
        </div>
        <div className="text-[0.68rem]" style={{ color: 'var(--ink3)' }}>
          {monthLabel}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[640px]">
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="var(--rule2)" strokeWidth="1" />
          <line x1={paddingX} y1={paddingY + usableH / 2} x2={width - paddingX} y2={paddingY + usableH / 2} stroke="var(--rule2)" strokeWidth="1" />
          <line x1={paddingX} y1={paddingY + usableH} x2={width - paddingX} y2={paddingY + usableH} stroke="var(--rule2)" strokeWidth="1" />

          {path && (
            <path d={path} fill="none" stroke="var(--gold)" strokeWidth="2.2" strokeLinecap="round" />
          )}

          {points.map((p) => {
            const x = paddingX + ((p.day - 1) / Math.max(points.length - 1, 1)) * usableW;
            const y =
              p.ratio === null ? paddingY + usableH : paddingY + (1 - p.ratio) * usableH;
            const canSelect = !p.isFuture;

            return (
              <g key={p.date}>
                <circle
                  cx={x}
                  cy={y}
                  r={p.isSelected ? 4 : 2.8}
                  fill={p.ratio === null ? 'var(--ink4)' : 'var(--gold)'}
                  opacity={p.isFuture ? 0.25 : 0.95}
                  style={{ cursor: canSelect ? 'pointer' : 'default' }}
                  onClick={() => canSelect && onSelectDate(p.date)}
                />
                {p.day % 5 === 0 || p.day === 1 || p.day === points.length ? (
                  <text
                    x={x}
                    y={height - 6}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--ink4)"
                  >
                    {p.day}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

