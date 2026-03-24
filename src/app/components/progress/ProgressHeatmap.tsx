interface HeatmapCell {
  date: string;
  day: number;
  ratio: number | null;
  isFuture: boolean;
  isSelected: boolean;
}

interface ProgressHeatmapProps {
  monthLabel: string;
  cells: HeatmapCell[];
  onSelectDate: (date: string) => void;
}

function getCellBg(ratio: number | null, isFuture: boolean) {
  if (isFuture) return 'var(--bg2)';
  if (ratio === null) return 'var(--bg3)';
  if (ratio >= 0.75) return 'var(--green)';
  if (ratio >= 0.4) return 'rgba(46,102,69,0.5)';
  if (ratio > 0) return 'rgba(46,102,69,0.22)';
  return 'var(--red-bg)';
}

export default function ProgressHeatmap({ monthLabel, cells, onSelectDate }: ProgressHeatmapProps) {
  return (
    <div className="rounded-[10px] border p-3 mb-5" style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[0.62rem] tracking-[0.08em] uppercase" style={{ color: 'var(--ink4)' }}>
          Heatmap
        </div>
        <div className="text-[0.68rem]" style={{ color: 'var(--ink3)' }}>
          {monthLabel}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-[4px]">
        {cells.map((cell) => (
          <button
            key={cell.date}
            onClick={() => !cell.isFuture && onSelectDate(cell.date)}
            className={`h-[28px] rounded-[5px] border text-[0.58rem] transition-all duration-150 ${
              cell.isFuture ? 'opacity-40 cursor-default' : 'cursor-pointer hover:opacity-85'
            }`}
            style={{
              borderColor: cell.isSelected ? 'var(--gold-lt)' : 'var(--rule)',
              background: getCellBg(cell.ratio, cell.isFuture),
              color: cell.ratio !== null && cell.ratio >= 0.75 ? '#fff' : 'var(--ink2)',
              outline: cell.isSelected ? '1px solid var(--gold-lt)' : 'none',
              outlineOffset: '1px',
            }}
            title={cell.date}
            disabled={cell.isFuture}
          >
            {cell.day}
          </button>
        ))}
      </div>
    </div>
  );
}

