import { Resource } from '../types';

interface ResourceCardProps {
  resource: Resource;
  onClick: () => void;
}

export default function ResourceCard({ resource, onClick }: ResourceCardProps) {
  const getTypeColor = () => {
    if (resource.type === 'book') return 'var(--gold)';
    if (resource.type === 'article') return 'var(--green)';
    if (resource.type === 'practice') return 'var(--blue)';
    return 'var(--red)';
  };

  return (
    <div
      onClick={onClick}
      className="rounded-[10px] border p-4 transition-all duration-150 cursor-pointer relative overflow-hidden hover:shadow-md"
      style={{ background: 'var(--bg)', borderColor: 'var(--rule)' }}
    >
      <div
        className="absolute top-0 left-0 w-[3px] h-full"
        style={{ background: getTypeColor() }}
      />

      <div
        className="text-[0.6rem] tracking-[0.1em] uppercase font-medium mb-1"
        style={{ color: 'var(--ink4)' }}
      >
        {resource.type}
      </div>

      <div
        style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }}
        className="text-[0.9rem] mb-1 leading-snug"
      >
        {resource.name}
      </div>

      <div className="text-[0.7rem] leading-relaxed mb-3" style={{ color: 'var(--ink3)' }}>
        {resource.desc}
      </div>

      <div className="flex flex-wrap gap-1">
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
    </div>
  );
}
