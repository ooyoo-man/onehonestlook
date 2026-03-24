import { useMemo, useState } from 'react';
import { ArchiveSettings, Snapshot } from '../types';
import SnapshotCard from './SnapshotCard';

interface ArchiveViewProps {
  snapshots: Snapshot[];
  setSnapshots: (snapshots: Snapshot[]) => void;
  setBubbles: (bubbles: Snapshot['bubbles']) => void;
  archiveSettings: ArchiveSettings;
  setArchiveSettings: (settings: ArchiveSettings) => void;
}

export default function ArchiveView({
  snapshots,
  setSnapshots,
  setBubbles,
  archiveSettings,
  setArchiveSettings,
}: ArchiveViewProps) {
  const [activeYear, setActiveYear] = useState<number | 'all'>('all');
  const [activeSource, setActiveSource] = useState<'all' | 'manual' | 'auto'>('all');

  const years = useMemo(() => {
    const unique = Array.from(new Set(snapshots.map(s => new Date(s.date).getFullYear())));
    return unique.sort((a, b) => b - a);
  }, [snapshots]);

  const visibleSnapshots = useMemo(() => {
    return snapshots.filter(s => {
      const byYear = activeYear === 'all' || new Date(s.date).getFullYear() === activeYear;
      const source = s.source ?? 'manual';
      const bySource = activeSource === 'all' || source === activeSource;
      return byYear && bySource;
    });
  }, [activeYear, activeSource, snapshots]);

  const groupedByYear = useMemo(() => {
    const grouped = new Map<number, Snapshot[]>();
    for (const s of visibleSnapshots) {
      const y = new Date(s.date).getFullYear();
      const arr = grouped.get(y) ?? [];
      arr.push(s);
      grouped.set(y, arr);
    }
    return Array.from(grouped.entries()).sort((a, b) => b[0] - a[0]);
  }, [visibleSnapshots]);

  const lastAutoSnapshot = useMemo(() => {
    const autos = snapshots
      .filter(s => (s.source ?? 'manual') === 'auto')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return autos[0] ?? null;
  }, [snapshots]);

  const deleteSnapshot = (id: number) => {
    if (window.confirm('Delete this archive entry?')) {
      setSnapshots(snapshots.filter(s => s.id !== id));
    }
  };

  const restoreSnapshot = (id: number) => {
    const snap = snapshots.find(s => s.id === id);
    if (!snap || !window.confirm(`Restore "${snap.name}"? Your current map will be replaced.`)) return;
    setBubbles(JSON.parse(JSON.stringify(snap.bubbles)));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-7 pb-12">
        <div className="max-w-[980px] mx-auto">
          <div className="mb-6">
            <div style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }} className="text-[1.3rem] italic">
              Archive
            </div>
            <div className="text-[0.72rem] leading-relaxed mt-1" style={{ color: 'var(--ink3)' }}>
              Long-term history of your map and habits over the years.
            </div>
          </div>

          <div className="rounded-[10px] border p-4 mb-6" style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}>
            <div className="text-[0.65rem] font-medium tracking-[0.12em] uppercase mb-3" style={{ color: 'var(--ink3)' }}>
              Auto Archive Settings
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  setArchiveSettings({
                    ...archiveSettings,
                    autoArchiveEnabled: !archiveSettings.autoArchiveEnabled,
                  })
                }
                className="text-[0.7rem] px-3 py-1.5 rounded-md border transition-all duration-150"
                style={{
                  fontFamily: 'var(--font-b)',
                  background: archiveSettings.autoArchiveEnabled ? 'var(--bg)' : 'var(--bg2)',
                  borderColor: archiveSettings.autoArchiveEnabled ? 'rgba(30,28,24,0.24)' : 'var(--rule)',
                  color: archiveSettings.autoArchiveEnabled ? 'var(--ink)' : 'var(--ink3)',
                }}
              >
                Auto archive: {archiveSettings.autoArchiveEnabled ? 'On' : 'Off'}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setArchiveSettings({ ...archiveSettings, cadence: 'monthly' })}
                  className="text-[0.68rem] px-3 py-1 rounded-full border transition-all duration-150"
                  style={{
                    fontFamily: 'var(--font-b)',
                    background: archiveSettings.cadence === 'monthly' ? 'var(--bg)' : 'var(--bg2)',
                    borderColor: archiveSettings.cadence === 'monthly' ? 'rgba(30,28,24,0.22)' : 'var(--rule)',
                    color: archiveSettings.cadence === 'monthly' ? 'var(--ink)' : 'var(--ink3)',
                  }}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setArchiveSettings({ ...archiveSettings, cadence: 'weekly' })}
                  className="text-[0.68rem] px-3 py-1 rounded-full border transition-all duration-150"
                  style={{
                    fontFamily: 'var(--font-b)',
                    background: archiveSettings.cadence === 'weekly' ? 'var(--bg)' : 'var(--bg2)',
                    borderColor: archiveSettings.cadence === 'weekly' ? 'rgba(30,28,24,0.22)' : 'var(--rule)',
                    color: archiveSettings.cadence === 'weekly' ? 'var(--ink)' : 'var(--ink3)',
                  }}
                >
                  Weekly
                </button>
              </div>
            </div>
            <div className="mt-3 text-[0.68rem]" style={{ color: 'var(--ink3)' }}>
              Last auto-archive:{' '}
              <span style={{ color: 'var(--ink2)' }}>
                {lastAutoSnapshot
                  ? new Date(lastAutoSnapshot.date).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })
                  : 'None yet'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button
              onClick={() => setActiveYear('all')}
              className="text-[0.68rem] px-3 py-1 rounded-full border transition-all duration-150"
              style={{
                fontFamily: 'var(--font-b)',
                background: activeYear === 'all' ? 'var(--bg)' : 'var(--bg2)',
                borderColor: activeYear === 'all' ? 'rgba(30,28,24,0.22)' : 'var(--rule)',
                color: activeYear === 'all' ? 'var(--ink)' : 'var(--ink3)',
              }}
            >
              All years
            </button>
            {years.map(y => (
              <button
                key={y}
                onClick={() => setActiveYear(y)}
                className="text-[0.68rem] px-3 py-1 rounded-full border transition-all duration-150"
                style={{
                  fontFamily: 'var(--font-b)',
                  background: activeYear === y ? 'var(--bg)' : 'var(--bg2)',
                  borderColor: activeYear === y ? 'rgba(30,28,24,0.22)' : 'var(--rule)',
                  color: activeYear === y ? 'var(--ink)' : 'var(--ink3)',
                }}
              >
                {y}
              </button>
            ))}
            <div className="w-px h-4 mx-1" style={{ background: 'var(--rule)' }} />
            {(['all', 'manual', 'auto'] as const).map(source => (
              <button
                key={source}
                onClick={() => setActiveSource(source)}
                className="text-[0.68rem] px-3 py-1 rounded-full border transition-all duration-150 capitalize"
                style={{
                  fontFamily: 'var(--font-b)',
                  background: activeSource === source ? 'var(--bg)' : 'var(--bg2)',
                  borderColor: activeSource === source ? 'rgba(30,28,24,0.22)' : 'var(--rule)',
                  color: activeSource === source ? 'var(--ink)' : 'var(--ink3)',
                }}
              >
                {source}
              </button>
            ))}
          </div>

          {groupedByYear.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--ink3)' }}>
              <p className="text-[0.78rem]">No archive entries for this filter yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedByYear.map(([year, yearSnapshots]) => (
                <section key={year}>
                  <div
                    className="text-[0.72rem] font-medium tracking-[0.12em] uppercase mb-3"
                    style={{ color: 'var(--ink3)' }}
                  >
                    {year}
                  </div>
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(255px,1fr))] gap-3">
                    {yearSnapshots.map(snapshot => (
                      <SnapshotCard
                        key={snapshot.id}
                        snapshot={snapshot}
                        onDelete={deleteSnapshot}
                        onRestore={restoreSnapshot}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

