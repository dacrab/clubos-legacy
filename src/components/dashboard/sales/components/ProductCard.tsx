import * as React from 'react';
import Image from 'next/image';

import type { Product } from '@/types/sales';
import { SALES_ICONS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  className?: string;
}

export function ProductCard({ product, onClick, className }: ProductCardProps) {
  const { imageUrl, name, price, category } = product;
  const hasImage = !!imageUrl;

  return (
    <button
      onClick={() => onClick(product)}
      className={cn(
        'bg-card relative flex h-full flex-col overflow-hidden rounded-md border p-3',
        'hover:border-primary focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-hidden',
        'sm:aspect-auto portrait:aspect-square landscape:aspect-auto',
        className
      )}
    >
      {/* Price Badge */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-primary text-primary-foreground flex items-center gap-0.5 rounded-full px-2 py-1 text-sm font-medium">
          <SALES_ICONS.EURO className="h-3.5 w-3.5" />
          {parseFloat(price).toFixed(2)}
        </div>
      </div>

      {/* Image or Name Display */}
      <div className="my-2 flex w-full flex-1 items-center justify-center">
        {hasImage ? (
          <div className="relative h-24 w-24 md:h-28 md:w-28">
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(max-width: 768px) 96px, 112px"
              className="object-contain"
              quality={80}
            />
          </div>
        ) : (
          <p className="line-clamp-3 text-center font-bold break-words portrait:text-lg landscape:text-base">
            {name}
          </p>
        )}
      </div>

      {/* Category and Name Display (if image exists) */}
      {hasImage && (
        <div className="mt-2 text-center">
          <p className="line-clamp-2 text-sm font-bold break-words">{name}</p>
          {category?.name && (
            <p className="text-muted-foreground line-clamp-1 text-xs opacity-80">{category.name}</p>
          )}
        </div>
      )}
    </button>
  );
}
