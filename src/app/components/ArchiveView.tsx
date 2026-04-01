import { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { ArchiveSettings, JournalEntry, Snapshot } from '../types';
import { fmtDate } from '../utils/helpers';
import SnapshotCard from './SnapshotCard';

interface ArchiveViewProps {
  snapshots: Snapshot[];
  setSnapshots: (snapshots: Snapshot[]) => void;
  setBubbles: (bubbles: Snapshot['bubbles']) => void;
  archiveSettings: ArchiveSettings;
  setArchiveSettings: (settings: ArchiveSettings) => void;
  journalEntries: Record<string, JournalEntry>;
  setJournalEntries: Dispatch<SetStateAction<Record<string, JournalEntry>>>;
}

export default function ArchiveView({
  snapshots,
  setSnapshots,
  setBubbles,
  archiveSettings,
  setArchiveSettings,
  journalEntries,
  setJournalEntries,
}: ArchiveViewProps) {
  const [activeYear, setActiveYear] = useState<number | 'all'>('all');
  const [activeSource, setActiveSource] = useState<'all' | 'manual' | 'auto'>('all');

  const years = useMemo(() => {
    const fromSnaps = snapshots.map((s) => new Date(s.date).getFullYear());
    const fromJournal = Object.keys(journalEntries).map((d) => new Date(`${d}T12:00:00`).getFullYear());
    const unique = Array.from(new Set([...fromSnaps, ...fromJournal]));
    return unique.sort((a, b) => b - a);
  }, [snapshots, journalEntries]);

  const visibleJournalEntries = useMemo(() => {
    return Object.entries(journalEntries)
      .filter(([dateStr, entry]) => {
        const hasContent = entry.body.trim().length > 0 || entry.closing.trim().length > 0;
        if (!hasContent) return false;
        const y = new Date(`${dateStr}T12:00:00`).getFullYear();
        return activeYear === 'all' || y === activeYear;
      })
      .sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0));
  }, [journalEntries, activeYear]);

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

  const deleteJournalEntry = (dateStr: string) => {
    const label = fmtDate(new Date(`${dateStr}T12:00:00`));
    if (!window.confirm(`Remove the journal entry for ${label}?`)) return;
    setJournalEntries((prev) => {
      const next = { ...prev };
      delete next[dateStr];
      return next;
    });
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
              Long-term history of your map, private journal, and habits over the years.
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
                  onClick={() => setArchiveSettings({ ...archiveSettings, cadence: 'daily' })}
                  className="text-[0.68rem] px-3 py-1 rounded-full border transition-all duration-150"
                  style={{
                    fontFamily: 'var(--font-b)',
                    background: archiveSettings.cadence === 'daily' ? 'var(--bg)' : 'var(--bg2)',
                    borderColor: archiveSettings.cadence === 'daily' ? 'rgba(30,28,24,0.22)' : 'var(--rule)',
                    color: archiveSettings.cadence === 'daily' ? 'var(--ink)' : 'var(--ink3)',
                  }}
                >
                  Daily
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
                <button
                  onClick={() => setArchiveSettings({ ...archiveSettings, cadence: 'biweekly' })}
                  className="text-[0.68rem] px-3 py-1 rounded-full border transition-all duration-150"
                  style={{
                    fontFamily: 'var(--font-b)',
                    background: archiveSettings.cadence === 'biweekly' ? 'var(--bg)' : 'var(--bg2)',
                    borderColor: archiveSettings.cadence === 'biweekly' ? 'rgba(30,28,24,0.22)' : 'var(--rule)',
                    color: archiveSettings.cadence === 'biweekly' ? 'var(--ink)' : 'var(--ink3)',
                  }}
                >
                  Bi-weekly
                </button>
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

          <section className="mb-8">
            <div
              className="text-[0.72rem] font-medium tracking-[0.12em] uppercase mb-3"
              style={{ color: 'var(--ink3)' }}
            >
              Private journal
            </div>
            <p className="text-[0.68rem] leading-relaxed mb-3" style={{ color: 'var(--ink4)' }}>
              Daily entries from Today, newest first. Use the year filters above to narrow the list.
            </p>
            {visibleJournalEntries.length === 0 ? (
              <div
                className="rounded-[10px] border px-4 py-6 text-center text-[0.72rem]"
                style={{ background: 'var(--bg2)', borderColor: 'var(--rule)', color: 'var(--ink3)' }}
              >
                No journal entries for this filter yet.
              </div>
            ) : (
              <div className="space-y-3">
                {visibleJournalEntries.map(([dateStr, entry]) => (
                  <article
                    key={dateStr}
                    className="rounded-[10px] border p-4"
                    style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                      <div
                        className="text-[0.72rem] font-medium"
                        style={{ color: 'var(--ink)', fontFamily: 'var(--font-b)' }}
                      >
                        {fmtDate(new Date(`${dateStr}T12:00:00`))}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteJournalEntry(dateStr)}
                        className="text-[0.64rem] underline underline-offset-2 hover:opacity-80 bg-transparent border-0 cursor-pointer p-0"
                        style={{ color: 'var(--ink4)', fontFamily: 'var(--font-b)' }}
                      >
                        Remove
                      </button>
                    </div>
                    {entry.body.trim().length > 0 && (
                      <p
                        className="text-[0.74rem] leading-[1.75] whitespace-pre-wrap"
                        style={{ color: 'var(--ink2)' }}
                      >
                        {entry.body}
                      </p>
                    )}
                    {entry.closing.trim().length > 0 && (
                      <p
                        className="text-[0.7rem] leading-[1.7] mt-2.5 pt-2.5 whitespace-pre-wrap border-t"
                        style={{ color: 'var(--ink3)', borderColor: 'var(--rule2)' }}
                      >
                        {entry.closing}
                      </p>
                    )}
                    {entry.updatedAt && (
                      <div className="text-[0.6rem] mt-2" style={{ color: 'var(--ink4)' }}>
                        Saved{' '}
                        {new Date(entry.updatedAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

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

