import { NextResponse, type NextRequest } from 'next/server';

import { checkAdminAccess } from '@/lib/action-utils';
import { stackServerApp } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';
import { getSaleById, updateSale, deleteSale } from '@/lib/db/services/sales';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ saleId: string }> }
) {
  const { saleId } = await params;
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sale = await getSaleById(saleId);
    if (!sale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    return NextResponse.json(sale);
  } catch (error) {
    logger.error('Error fetching sale:', error);
    return NextResponse.json({ error: 'Failed to fetch sale' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ saleId: string }> }
) {
  const { saleId } = await params;
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can update sales
    await checkAdminAccess();

    const updateData = await request.json();
    const updatedSale = await updateSale(saleId, updateData);

    if (!updatedSale) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    return NextResponse.json(updatedSale);
  } catch (error) {
    logger.error('Error updating sale:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update sale' }, 
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ saleId: string }> }
) {
  const { saleId } = await params;
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can delete sales
    await checkAdminAccess();

    const success = await deleteSale(saleId);
    
    if (!success) {
      return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting sale:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete sale' }, 
      { status: 500 }
    );
  }
}
