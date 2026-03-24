import { Bubble } from '../../types';

export type ProgressStatusFilter = 'all' | 'done' | 'missed' | 'unlogged';

interface ProgressFiltersProps {
  activeCategory: 'all' | Bubble['cat'];
  onCategoryChange: (next: 'all' | Bubble['cat']) => void;
  activeStatus: ProgressStatusFilter;
  onStatusChange: (next: ProgressStatusFilter) => void;
}

export default function ProgressFilters({
  activeCategory,
  onCategoryChange,
  activeStatus,
  onStatusChange,
}: ProgressFiltersProps) {
  const categoryOptions: Array<{ id: 'all' | Bubble['cat']; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'positive', label: 'Positive' },
    { id: 'negative', label: 'Needs work' },
    { id: 'habit', label: 'Habit' },
    { id: 'neutral', label: 'Neutral' },
  ];

  const statusOptions: Array<{ id: ProgressStatusFilter; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'done', label: 'Done' },
    { id: 'missed', label: 'Missed' },
    { id: 'unlogged', label: 'Unlogged' },
  ];

  return (
    <div className="rounded-[10px] border p-3 mb-5" style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="text-[0.62rem] tracking-[0.08em] uppercase mr-1" style={{ color: 'var(--ink4)' }}>
          Category
        </div>
        {categoryOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onCategoryChange(opt.id)}
            className="text-[0.66rem] px-2.5 py-1 rounded-full border transition-all duration-150"
            style={{
              fontFamily: 'var(--font-b)',
              background: activeCategory === opt.id ? 'var(--bg2)' : 'transparent',
              borderColor: activeCategory === opt.id ? 'rgba(30,28,24,0.22)' : 'var(--rule)',
              color: activeCategory === opt.id ? 'var(--ink)' : 'var(--ink3)',
            }}
          >
            {opt.label}
          </button>
        ))}

        <div className="w-px h-4 mx-1" style={{ background: 'var(--rule)' }} />

        <div className="text-[0.62rem] tracking-[0.08em] uppercase mr-1" style={{ color: 'var(--ink4)' }}>
          Status
        </div>
        {statusOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onStatusChange(opt.id)}
            className="text-[0.66rem] px-2.5 py-1 rounded-full border transition-all duration-150"
            style={{
              fontFamily: 'var(--font-b)',
              background: activeStatus === opt.id ? 'var(--bg2)' : 'transparent',
              borderColor: activeStatus === opt.id ? 'rgba(30,28,24,0.22)' : 'var(--rule)',
              color: activeStatus === opt.id ? 'var(--ink)' : 'var(--ink3)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

