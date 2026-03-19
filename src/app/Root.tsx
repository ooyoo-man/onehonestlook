import { useState, useEffect } from 'react';
import { Bubble, Snapshot, Log } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import MapView from './components/MapView';
import ProgressView from './components/ProgressView';
import ResourcesView from './components/ResourcesView';
import LearnView from './components/LearnView';
import SnapshotModal from './components/modals/SnapshotModal';
import NoteModal from './components/modals/NoteModal';
import ExploreBubbleModal from './components/modals/ExploreBubbleModal';
import LoginPage from './components/LoginPage';

type View = 'map' | 'progress' | 'resources' | 'learn';

export default function Root() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bubbles, setBubbles] = useLocalStorage<Bubble[]>('ohl3-b', []);
  const [snapshots, setSnapshots] = useLocalStorage<Snapshot[]>('ohl3-s', []);
  const [logs, setLogs] = useLocalStorage<Record<string, Log>>('ohl3-l', {});
  const [currentView, setCurrentView] = useState<View>('map');
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showExploreModal, setShowExploreModal] = useState(false);
  const [noteContext, setNoteContext] = useState<{ bubbleId: number; dateStr: string } | null>(null);
  const [exploreBubble, setExploreBubble] = useState<Bubble | null>(null);

  // Seed data on first load
  useEffect(() => {
    if (bubbles.length === 0) {
      const seedData: Omit<Bubble, 'x' | 'y'>[] = [
        { id: Date.now() + Math.random(), label: 'Family time', cat: 'positive' },
        { id: Date.now() + Math.random() + 0.1, label: 'Running', cat: 'positive' },
        { id: Date.now() + Math.random() + 0.2, label: 'Drinking', cat: 'negative' },
        { id: Date.now() + Math.random() + 0.3, label: 'Gaming', cat: 'habit' },
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
  }, []);

  const handleExport = () => {
    const data = {
      bubbles,
      snapshots,
      logs,
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
          snapshots={snapshots}
          setSnapshots={setSnapshots}
          logs={logs}
          setBubbles={setBubbles}
          onOpenNoteModal={openNoteModal}
          onOpenSnapshotModal={() => setShowSnapshotModal(true)}
        />
      )}

      {currentView === 'resources' && <ResourcesView />}

      {currentView === 'learn' && <LearnView />}

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
    </div>
  );
}