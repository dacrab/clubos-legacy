import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

import type { NextRequest } from 'next/server';

import { 
  errorResponse, 
  successResponse, 
  handleApiError 
} from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return errorResponse('Απαιτείται αρχείο εικόνας.', 400);
    }

    // Έλεγχος τύπου αρχείου
    if (!file.type.startsWith('image/')) {
      return errorResponse('Μη έγκυρος τύπος αρχείου εικόνας.', 400);
    }

    // Έλεγχος μεγέθους αρχείου (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse('Το αρχείο εικόνας είναι πολύ μεγάλο (μέγιστο 5MB).', 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    
    // Save file
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);
    
    // Return the public URL
    const publicUrl = `/uploads/${fileName}`;
    
    return successResponse({ 
      url: publicUrl,
      originalName: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    (await import('@/lib/utils/logger')).logger.error('File upload error:', error);
    return handleApiError(error);
  }
}
