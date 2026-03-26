import { useState } from 'react';
import { Bubble, Log } from '../types';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Lightbulb, GripVertical } from 'lucide-react';
import { todayStr, logKey } from '../utils/helpers';

interface ColumnViewProps {
  bubbles: Bubble[];
  setBubbles: (bubbles: Bubble[]) => void;
  logs: Record<string, Log>;
  onOpenNoteModal: (bubbleId: number, dateStr: string) => void;
  onOpenExploreModal: (bubble: Bubble) => void;
}

interface DraggableBubbleItemProps {
  bubble: Bubble;
  index: number;
  category: Bubble['cat'];
  moveBubble: (dragIndex: number, hoverIndex: number, category: Bubble['cat']) => void;
  updateImportance: (id: number, importance: number) => void;
  logs: Record<string, Log>;
  onOpenNoteModal: (bubbleId: number, dateStr: string) => void;
  onOpenExploreModal: (bubble: Bubble) => void;
}

const DraggableBubbleItem = ({
  bubble,
  index,
  category,
  moveBubble,
  updateImportance,
  logs,
  onOpenNoteModal,
  onOpenExploreModal,
}: DraggableBubbleItemProps) => {
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'BUBBLE',
    item: { index, category, bubbleId: bubble.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'BUBBLE',
    hover: (item: { index: number; category: Bubble['cat'] }) => {
      if (item.category !== category) return;
      if (item.index !== index) {
        moveBubble(item.index, index, category);
        item.index = index;
      }
    },
  });

  const todayLog = logs[logKey(bubble.id, todayStr())];
  const hasReflections = bubble.reflections && Object.values(bubble.reflections).some(r => r?.trim().length > 0);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'positive': return { bg: 'var(--green-bg)', border: 'var(--green-ln)', color: 'var(--green)' };
      case 'negative': return { bg: 'var(--red-bg)', border: 'var(--red-ln)', color: 'var(--red)' };
      default: return { bg: 'var(--bg)', border: 'var(--rule)', color: 'var(--ink2)' };
    }
  };

  const getBadgeStyles = () => {
    if (todayLog?.yn === 'yes') {
      return {
        background: 'var(--green-bg)',
        color: 'var(--green)',
        borderColor: 'var(--green-ln)',
      };
    } else if (todayLog?.yn === 'no') {
      return {
        background: 'var(--red-bg)',
        color: 'var(--red)',
        borderColor: 'var(--red-ln)',
      };
    }
    return {
      background: 'var(--gold-bg)',
      color: 'var(--gold)',
      borderColor: 'rgba(138,108,62,0.18)',
    };
  };

  const categoryColors = getCategoryColor(bubble.cat);
  const badgeStyles = getBadgeStyles();
  const badgeText = todayLog?.yn === 'yes' ? '✓' : todayLog?.yn === 'no' ? '✕' : '✎';

  return (
    <div
      ref={(node) => preview(drop(node))}
      className="group transition-all duration-150"
      style={{
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div
        className="flex items-center gap-3 p-3 rounded-lg border transition-all duration-150 hover:shadow-sm"
        style={{
          background: categoryColors.bg,
          borderColor: categoryColors.border,
        }}
      >
        {/* Drag Handle */}
        <div
          ref={drag}
          className="cursor-grab active:cursor-grabbing flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
          style={{ color: categoryColors.color }}
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Importance Rating */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <input
            type="number"
            min="1"
            max="10"
            value={bubble.importance || 5}
            onChange={(e) => {
              const val = Math.max(1, Math.min(10, parseInt(e.target.value) || 5));
              updateImportance(bubble.id, val);
            }}
            className="w-[42px] text-center text-[0.82rem] font-medium rounded px-1 py-1 border outline-none transition-all duration-150 focus:border-[var(--gold-lt)]"
            style={{
              fontFamily: 'var(--font-b)',
              background: 'var(--bg)',
              borderColor: 'var(--rule)',
              color: categoryColors.color,
            }}
          />
          <span className="text-[0.58rem] tracking-wide" style={{ color: 'var(--ink4)' }}>
            RANK
          </span>
        </div>

        {/* Bubble Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[0.85rem] font-medium truncate" style={{ color: categoryColors.color }}>
            {bubble.label}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasReflections && (
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'var(--gold)' }}
              title="Has reflections"
            />
          )}
          <button
            onClick={() => onOpenExploreModal(bubble)}
            className="w-[26px] h-[26px] rounded-full flex items-center justify-center border-none transition-all duration-150 hover:opacity-80"
            style={{
              background: hasReflections ? 'var(--gold-bg)' : 'var(--bg)',
              color: hasReflections ? 'var(--gold)' : 'var(--ink3)',
            }}
            title="Explore why this matters"
          >
            <Lightbulb className="w-[11px] h-[11px]" strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onOpenNoteModal(bubble.id, todayStr())}
            className="text-[9px] rounded px-2 py-1 border cursor-pointer transition-all duration-150 hover:opacity-80"
            style={badgeStyles}
            title="Log today"
          >
            {badgeText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ColumnView({
  bubbles,
  setBubbles,
  logs,
  onOpenNoteModal,
  onOpenExploreModal,
}: ColumnViewProps) {
  const categories: { key: Bubble['cat']; label: string }[] = [
    { key: 'positive', label: 'Positive habits' },
    { key: 'negative', label: 'Needs work' },
    { key: 'neutral', label: 'Neutral habits' },
  ];

  const getBubblesByCategory = (cat: Bubble['cat']) => {
    return bubbles
      .filter(b => b.cat === cat)
      .sort((a, b) => (b.importance || 5) - (a.importance || 5));
  };

  const moveBubble = (dragIndex: number, hoverIndex: number, category: Bubble['cat']) => {
    const categoryBubbles = getBubblesByCategory(category);
    const draggedBubble = categoryBubbles[dragIndex];
    
    const newCategoryBubbles = [...categoryBubbles];
    newCategoryBubbles.splice(dragIndex, 1);
    newCategoryBubbles.splice(hoverIndex, 0, draggedBubble);

    // Update importance based on new position
    const updatedCategoryBubbles = newCategoryBubbles.map((b, idx) => ({
      ...b,
      importance: 10 - idx, // Reverse: top = 10, bottom = 1
    }));

    // Merge with other categories
    const otherBubbles = bubbles.filter(b => b.cat !== category);
    setBubbles([...otherBubbles, ...updatedCategoryBubbles]);
  };

  const updateImportance = (id: number, importance: number) => {
    setBubbles(bubbles.map(b => (b.id === id ? { ...b, importance } : b)));
  };

  const getCategoryColor = (cat: Bubble['cat']) => {
    switch (cat) {
      case 'positive': return 'var(--green)';
      case 'negative': return 'var(--red)';
      default: return 'var(--ink3)';
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--bg2)' }}>
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h2
              style={{ fontFamily: 'var(--font-h)', color: 'var(--ink)' }}
              className="text-[1.4rem] italic mb-2"
            >
              Ranked by Importance
            </h2>
            <p className="text-[0.78rem]" style={{ color: 'var(--ink3)' }}>
              Drag to reorder, or edit the rank number directly. Higher numbers = more important.
            </p>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(({ key, label }) => {
              const categoryBubbles = getBubblesByCategory(key);
              
              return (
                <div key={key} className="flex flex-col">
                  {/* Column Header */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: getCategoryColor(key) }}
                      />
                      <h3
                        className="text-[0.85rem] font-medium tracking-wide"
                        style={{ fontFamily: 'var(--font-b)', color: 'var(--ink)' }}
                      >
                        {label}
                      </h3>
                      <span
                        className="text-[0.7rem] px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--rule2)', color: 'var(--ink3)' }}
                      >
                        {categoryBubbles.length}
                      </span>
                    </div>
                  </div>

                  {/* Bubbles */}
                  <div className="space-y-2">
                    {categoryBubbles.length === 0 ? (
                      <div
                        className="text-center py-8 text-[0.72rem] italic rounded-lg border border-dashed"
                        style={{ color: 'var(--ink4)', borderColor: 'var(--rule2)' }}
                      >
                        No items yet
                      </div>
                    ) : (
                      categoryBubbles.map((bubble, index) => (
                        <DraggableBubbleItem
                          key={bubble.id}
                          bubble={bubble}
                          index={index}
                          category={key}
                          moveBubble={moveBubble}
                          updateImportance={updateImportance}
                          logs={logs}
                          onOpenNoteModal={onOpenNoteModal}
                          onOpenExploreModal={onOpenExploreModal}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
