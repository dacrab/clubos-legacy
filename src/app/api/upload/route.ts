import { NextResponse } from 'next/server';
import { API_ERROR_MESSAGES } from '@/lib/constants';
import { 
  createApiClient, 
  errorResponse, 
  successResponse, 
  handleApiError 
} from '@/lib/api-utils';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    console.log('Starting file upload process...');

    const formData = await request.formData();
    const file = formData.get('file');
    
    console.log('Received file:', {
      type: file ? (file as any).type : 'no file',
      size: file ? (file as any).size : 0,
      constructor: file ? file.constructor.name : 'no file'
    });

    if (!file || !(file instanceof Blob)) {
      console.error('Invalid file received');
      return errorResponse(API_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, 400);
    }

    // Validate file type
    if (!(file as File).type.startsWith('image/')) {
      console.error('Invalid file type:', (file as File).type);
      return errorResponse(API_ERROR_MESSAGES.INVALID_IMAGE_TYPE, 400);
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('File too large:', file.size);
      return errorResponse(API_ERROR_MESSAGES.IMAGE_TOO_LARGE, 400);
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Generate unique filename
    const fileExt = (file as File).name.split('.').pop();
    const uniqueId = Math.random().toString(36).substring(2);
    const fileName = `product-images/new-${uniqueId}.${fileExt}`;

    console.log('Attempting upload with:', {
      fileName,
      fileSize: file.size,
      fileType: (file as File).type,
      bucketName: 'products',
      folder: 'product-images'
    });

    // Upload to Supabase
    const supabase = await createApiClient();
    const { data, error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, fileBuffer, {
        contentType: (file as File).type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', {
        message: uploadError.message,
        name: uploadError.name
      });
      return errorResponse(API_ERROR_MESSAGES.UPLOAD_ERROR, 500, uploadError);
    }

    console.log('Upload successful:', data);

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    console.log('Generated public URL:', publicUrl);

    return successResponse({ url: publicUrl });
  } catch (error) {
    return handleApiError(error);
  }
}
