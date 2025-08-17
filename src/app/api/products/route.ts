import { NextResponse, type NextRequest } from 'next/server';

import { checkAdminAccess } from '@/lib/action-utils';
import { stackServerApp } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';
import { getProducts, createProduct } from '@/lib/db/services/products';

export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    logger.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkAdminAccess();

    const productData = await request.json();
    const product = await createProduct({
      ...productData,
      createdBy: user.id,
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    logger.error('Error creating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create product' }, 
      { status: 500 }
    );
  }
}
