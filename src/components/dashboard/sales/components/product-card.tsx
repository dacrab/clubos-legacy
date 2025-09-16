import { Euro } from 'lucide-react';

import { ProductImage } from '@/components/ui/product-image';
import { cn } from '@/lib/utils/format';
import type { Database } from '@/types/supabase';

type Code = Database['public']['Tables']['products']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'] | null;
};

type ProductCardProps = {
  product: Code;
  onClick: (product: Code) => void;
  className?: string;
};

export function ProductCard({ product, onClick, className }: ProductCardProps) {
  const { image_url, name, price } = product;
  const hasImage = Boolean(image_url);

  const handleClick = () => {
    onClick(product);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      aria-label={`Προσθήκη ${name} στην παραγγελία`}
      className={cn(
        'group relative block w-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      type="button"
    >
      {/* Price Badge */}
      <div className="absolute top-2 right-2 z-10 flex items-center justify-center rounded-full bg-primary p-2 font-semibold text-primary-foreground text-xs">
        <Euro className="mr-1 h-3 w-3" />
        {price.toFixed(2)}
      </div>

      {/* Product Image */}
      <div className="aspect-square overflow-hidden">
        {hasImage ? (
          <ProductImage alt={name} src={image_url || ''} />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted/50">
            <span className="font-bold text-lg text-muted-foreground">
              {name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Product Name */}
      <div className="p-3">
        <h3 className="line-clamp-2 font-semibold text-sm">{name}</h3>
      </div>
    </button>
  );
}
