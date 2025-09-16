import { createApiClient, errorResponse, handleApiError, successResponse } from '@/lib/api-utils';
import { API_ERROR_MESSAGES } from '@/lib/constants';

const BYTES_IN_A_KILOBYTE = 1024;
const KILOBYTES_IN_A_MEGABYTE = 1024;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * KILOBYTES_IN_A_MEGABYTE * BYTES_IN_A_KILOBYTE; // 5MB

const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;
const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file && file instanceof Blob)) {
      return errorResponse(API_ERROR_MESSAGES.MISSING_REQUIRED_FIELDS, HTTP_STATUS_BAD_REQUEST);
    }

    // Validate file type
    if (!(file as File).type.startsWith('image/')) {
      return errorResponse(API_ERROR_MESSAGES.INVALID_IMAGE_TYPE, HTTP_STATUS_BAD_REQUEST);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(API_ERROR_MESSAGES.IMAGE_TOO_LARGE, HTTP_STATUS_BAD_REQUEST);
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Generate unique filename
    const explicitExt = (file as File).name.includes('.')
      ? (file as File).name.split('.').pop() || ''
      : '';
    const mimeExt = MIME_TO_EXT[(file as File).type] || explicitExt || 'bin';
    const RANDOM_STRING_LENGTH = 2;
    const BASE_36_RADIX = 36;
    const uniqueId = (globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(BASE_36_RADIX).slice(RANDOM_STRING_LENGTH)}`) as string;
    const fileName = `new-${uniqueId}.${mimeExt}`;

    // Upload to Supabase
    const supabase = await createApiClient();
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, fileBuffer, {
        contentType: (file as File).type,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      return errorResponse(
        API_ERROR_MESSAGES.UPLOAD_ERROR,
        HTTP_STATUS_INTERNAL_SERVER_ERROR,
        uploadError
      );
    }

    // Get the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('product-images').getPublicUrl(fileName);

    return successResponse({ url: publicUrl });
  } catch (error) {
    return handleApiError(error);
  }
}
