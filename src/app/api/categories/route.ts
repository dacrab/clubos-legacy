import { NextResponse, type NextRequest } from 'next/server';

import { checkAdminAccess } from '@/lib/action-utils';
import { stackServerApp } from '@/lib/auth';
import { createCategory, getCategories, getGroupedCategories } from '@/lib/db/services/categories';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const grouped = searchParams.get('grouped') === 'true';

    const categories = grouped ? await getGroupedCategories() : await getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    logger.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await checkAdminAccess();

    const categoryData = await request.json();
    const category = await createCategory({
      ...categoryData,
      createdBy: user.id,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    logger.error('Error creating category:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create category' },
      { status: 500 }
    );
  }
}
