'use client';

import { Coffee, Euro, Gift, Trash2 } from 'lucide-react';
import type * as React from 'react';

import { Button } from '@/components/ui/button';
import { ProductImage } from '@/components/ui/product-image';
import { EXTRA_SHOT_PRICE } from '@/lib/constants';
import { cn } from '@/lib/utils/format';
import type { Database } from '@/types/supabase';

type Code = Database['public']['Tables']['products']['Row'] & {
  category?: Database['public']['Tables']['categories']['Row'] | null;
};

type OrderItemType = {
  id: string;
  code: Code;
  quantity: number;
  isTreat: boolean;
  dosageCount?: number;
};

// ------------------------------------------------------------
// Type Definitions
// ------------------------------------------------------------

type OrderItemProps = {
  item: OrderItemType;
  onRemove: (itemId: string) => void;
  onTreatToggle: (itemId: string) => void;
  onDosageIncrease: (itemId: string) => void;
  subtotal: number;
  cardDiscountCount: number;
};

type ActionButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant: 'primary' | 'destructive';
  active?: boolean;
  disabled?: boolean;
};

// ------------------------------------------------------------
// Action Button Component
// ------------------------------------------------------------

function ActionButton({
  icon,
  label,
  onClick,
  variant,
  active,
  disabled = false,
}: ActionButtonProps) {
  return (
    <Button
      className={cn(
        'flex h-10 items-center gap-1.5 transition-colors duration-150 portrait:h-11 portrait:px-3 landscape:px-2',
        variant === 'primary' && [
          active && 'bg-primary/10 text-primary',
          'text-muted-foreground hover:bg-primary hover:text-primary-foreground',
        ],
        variant === 'destructive' &&
          'text-destructive hover:bg-destructive hover:text-destructive-foreground',
        disabled && 'cursor-not-allowed opacity-50'
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
      variant="ghost"
    >
      {icon}
      <span className="font-bold text-sm landscape:hidden">{label}</span>
    </Button>
  );
}

// ------------------------------------------------------------
// Main Order Item Component
// ------------------------------------------------------------

export function OrderItem({ item, onRemove, onTreatToggle, onDosageIncrease }: OrderItemProps) {
  const { code, id, isTreat, dosageCount = 1 } = item;
  const { category, image_url, price, name } = code;

  const dosageExtraPerUnit = dosageCount > 1 ? (dosageCount - 1) * EXTRA_SHOT_PRICE : 0;
  const itemTotal = (price + dosageExtraPerUnit) * item.quantity;
  const isHotDrink = category?.name === 'Καφέδες & Ροφήματα';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md border bg-card shadow-xs',
        'mb-3 w-full transition-colors duration-150',
        isTreat && 'border-primary/20 bg-primary/5'
      )}
    >
      <div className="flex w-full sm:flex-row portrait:flex-row landscape:flex-row">
        <div className="min-w-0 flex-1 p-2 portrait:p-3">
          <div className="flex items-center gap-2 portrait:gap-3">
            {image_url ? (
              <ProductImage
                alt={name}
                className="h-10 w-10 shrink-0 rounded-md portrait:h-12 portrait:w-12"
                size="sm"
                src={image_url}
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/5 portrait:h-12 portrait:w-12">
                <span className="font-bold text-primary text-sm">
                  {name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}

            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 break-words font-bold text-sm">
                {name}
                {dosageCount > 1 && (
                  <span className="ml-1 font-bold text-primary text-xs">(x{dosageCount})</span>
                )}
              </h3>
              <div className="mt-1 flex items-center gap-1 text-sm">
                <Euro className="h-3.5 w-3.5" />
                <span className="font-bold">{isTreat ? '0.00' : itemTotal.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-1 sm:flex-col sm:border-t-0 sm:border-l sm:bg-muted/5 sm:p-2 sm:px-2 portrait:flex-row portrait:gap-3 portrait:border-l portrait:bg-muted/5 portrait:p-2 landscape:flex-row landscape:border-l landscape:bg-muted/5 landscape:p-1 landscape:px-1.5">
          {isHotDrink && (
            <ActionButton
              active={dosageCount > 1}
              icon={<Coffee className="h-4 w-4 portrait:h-5 portrait:w-5" />}
              label="Δόση"
              onClick={() => onDosageIncrease(id)}
              variant="primary"
            />
          )}

          <ActionButton
            active={isTreat}
            icon={<Gift className="h-4 w-4 portrait:h-5 portrait:w-5" />}
            label="Κερ/σμα"
            onClick={() => onTreatToggle(id)}
            variant="primary"
          />

          <ActionButton
            icon={<Trash2 className="h-4 w-4 portrait:h-5 portrait:w-5" />}
            label="Δια/φή"
            onClick={() => onRemove(id)}
            variant="destructive"
          />
        </div>
      </div>
    </div>
  );
}
