import { Package } from 'lucide-react';

import { ProductImage } from './product-image';

type CodeImageProps = {
  imageUrl: string | null;
  code: string;
  size?: 'sm' | 'md' | 'lg';
};

export function CodeImage({ imageUrl, code, size = 'sm' }: CodeImageProps) {
  if (imageUrl) {
    return <ProductImage alt={code} className="md:h-12 md:w-12" size={size} src={imageUrl} />;
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted md:h-12 md:w-12">
      <Package className="h-5 w-5 text-muted-foreground md:h-6 md:w-6" />
    </div>
  );
}
