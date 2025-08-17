import Image from "next/image";

import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8",
  md: "h-16 w-16",
  lg: "h-40 w-full"
};

const imageSizes = {
  sm: "32px",
  md: "64px",
  lg: "400px"
};

export function ProductImage({ src, alt, size = "md", className }: ProductImageProps) {
  const containerClasses = cn(
    "relative",
    sizes[size],
    className
  );

  return (
    <div className={containerClasses}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain rounded-md"
        sizes={imageSizes[size]}
        quality={90}
        priority={size === "lg"}
      />
    </div>
  );
} 