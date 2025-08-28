import { Database } from "@/types/supabase";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import Image from "next/image";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LowStockCardProps {
  code: Database['public']['Tables']['codes']['Row'] & {
    category?: {
      id: string;
      name: string;
      description: string | null;
      created_at?: string;
      parent_id?: string | null;
    };
  };
}

export default function LowStockCard({ code }: LowStockCardProps) {
  const stockPercentage = (code.stock / LOW_STOCK_THRESHOLD) * 100;
  const getStockColor = () => {
    if (stockPercentage <= 30) return "text-destructive bg-destructive/10 hover:bg-destructive/20";
    if (stockPercentage <= 60) return "text-yellow-600 bg-yellow-100/80 hover:bg-yellow-100";
    return "text-primary bg-primary/10 hover:bg-primary/20";
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            {code.image_url ? (
              <div className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-md overflow-hidden border bg-white shrink-0">
                <Image
                  src={code.image_url}
                  alt={code.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 48px, 56px"
                />
              </div>
            ) : (
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 sm:h-7 sm:w-7 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium text-foreground text-md sm:text-lg truncate">{code.name}</p>
              <p className="text-sm text-muted-foreground truncate">
                {code.category?.name || 'Χωρίς κατηγορία'}
              </p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2 ml-3 shrink-0">
            <Badge variant="outline" className={cn(getStockColor(), "text-sm sm:text-md px-3 sm:px-4 py-1.5")}>
              {code.stock} τεμ.
            </Badge>
            <p className="text-sm text-muted-foreground">
              {code.price.toFixed(2)}€
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}