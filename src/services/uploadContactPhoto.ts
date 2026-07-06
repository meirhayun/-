import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config';

const BUCKET = 'contact-photos';

function getExtension(photo: File): string {
  if (photo.type === 'image/png') return 'png';
  if (photo.type === 'image/webp') return 'webp';
  if (photo.type === 'image/gif') return 'gif';
  return 'jpg';
}

async function compressPhoto(photo: File): Promise<File> {
  if (photo.size <= 500_000 || !photo.type.startsWith('image/') || photo.type === 'image/gif') {
    return photo;
  }

  try {
    const bitmap = await createImageBitmap(photo);
    const maxEdge = 1600;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return photo;

    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/jpeg', 0.85);
    });

    if (!blob) return photo;

    return new File([blob], 'photo-maakom.jpg', { type: 'image/jpeg' });
  } catch {
    return photo;
  }
}

/** מעלה תמונה מהטופס ל-Supabase ומחזיר קישור ציבורי. */
export async function uploadContactPhoto(photo: File): Promise<string> {
  const compressed = await compressPhoto(photo);
  const ext = getExtension(compressed);
  const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const path = `quotes/${fileName}`;

  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': compressed.type || 'image/jpeg',
      'x-upsert': 'false',
    },
    body: compressed,
  });

  if (!response.ok) {
    throw new Error('upload_failed');
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}
