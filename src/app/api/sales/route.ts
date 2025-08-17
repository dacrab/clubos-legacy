import { NextResponse, type NextRequest } from 'next/server';

import { stackServerApp } from '@/lib/auth';
import { logger } from '@/lib/utils/logger';
import { getSales, createSale } from '@/lib/db/services/sales';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');
    const paymentMethod = searchParams.get('paymentMethod');

    const sales = await getSales({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      category: category || undefined,
      paymentMethod: (paymentMethod as string | undefined) || undefined,
    });

    return NextResponse.json(sales);
  } catch (error) {
    logger.error('Error fetching sales:', error);
    return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const saleData = await request.json();
    const sale = await createSale({
      ...saleData,
      createdBy: user.id,
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    logger.error('Error creating sale:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create sale' }, 
      { status: 500 }
    );
  }
}
