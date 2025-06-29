import { 
  errorResponse, 
  successResponse, 
  handleApiError 
} from '@/lib/api-utils';
import { createServerSupabase } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return errorResponse('Απαιτείται αρχείο εικόνας.', 400);
    }

    // Έλεγχος τύπου αρχείου
    if (!(file as File).type.startsWith('image/')) {
      return errorResponse('Μη έγκυρος τύπος αρχείου εικόνας.', 400);
    }

    // Έλεγχος μεγέθους αρχείου (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return errorResponse('Το αρχείο εικόνας είναι πολύ μεγάλο (μέγιστο 5MB).', 400);
    }

    // Μετατροπή σε ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Δημιουργία μοναδικού ονόματος αρχείου
    const fileExt = (file as File).name.split('.').pop();
    const uniqueId = Math.random().toString(36).substring(2);
    const fileName = `product-images/new-${uniqueId}.${fileExt}`;

    // Αποθήκευση στο Supabase
    const supabase = await createServerSupabase();
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(fileName, fileBuffer, {
        contentType: (file as File).type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      return errorResponse('Σφάλμα κατά τη μεταφόρτωση της εικόνας.', 500);
    }

    // Λήψη δημόσιου URL
    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(fileName);

    return successResponse({ url: data?.publicUrl });
  } catch (error) {
    return handleApiError(error);
  }
}
