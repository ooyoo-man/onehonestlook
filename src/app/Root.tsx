import { useState, useEffect } from 'react';
import { ArchiveSettings, Bubble, Snapshot, Log, IntakeAnswers, FocusSprint, JournalEntry } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { normalizeJournalRecord } from './utils/journalMigration';
import Header from './components/Header';
import MapView from './components/MapView';
import ProgressView from './components/ProgressView';
import TodayView from './components/TodayView';
import ResourcesView from './components/ResourcesView';
import ArchiveView from './components/ArchiveView';
import FocusView from './components/FocusView';
import SnapshotModal from './components/modals/SnapshotModal';
import NoteModal from './components/modals/NoteModal';
import ExploreBubbleModal from './components/modals/ExploreBubbleModal';
import IntakeQuestionnaireModal, { buildStarterBubblesFromIntake } from './components/modals/IntakeQuestionnaireModal';
import LoginPage from './components/LoginPage';
import { getArchivePeriodKey, logKey, todayStr } from './utils/helpers';

type View = 'map' | 'today' | 'focus' | 'progress' | 'archive' | 'resources';

export default function Root() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bubbles, setBubbles] = useLocalStorage<Bubble[]>('ohl3-b', []);
  const [snapshots, setSnapshots] = useLocalStorage<Snapshot[]>('ohl3-s', []);
  const [logs, setLogs] = useLocalStorage<Record<string, Log>>('ohl3-l', {});
  const [journalEntries, setJournalEntries] = useLocalStorage<Record<string, JournalEntry>>(
    'ohl3-day-reflections',
    {},
    {
      deserialize: (parsed) =>
        normalizeJournalRecord(
          typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
            ? (parsed as Record<string, unknown>)
            : {}
        ),
    }
  );
  const [archiveSettings, setArchiveSettings] = useLocalStorage<ArchiveSettings>('ohl3-archive-settings', {
    autoArchiveEnabled: true,
    cadence: 'monthly',
  });
  const [focusSprint, setFocusSprint] = useLocalStorage<FocusSprint | null>('ohl3-focus-sprint', null);
  const [hasCompletedIntake, setHasCompletedIntake] = useLocalStorage<boolean>('ohl3-intake-done', false);
  const [currentView, setCurrentView] = useState<View>('today');
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [noteContext, setNoteContext] = useState<{ bubbleId: number; dateStr: string } | null>(null);
  const [exploreBubble, setExploreBubble] = useState<Bubble | null>(null);

  // Legacy: old data used cat "habit"; all bubbles are habits now (neutral / positive / negative).
  useEffect(() => {
    const fixCat = (b: Bubble): Bubble =>
      (b as Bubble & { cat?: string }).cat === 'habit' ? { ...b, cat: 'neutral' } : b;

    setBubbles((prev) => {
      if (!prev.some((b) => (b as Bubble & { cat?: string }).cat === 'habit')) return prev;
      return prev.map(fixCat);
    });
    setSnapshots((prev) => {
      if (!prev.some((s) => s.bubbles.some((b) => (b as Bubble & { cat?: string }).cat === 'habit'))) return prev;
      return prev.map((s) => ({ ...s, bubbles: s.bubbles.map(fixCat) }));
    });
  }, [setBubbles, setSnapshots]);

  // Seed fallback demo data only after intake is complete.
  useEffect(() => {
    if (bubbles.length === 0 && hasCompletedIntake) {
      const seedData: Omit<Bubble, 'x' | 'y'>[] = [
        { id: Date.now() + Math.random(), label: 'Family time', cat: 'positive' },
        { id: Date.now() + Math.random() + 0.1, label: 'Running', cat: 'positive' },
        { id: Date.now() + Math.random() + 0.2, label: 'Drinking', cat: 'negative' },
        { id: Date.now() + Math.random() + 0.3, label: 'Gaming', cat: 'neutral' },
        { id: Date.now() + Math.random() + 0.4, label: 'Work focus', cat: 'neutral' },
        { id: Date.now() + Math.random() + 0.5, label: 'Binge eating', cat: 'negative' },
        { id: Date.now() + Math.random() + 0.6, label: 'Learning', cat: 'positive' },
      ];
      
      const bubblesWithPos = seedData.map(b => ({
        ...b,
        x: 400 + Math.random() * 200,
        y: 300 + Math.random() * 200,
      }));
      
      setBubbles(bubblesWithPos);
    }
  }, [hasCompletedIntake]);

  useEffect(() => {
    if (!isLoggedIn) return;
    if (!hasCompletedIntake) {
      setShowIntakeModal(true);
    }
  }, [isLoggedIn, hasCompletedIntake]);

  useEffect(() => {
    if (!archiveSettings.autoArchiveEnabled) return;
    if (bubbles.length === 0) return;

    const now = new Date();
    const periodKey = getArchivePeriodKey(now, archiveSettings.cadence);
    const alreadyExists = snapshots.some(
      (s) => s.source === 'auto' && s.cadence === archiveSettings.cadence && s.periodKey === periodKey
    );
    if (alreadyExists) return;

    const periodLabel =
      archiveSettings.cadence === 'daily'
        ? now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : archiveSettings.cadence === 'weekly'
        ? `Week of ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        : archiveSettings.cadence === 'biweekly'
        ? `2-week period ending ${now.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}`
        : now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const autoSnapshot: Snapshot = {
      id: Date.now(),
      name: `Auto snapshot • ${periodLabel}`,
      note: '',
      date: now.toISOString(),
      bubbles: JSON.parse(JSON.stringify(bubbles)),
      source: 'auto',
      cadence: archiveSettings.cadence,
      periodKey,
    };

    setSnapshots([autoSnapshot, ...snapshots]);
  }, [archiveSettings, bubbles, snapshots]);

  const handleExport = () => {
    const data = {
      bubbles,
      snapshots,
      logs,
      journalEntries,
      archiveSettings,
      exported: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `one-honest-look-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openNoteModal = (bubbleId: number, dateStr: string) => {
    setNoteContext({ bubbleId, dateStr });
    setShowNoteModal(true);
  };

  const openExploreModal = (bubble: Bubble) => {
    setExploreBubble(bubble);
    setShowExploreModal(true);
  };

  const saveReflections = (bubbleId: number, reflections: Record<string, string>) => {
    setBubbles(bubbles.map(b => (b.id === bubbleId ? { ...b, reflections } : b)));
  };

  const bulkSetYN = (bubbleId: number, dateStrs: string[], yn: 'yes' | 'no' | null) => {
    setLogs((prev) => {
      const next = { ...prev };
      for (const ds of dateStrs) {
        const key = logKey(bubbleId, ds);
        const existing = next[key] ?? { yn: null, note: '' };
        next[key] = { ...existing, yn };
      }
      return next;
    });
  };

  const completeIntake = (answers: IntakeAnswers) => {
    const starter = buildStarterBubblesFromIntake(answers);
    if (starter.length > 0) {
      const width = 800;
      const height = 600;
      const centerX = width / 2;
      const centerY = height / 2;
      const positioned = starter.map((b, i) => {
        const angle = (i / Math.max(starter.length, 1)) * Math.PI * 2;
        const radius = 120 + (i % 4) * 40;
        return {
          ...b,
          x: centerX + Math.cos(angle) * radius,
          y: centerY + Math.sin(angle) * radius,
        };
      });
      setBubbles(positioned);
    }
    setHasCompletedIntake(true);
    setShowIntakeModal(false);
  };

  const skipIntake = () => {
    setHasCompletedIntake(true);
    setShowIntakeModal(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onSnapshot={() => setShowSnapshotModal(true)}
        onExport={handleExport}
      />

      {currentView === 'map' && (
        <MapView
          bubbles={bubbles}
          setBubbles={setBubbles}
          logs={logs}
          onOpenNoteModal={openNoteModal}
          onOpenExploreModal={openExploreModal}
        />
      )}

      {currentView === 'progress' && (
        <ProgressView
          bubbles={bubbles}
          logs={logs}
          onOpenSnapshotModal={() => setShowSnapshotModal(true)}
          onOpenArchive={() => setCurrentView('archive')}
        />
      )}

      {currentView === 'today' && (
        <TodayView
          bubbles={bubbles}
          logs={logs}
          onBulkSetYN={bulkSetYN}
          onOpenNoteModal={openNoteModal}
          onGoToFocus={() => setCurrentView('focus')}
          onOpenInMap={(bubbleId) => {
            setCurrentView('map');
            const b = bubbles.find((x) => x.id === bubbleId);
            if (b) openExploreModal(b);
          }}
          onDeferBubble={(bubbleId, lane) => {
            setBubbles((prev) => prev.map((b) => (b.id === bubbleId ? { ...b, priorityLane: lane } : b)));
          }}
          todayJournal={journalEntries[todayStr()]}
          onSaveJournal={(body, closing) => {
            const dateStr = todayStr();
            setJournalEntries((prev) => ({
              ...prev,
              [dateStr]: {
                body,
                closing,
                updatedAt: new Date().toISOString(),
              },
            }));
          }}
        />
      )}

      {currentView === 'focus' && (
        <FocusView
          bubbles={bubbles}
          setBubbles={setBubbles}
          focusSprint={focusSprint}
          setFocusSprint={setFocusSprint}
        />
      )}

      {currentView === 'archive' && (
        <ArchiveView
          snapshots={snapshots}
          setSnapshots={setSnapshots}
          setBubbles={setBubbles}
          archiveSettings={archiveSettings}
          setArchiveSettings={setArchiveSettings}
          journalEntries={journalEntries}
          setJournalEntries={setJournalEntries}
        />
      )}

      {currentView === 'resources' && <ResourcesView />}

      <SnapshotModal
        isOpen={showSnapshotModal}
        onClose={() => setShowSnapshotModal(false)}
        bubbles={bubbles}
        snapshots={snapshots}
        setSnapshots={setSnapshots}
        onViewChange={setCurrentView}
      />

      <NoteModal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        noteContext={noteContext}
        bubbles={bubbles}
        logs={logs}
        setLogs={setLogs}
      />

      <ExploreBubbleModal
        isOpen={showExploreModal}
        onClose={() => setShowExploreModal(false)}
        bubble={exploreBubble}
        onSaveReflection={saveReflections}
        existingReflections={exploreBubble?.reflections || {}}
      />

      <IntakeQuestionnaireModal
        isOpen={showIntakeModal}
        onComplete={completeIntake}
        onSkip={skipIntake}
      />
    </div>
  );
}