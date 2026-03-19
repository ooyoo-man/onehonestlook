import { Resource } from '../../types';

interface ResourceModalProps {
  resource: Resource | null;
  onClose: () => void;
}

export default function ResourceModal({ resource, onClose }: ResourceModalProps) {
  if (!resource) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center p-4 z-[1000] animate-[fadeIn_0.14s_ease]"
      style={{ background: 'rgba(28,26,22,0.4)' }}
    >
      <div
        className="rounded-[13px] p-6 w-full max-w-[460px] border animate-[slideUp_0.17s_cubic-bezier(0.25,0,0,1)]"
        style={{ background: 'var(--bg)', borderColor: 'var(--rule)', boxShadow: 'var(--sh-lg)' }}
      >
        <div style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }} className="text-[1.05rem] italic mb-1">
          {resource.name}
        </div>
        <div
          className="text-[0.62rem] tracking-[0.1em] uppercase font-medium mb-4"
          style={{ color: 'var(--ink4)' }}
        >
          {resource.type}
        </div>

        <div className="text-[0.8rem] leading-[1.75] mb-4" style={{ color: 'var(--ink2)' }}>
          {resource.desc}
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {resource.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[0.6rem] px-2 py-0.5 rounded-full border"
              style={{ background: 'var(--bg2)', color: 'var(--ink3)', borderColor: 'var(--rule2)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          className="text-[0.7rem] leading-relaxed px-3 py-2.5 rounded-lg border mb-4"
          style={{ color: 'var(--ink4)', background: 'var(--bg2)', borderColor: 'var(--rule2)' }}
        >
          Affiliate links will appear here when the site is live. For now, search the title to find it.
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="text-[0.71rem] font-medium px-3 py-1.5 rounded-md border transition-all duration-150 tracking-wide hover:opacity-80"
            style={{
              fontFamily: 'var(--font-b)',
              borderColor: 'var(--rule)',
              background: 'var(--bg)',
              color: 'var(--ink2)',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
