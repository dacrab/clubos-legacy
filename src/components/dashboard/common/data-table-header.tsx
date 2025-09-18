import type { ReactNode } from 'react';

type DataTableHeaderProps = {
  title: string;
  count?: number;
  searchBar?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function DataTableHeader({ 
  title, 
  count, 
  searchBar, 
  actions,
  className = '' 
}: DataTableHeaderProps) {
  return (
    <div className={`mb-4 flex flex-col gap-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl">{title}</h1>
        {count !== undefined && (
          <span className="text-base text-muted-foreground">
            {count} συνολικά
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        {searchBar}
        {actions && (
          <div className="flex flex-row gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
