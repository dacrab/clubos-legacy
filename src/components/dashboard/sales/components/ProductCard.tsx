
import { Code } from "@/types/sales";
import { SALES_ICONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import * as React from "react";
import Image from "next/image";

interface ProductCardProps {
  code: Code;
  onClick: (code: Code) => void;
  className?: string;
}

export function ProductCard({ code, onClick, className }: ProductCardProps) {
  const { image_url, name, price, category } = code;
  const hasImage = !!image_url;

  return (
    <button
      onClick={() => onClick(code)}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-md border bg-card p-3 h-full",
        "hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "portrait:aspect-square landscape:aspect-auto sm:aspect-auto",
        className
      )}
    >
      {/* Price Badge */}
      <div className="absolute top-2 right-2 z-10">
        <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-primary text-primary-foreground text-sm font-medium">
          <SALES_ICONS.EURO className="h-3.5 w-3.5" />
          {price.toFixed(2)}
        </div>
      </div>

      {/* Image or Name Display */}
      <div className="flex-1 flex items-center justify-center w-full my-2">
        {hasImage ? (
          <div className="relative h-24 w-24 md:h-28 md:w-28">
            <Image
              src={image_url}
              alt={name}
              fill
              sizes="(max-width: 768px) 96px, 112px"
              className="object-contain"
              quality={80}
            />
          </div>
        ) : (
          <p className="font-bold portrait:text-lg landscape:text-base text-center line-clamp-3 break-words">
            {name}
          </p>
        )}
      </div>

      {/* Category and Name Display (if image exists) */}
      {hasImage && (
        <div className="text-center mt-2">
          <p className="font-bold text-sm line-clamp-2 break-words">{name}</p>
          {category?.name && (
            <p className="text-xs text-muted-foreground line-clamp-1 opacity-80">
              {category.name}
            </p>
          )}
        </div>
      )}
    </button>
  );
}