import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedMobileListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  className?: string;
  estimateSize?: (item: T) => number;
}

export function VirtualizedMobileList<T>({
  items,
  renderItem,
  className,
  estimateSize = () => 110,
}: VirtualizedMobileListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: index => estimateSize(items[index]),
    overscan: 5,
    measureElement: element => element.getBoundingClientRect().height,
  });

  // Recalculate sizes when items change
  useEffect(() => {
    virtualizer.measure();
  }, [items, virtualizer]);

  return (
    <div
      ref={parentRef}
      className={className}
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
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={virtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index])}
          </div>
        ))}
      </div>
    </div>
  );
}
