import { Package } from "lucide-react";
import { ProductImage } from "./product-image";

interface CodeImageProps {
  imageUrl: string | null;
  code: string;
  size?: "sm" | "md" | "lg";
}

export function CodeImage({ imageUrl, code, size = "sm" }: CodeImageProps) {
  if (imageUrl) {
    return (
      <ProductImage
        src={imageUrl}
        alt={code}
        size={size}
        className="md:h-12 md:w-12"
      />
    );
  }

  return (
    <div className="w-10 h-10 md:w-12 md:h-12 bg-muted rounded-md flex items-center justify-center shrink-0">
      <Package className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
    </div>
  );
} 