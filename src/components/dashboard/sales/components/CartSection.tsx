"use client";

import { memo } from "react";
import { ChevronLeft, X, ShoppingCart, Tag, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { OrderItem } from "./OrderItem";
import { SALES_ICONS } from "@/lib/constants";
import type { OrderItem as OrderItemType } from "@/types/sales";


interface CartSectionProps {
    orderItems: OrderItemType[];
    onRemove: (id: string) => void;
    onTreatToggle: (id: string) => void;
    onDosageIncrease: (id: string) => void;
    subtotal: number;
    finalTotal: number;
    cardDiscountCount: number;
    onCardDiscountIncrease: () => void;
    onCardDiscountReset: () => void;
    onPayment: () => void;
    loading: boolean;
    onShowProducts?: () => void;
    isMobile?: boolean;
}

const CartSection = memo(({
    orderItems,
    onRemove,
    onTreatToggle,
    onDosageIncrease,
    subtotal,
    finalTotal,
    cardDiscountCount,
    onCardDiscountIncrease,
    onCardDiscountReset,
    onPayment,
    loading,
    onShowProducts,
    isMobile
}: CartSectionProps) => {
    return (
        <div className="h-full flex flex-col overflow-hidden bg-card w-full">
            <div className="flex items-center justify-between p-3 border-b flex-shrink-0">
                <div className="flex items-center gap-2">
                    {isMobile && onShowProducts && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={onShowProducts}
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <h3 className="font-bold">Παραγγελία</h3>
                </div>

                <Badge variant="outline" className="font-medium">
                    {orderItems.length} προϊόντα
                </Badge>
            </div>

            <ScrollArea className="flex-1 w-full">
                <div className="p-3 space-y-2 w-full">
                    {orderItems.map(item => (
                        <OrderItem
                            key={item.id}
                            item={item}
                            onRemove={onRemove}
                            onTreatToggle={onTreatToggle}
                            onDosageIncrease={onDosageIncrease}
                            subtotal={subtotal}
                            cardDiscountCount={cardDiscountCount}
                        />
                    ))}

                    {orderItems.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground w-full">
                            <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p>Δεν έχουν προστεθεί προϊόντα</p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            <div className="border-t p-3 space-y-3 bg-background w-full">
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Υποσύνολο:</span>
                        <span>{subtotal.toFixed(2)}€</span>
                    </div>

                    {cardDiscountCount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-1.5">
                                <span className="text-muted-foreground">Κουπόνι:</span>
                                <Badge variant="outline" className="text-xs">x{cardDiscountCount}</Badge>
                                {cardDiscountCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 text-destructive rounded-full"
                                        onClick={onCardDiscountReset}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                            <span className="text-destructive">-{(cardDiscountCount * 2).toFixed(2)}€</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between font-bold text-base pt-1">
                        <span>Σύνολο:</span>
                        <span>{finalTotal.toFixed(2)}€</span>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        {orderItems.filter(item => item.isTreat).length > 0 && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <Gift className="h-3.5 w-3.5" />
                                <span>{orderItems.filter(item => item.isTreat).length} κεράσματα</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <Button
                        variant="outline"
                        className="font-medium"
                        onClick={onCardDiscountIncrease}
                    >
                        <Tag className="h-4 w-4 mr-1.5" />
                        Κουπόνι
                    </Button>

                    <Button
                        variant="default"
                        className="font-medium"
                        onClick={onPayment}
                        disabled={loading || orderItems.length === 0}
                    >
                        <SALES_ICONS.EURO className="h-4 w-4 mr-1.5" />
                        Πληρωμή
                    </Button>
                </div>
            </div>
        </div>
    );
});
CartSection.displayName = 'CartSection';

export { CartSection }; 