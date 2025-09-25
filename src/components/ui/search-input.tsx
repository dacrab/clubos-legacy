'use client';

import { Search, X } from 'lucide-react';
import { forwardRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/format';

type SearchInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
  disabled?: boolean;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Αναζήτηση...',
      className,
      showClearButton = true,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const handleClear = () => {
      if (onClear) {
        onClear();
      } else {
        // Fallback: create a synthetic event to clear the input
        const syntheticEvent = {
          target: { value: '' },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
    };

    return (
      <div className={cn('relative', className)}>
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pr-9 pl-9"
          disabled={disabled}
          onChange={onChange}
          placeholder={placeholder}
          ref={ref}
          value={value}
          {...props}
        />
        {showClearButton && value && (
          <Button
            className="-translate-y-1/2 absolute top-1/2 right-1 h-8 w-8 hover:bg-transparent"
            onClick={handleClear}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
