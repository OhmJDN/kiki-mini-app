import { supabase } from '@/lib/supabase';

const SLIP_BUCKET = 'slips';
const MAX_SLIP_BYTES = 5 * 1024 * 1024;

/** Uploads a payment slip image to Supabase Storage and returns its public URL. */
export async function uploadSlip(file: File, userId: string): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('กรุณาเลือกไฟล์รูปภาพ');
  if (file.size > MAX_SLIP_BYTES) throw new Error('ไฟล์ใหญ่เกิน 5MB');

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext || 'jpg'}`;

  const { error } = await supabase.storage
    .from(SLIP_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  return supabase.storage.from(SLIP_BUCKET).getPublicUrl(path).data.publicUrl;
}
