import { NextResponse, type NextRequest } from 'next/server';

import { checkAdminAccess } from '@/lib/action-utils';
import { stackServerApp } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';
import { getProductById, updateProduct, deleteProduct, checkProductHasSales } from '@/lib/db/services/products';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const product = await getProductById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    logger.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkAdminAccess();

    const updateData = await request.json();
    const updatedProduct = await updateProduct(productId, updateData);

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    logger.error('Error updating product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update product' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkAdminAccess();

    // Check for sales using this product before deleting
    const hasSales = await checkProductHasSales(productId);
    if (hasSales) {
      return NextResponse.json(
        { error: 'Δεν μπορεί να διαγραφεί το προϊόν διότι έχει σχετικές πωλήσεις.' }, 
        { status: 400 }
      );
    }

    const success = await deleteProduct(productId);
    
    if (!success) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete product' }, 
      { status: 500 }
    );
  }
}
