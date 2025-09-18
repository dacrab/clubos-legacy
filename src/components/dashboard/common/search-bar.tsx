import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type SearchBarProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
};

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = 'Αναζήτηση...',
  className = '' 
}: SearchBarProps) {
  return (
    <div className={`relative flex-1 ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
      <Input
        className="w-full pl-9"
        onChange={onChange}
        placeholder={placeholder}
        value={value}
      />
    </div>
  );
}
