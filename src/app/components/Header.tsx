type View = 'map' | 'today' | 'focus' | 'progress' | 'archive' | 'resources' | 'learn';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onSnapshot: () => void;
  onExport: () => void;
}

export default function Header({ currentView, onViewChange, onSnapshot, onExport }: HeaderProps) {
  return (
    <header className="flex-shrink-0 flex items-center justify-between px-6 h-14 border-b gap-4" style={{ borderColor: 'var(--rule)', background: 'var(--bg)' }}>
      <div className="flex items-center gap-2 flex-shrink-0 cursor-default">
        <svg className="w-[26px] h-[26px] flex-shrink-0" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="13" cy="13" r="12" stroke="#8a6c3e" strokeWidth="1.2" />
          <circle cx="13" cy="13" r="6.5" stroke="#8a6c3e" strokeWidth="0.9" strokeDasharray="1.8 2.4" />
          <circle cx="13" cy="13" r="2" fill="#8a6c3e" />
        </svg>
        <span style={{ fontFamily: 'var(--font-b)', color: 'var(--ink2)' }} className="text-[0.78rem] font-normal tracking-[0.2em] uppercase">
          One Honest Look
        </span>
      </div>

      <div className="flex rounded-lg p-[3px] border" style={{ background: 'var(--bg2)', borderColor: 'var(--rule)' }}>
        <button
          onClick={() => onViewChange('map')}
          className={`text-[0.71rem] font-medium px-3 py-1.5 rounded-md border-none transition-all duration-150 tracking-wide whitespace-nowrap ${
            currentView === 'map'
              ? 'shadow-sm'
              : ''
          }`}
          style={{
            fontFamily: 'var(--font-b)',
            background: currentView === 'map' ? 'var(--bg)' : 'transparent',
            color: currentView === 'map' ? 'var(--ink)' : 'var(--ink3)',
            boxShadow: currentView === 'map' ? '0 1px 3px rgba(30,28,24,0.09)' : 'none',
          }}
        >
          Map
        </button>
        <button
          onClick={() => onViewChange('today')}
          className={`text-[0.71rem] font-medium px-3 py-1.5 rounded-md border-none transition-all duration-150 tracking-wide whitespace-nowrap ${
            currentView === 'today'
              ? 'shadow-sm'
              : ''
          }`}
          style={{
            fontFamily: 'var(--font-b)',
            background: currentView === 'today' ? 'var(--bg)' : 'transparent',
            color: currentView === 'today' ? 'var(--ink)' : 'var(--ink3)',
            boxShadow: currentView === 'today' ? '0 1px 3px rgba(30,28,24,0.09)' : 'none',
          }}
        >
          Today
        </button>
        <button
          onClick={() => onViewChange('progress')}
          className={`text-[0.71rem] font-medium px-3 py-1.5 rounded-md border-none transition-all duration-150 tracking-wide whitespace-nowrap ${
            currentView === 'progress'
              ? 'shadow-sm'
              : ''
          }`}
          style={{
            fontFamily: 'var(--font-b)',
            background: currentView === 'progress' ? 'var(--bg)' : 'transparent',
            color: currentView === 'progress' ? 'var(--ink)' : 'var(--ink3)',
            boxShadow: currentView === 'progress' ? '0 1px 3px rgba(30,28,24,0.09)' : 'none',
          }}
        >
          Progress
        </button>
        <button
          onClick={() => onViewChange('focus')}
          className={`text-[0.71rem] font-medium px-3 py-1.5 rounded-md border-none transition-all duration-150 tracking-wide whitespace-nowrap ${
            currentView === 'focus'
              ? 'shadow-sm'
              : ''
          }`}
          style={{
            fontFamily: 'var(--font-b)',
            background: currentView === 'focus' ? 'var(--bg)' : 'transparent',
            color: currentView === 'focus' ? 'var(--ink)' : 'var(--ink3)',
            boxShadow: currentView === 'focus' ? '0 1px 3px rgba(30,28,24,0.09)' : 'none',
          }}
        >
          Focus
        </button>
        <button
          onClick={() => onViewChange('learn')}
          className={`text-[0.71rem] font-medium px-3 py-1.5 rounded-md border-none transition-all duration-150 tracking-wide whitespace-nowrap ${
            currentView === 'learn'
              ? 'shadow-sm'
              : ''
          }`}
          style={{
            fontFamily: 'var(--font-b)',
            background: currentView === 'learn' ? 'var(--bg)' : 'transparent',
            color: currentView === 'learn' ? 'var(--ink)' : 'var(--ink3)',
            boxShadow: currentView === 'learn' ? '0 1px 3px rgba(30,28,24,0.09)' : 'none',
          }}
        >
          Learn
        </button>
        <button
          onClick={() => onViewChange('resources')}
          className={`text-[0.71rem] font-medium px-3 py-1.5 rounded-md border-none transition-all duration-150 tracking-wide whitespace-nowrap ${
            currentView === 'resources'
              ? 'shadow-sm'
              : ''
          }`}
          style={{
            fontFamily: 'var(--font-b)',
            background: currentView === 'resources' ? 'var(--bg)' : 'transparent',
            color: currentView === 'resources' ? 'var(--ink)' : 'var(--ink3)',
            boxShadow: currentView === 'resources' ? '0 1px 3px rgba(30,28,24,0.09)' : 'none',
          }}
        >
          Resources
        </button>
        <button
          onClick={() => onViewChange('archive')}
          className={`text-[0.71rem] font-medium px-3 py-1.5 rounded-md border-none transition-all duration-150 tracking-wide whitespace-nowrap ${
            currentView === 'archive'
              ? 'shadow-sm'
              : ''
          }`}
          style={{
            fontFamily: 'var(--font-b)',
            background: currentView === 'archive' ? 'var(--bg)' : 'transparent',
            color: currentView === 'archive' ? 'var(--ink)' : 'var(--ink3)',
            boxShadow: currentView === 'archive' ? '0 1px 3px rgba(30,28,24,0.09)' : 'none',
          }}
        >
          Archive
        </button>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onSnapshot}
          className="text-[0.71rem] font-medium px-3 py-1.5 rounded-md border transition-all duration-150 tracking-wide whitespace-nowrap hover:opacity-80"
          style={{
            fontFamily: 'var(--font-b)',
            borderColor: 'var(--rule)',
            background: 'var(--bg)',
            color: 'var(--ink2)',
          }}
        >
          Snapshot
        </button>
        <button
          onClick={onExport}
          className="text-[0.71rem] font-medium px-3 py-1.5 rounded-md border-none transition-all duration-150 tracking-wide whitespace-nowrap hover:opacity-90"
          style={{
            fontFamily: 'var(--font-b)',
            background: 'var(--gold)',
            color: '#fff',
          }}
        >
          Export
        </button>
      </div>
    </header>
  );
}
