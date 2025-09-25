import { Package } from 'lucide-react';

import { ProductImage } from './product-image';

type ProductAvatarProps = {
  imageUrl: string | null;
  productName: string;
  size?: 'sm' | 'md' | 'lg';
};

export function ProductAvatar({ imageUrl, productName, size = 'sm' }: ProductAvatarProps) {
  if (imageUrl) {
    return (
      <ProductImage alt={productName} className="md:h-12 md:w-12" size={size} src={imageUrl} />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted md:h-12 md:w-12">
      <Package className="h-5 w-5 text-muted-foreground md:h-6 md:w-6" />
    </div>
  );
}
