import { useState } from 'react';
import { Resource } from '../types';
import { RESOURCES } from '../data/resources';
import ResourceCard from './ResourceCard';
import ResourceModal from './modals/ResourceModal';

const RESOURCE_TYPES = ['All', 'book', 'article', 'practice', 'tool'] as const;

export default function ResourcesView() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const filteredResources =
    activeFilter === 'All' ? RESOURCES : RESOURCES.filter(r => r.type === activeFilter);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto px-8 py-7 pb-12">
        <div className="max-w-[860px] mx-auto">
          <div className="mb-6">
            <div style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }} className="text-[1.3rem] italic">
              Resources
            </div>
            <div className="text-[0.72rem] leading-relaxed mt-1" style={{ color: 'var(--ink3)' }}>
              Books, practices, and tools for what's on your map.
            </div>
          </div>

          <div className="flex gap-1.5 flex-wrap mb-5">
            {RESOURCE_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`text-[0.68rem] px-3 py-1 rounded-full border cursor-pointer transition-all duration-150 ${
                  activeFilter === type ? 'shadow-sm' : ''
                }`}
                style={{
                  fontFamily: 'var(--font-b)',
                  background: activeFilter === type ? 'var(--bg)' : 'var(--bg2)',
                  borderColor: activeFilter === type ? 'rgba(30,28,24,0.22)' : 'var(--rule)',
                  color: activeFilter === type ? 'var(--ink)' : 'var(--ink3)',
                }}
              >
                {type === 'All' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(245px,1fr))] gap-3">
            {filteredResources.map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onClick={() => setSelectedResource(resource)}
              />
            ))}
          </div>
        </div>
      </div>

      <ResourceModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
      />
    </div>
  );
}
