import { useVirtualizer } from '@tanstack/react-virtual';
import { useEffect, useRef } from 'react';

type VirtualizedMobileListProps<T> = {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  className?: string;
  estimateSize?: (item: T) => number;
};

const DEFAULT_ESTIMATED_SIZE = 110;

export function VirtualizedMobileList<T extends { id: string }>({
  items,
  renderItem,
  className,
  estimateSize = () => DEFAULT_ESTIMATED_SIZE,
}: VirtualizedMobileListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const item = items[index];
      return item ? estimateSize(item) : 0;
    },
    overscan: 5,
    measureElement: (element) => element.getBoundingClientRect().height,
  });

  // Recalculate sizes when items change
  useEffect(() => {
    virtualizer.measure();
  }, [virtualizer]);

  return (
    <div
      className={className}
      ref={parentRef}
      style={{
        height: '600px',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            data-index={virtualItem.index}
            key={virtualItem.key}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {(() => {
              const item = items[virtualItem.index];
              return item ? renderItem(item) : null;
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}
