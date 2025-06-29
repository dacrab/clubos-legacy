import { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Euro, CreditCard, Gift, ChevronDown, ChevronUp } from "lucide-react";
import { formatDateWithGreekAmPm, formatPrice, cn } from '@/lib/utils';
import { ClosingDetails } from "./ClosingDetails";
import { 
  ListItem,
  ActiveSessionTotals,
} from '@/types/register';
import { CARD_DISCOUNT } from "@/lib/constants";
import { calculateActiveSessionTotals, calculateTransactionTotals } from "@/lib/utils/registerUtils";
import { Button } from "@/components/ui/button";

// Type Definitions
interface TransactionSummaryProps {
  finalAmount: number;
  discountCount: number;
  treatsCount: number;
  treatsAmount: number;
}

interface RegisterItemCardProps {
  item: ListItem;
  isExpanded: boolean;
  onToggle: (id: string) => void;
}

interface SummaryItemProps {
  label: string;
  value: string;
  subValue?: string;
  subValueClassname?: string;
  icon: React.ReactNode;
}

// Memoized components for better performance
const SummaryItem = memo(function SummaryItem({ 
  label, 
  value, 
  subValue, 
  subValueClassname, 
  icon 
}: SummaryItemProps) {
  return (
    <div className="flex flex-col gap-1 items-center justify-center min-w-16 sm:min-w-24">
      <span className="flex items-center gap-1 text-muted-foreground text-xs">
        {icon}
        {label}
      </span>
      <div className="flex flex-col items-center">
        <span className="text-sm sm:text-md font-semibold">{value}</span>
        {subValue && (
          <span className={`text-xs ${subValueClassname}`}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
});

const TransactionSummary = memo(function TransactionSummary({ 
  finalAmount, 
  discountCount, 
  treatsCount, 
  treatsAmount 
}: TransactionSummaryProps) {
  const discountAmount = +(discountCount * CARD_DISCOUNT).toFixed(2);
  const actualFinalAmount = Math.max(0, +(finalAmount - discountAmount).toFixed(2));
  
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2 mt-2">
      <SummaryItem 
        label="Τελικό Ποσό" 
        value={formatPrice(actualFinalAmount)} 
        icon={<Euro className="h-3 w-3 text-green-500" />} 
      />
      <SummaryItem 
        label="Κουπόνια" 
        value={`${discountCount}x`} 
        subValue={discountCount > 0 ? `-${formatPrice(discountAmount)}` : undefined} 
        subValueClassname="text-red-500" 
        icon={<CreditCard className="h-3 w-3 text-blue-500" />} 
      />
      <SummaryItem 
        label="Κεράσματα" 
        value={`${treatsCount}x`} 
        subValue={treatsCount > 0 ? formatPrice(treatsAmount) : undefined} 
        subValueClassname="text-green-500" 
        icon={<Gift className="h-3 w-3 text-red-500" />} 
      />
    </div>
  );
});

// Main component with optimization
function RegisterItemCard({ item, isExpanded, onToggle }: RegisterItemCardProps) {
  const isActive = item.type === 'active';
  const id = isActive ? item.id : item.session.id;
  const date = new Date(isActive ? item.opened_at : item.created_at);
  
  // Use memoized calculations to prevent unnecessary recalculations
  const itemTotals = useMemo(() => {
    if (isActive) {
      return calculateActiveSessionTotals(item.orders) || { 
        totalBeforeDiscounts: 0, 
        cardDiscounts: 0, 
        treats: 0, 
        treatsAmount: 0 
      } as ActiveSessionTotals;
    }
    return item.orders && item.orders.length 
      ? calculateTransactionTotals(item.orders) 
      : { 
          totalBeforeDiscounts: 0, 
          cardDiscounts: 0, 
          discount: 0, 
          treats: 0, 
          treatsAmount: 0 
        };
  }, [item, isActive]);
  
  const handleToggle = () => onToggle(id);
  
  return (
    <Card className={cn(
      "p-3 sm:p-4 transition-colors w-full",
      isActive && "border-primary/20",
      isExpanded && "bg-muted/50"
    )}>
      <div 
        className="flex flex-col sm:flex-row sm:items-center justify-between cursor-pointer"
        onClick={handleToggle}
      >
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
            <div className="flex items-center gap-2">
              <Badge variant={isActive ? "outline" : "secondary"} className={isActive ? "border-primary text-primary" : ""}>
                {isActive ? "Ενεργό Ταμείο" : `Έκλεισε από: ${item.closed_by_name}`}
              </Badge>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">{formatDateWithGreekAmPm(date)}</span>
          </div>
          
          <TransactionSummary 
            finalAmount={itemTotals.totalBeforeDiscounts}
            discountCount={itemTotals.cardDiscounts || 0}
            treatsCount={itemTotals.treats || 0}
            treatsAmount={itemTotals.treatsAmount || 0}
          />
        </div>
        
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 sm:relative sm:right-auto sm:top-auto sm:transform-none sm:ml-4">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {isExpanded && (
        <ClosingDetails
          session={isActive ? item : item.session}
          closing={isActive ? null : item}
          orders={item.orders}
        />
      )}
    </Card>
  );
}

// Export a memoized version to prevent unnecessary re-renders
export default memo(RegisterItemCard); 