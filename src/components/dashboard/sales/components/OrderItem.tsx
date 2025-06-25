"use client";

import * as React from "react";
import { Coffee, Gift, Trash2, Euro } from "lucide-react";
import { OrderItem as OrderItemType } from "@/types/sales";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/ui/product-image";
import { cn } from "@/lib/utils";
import { EXTRA_SHOT_PRICE } from "@/lib/constants";

// ------------------------------------------------------------
// Type Definitions
// ------------------------------------------------------------

interface OrderItemProps {
  item: OrderItemType;
  onRemove: (itemId: string) => void;
  onTreatToggle: (itemId: string) => void;
  onDosageIncrease: (itemId: string) => void;
  subtotal: number;
  cardDiscountCount: number;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant: 'primary' | 'destructive';
  active?: boolean;
}

// ------------------------------------------------------------
// Action Button Component
// ------------------------------------------------------------

function ActionButton({ icon, label, onClick, variant, active }: ActionButtonProps) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "h-10 portrait:h-11 portrait:px-3 landscape:px-2 flex items-center gap-1.5 transition-colors duration-150",
        variant === 'primary' && [
          active && "bg-primary/10 text-primary",
          "text-muted-foreground hover:text-primary-foreground hover:bg-primary"
        ],
        variant === 'destructive' && "text-destructive hover:text-destructive-foreground hover:bg-destructive"
      )}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-bold landscape:hidden">{label}</span>
    </Button>
  );
}

// ------------------------------------------------------------
// Main Order Item Component
// ------------------------------------------------------------

export function OrderItem({
  item,
  onRemove,
  onTreatToggle,
  onDosageIncrease
}: OrderItemProps) {
  if (!item.code) return null;

  const { code, id, isTreat, dosageCount = 1 } = item;
  const { category, image_url, price } = code;

  const dosageExtra = dosageCount > 1 ? (dosageCount - 1) * EXTRA_SHOT_PRICE : 0;
  const itemTotal = ((price || 0) + dosageExtra) * item.quantity;
  const isHotDrink = category?.name === "Καφέδες & Ροφήματα";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border bg-card shadow-sm",
        "mb-3 transition-colors duration-150 w-full",
        isTreat && "bg-primary/5 border-primary/20"
      )}
    >
      <div className="flex portrait:flex-row landscape:flex-row sm:flex-row w-full">
        <div className="flex-1 p-2 portrait:p-3 min-w-0">
          <div className="flex items-center gap-2 portrait:gap-3">
            {image_url ? (
              <ProductImage
                src={image_url}
                alt={code.name}
                size="sm"
                className="h-10 w-10 portrait:h-12 portrait:w-12 rounded-md flex-shrink-0"
              />
            ) : (
              <div className="h-10 w-10 portrait:h-12 portrait:w-12 flex items-center justify-center rounded-md bg-primary/5 flex-shrink-0">
                <span className="text-sm font-bold text-primary">{code.name.substring(0, 2).toUpperCase()}</span>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold line-clamp-2 break-words">
                {code.name}
                {dosageCount > 1 && (
                  <span className="ml-1 text-xs text-primary font-bold">
                    (x{dosageCount})
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1 text-sm mt-1">
                <Euro className="h-3.5 w-3.5" />
                <span className="font-bold">
                  {isTreat ? '0.00' : itemTotal.toFixed(2)}€
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex portrait:flex-row landscape:flex-row sm:flex-col justify-between items-center gap-1 portrait:gap-3 portrait:p-2 landscape:p-1 sm:p-2 portrait:border-l landscape:border-l sm:border-t-0 sm:border-l portrait:bg-muted/5 landscape:bg-muted/5 sm:bg-muted/5 landscape:px-1.5 sm:px-2 flex-shrink-0">
          {isHotDrink && (
            <ActionButton
              icon={<Coffee className="h-4 w-4 portrait:h-5 portrait:w-5" />}
              label="Δόση"
              onClick={() => onDosageIncrease(id)}
              variant="primary"
              active={dosageCount > 1}
            />
          )}

          <ActionButton
            icon={<Gift className="h-4 w-4 portrait:h-5 portrait:w-5" />}
            label="Κερ/σμα"
            onClick={() => onTreatToggle(id)}
            variant="primary"
            active={isTreat}
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