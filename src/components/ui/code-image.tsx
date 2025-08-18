import { Package } from 'lucide-react';

import { ProductImage } from './product-image';

interface CodeImageProps {
  imageUrl: string | null;
  code: string;
  size?: 'sm' | 'md' | 'lg';
}

export function CodeImage({ imageUrl, code, size = 'sm' }: CodeImageProps) {
  if (imageUrl) {
    return <ProductImage src={imageUrl} alt={code} size={size} className="md:h-12 md:w-12" />;
  }

  return (
    <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-md md:h-12 md:w-12">
      <Package className="text-muted-foreground h-5 w-5 md:h-6 md:w-6" />
    </div>
  );
}
