import { UNLIMITED_CATEGORY_ID } from '@/lib/constants';

export const hasUnlimitedStock = (categoryId: string | null | undefined) => {
  return categoryId === UNLIMITED_CATEGORY_ID;
};
