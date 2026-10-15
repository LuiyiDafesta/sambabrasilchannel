/**
 * Helper to upload files via the PHP proxy endpoint on Ferozo
 * and resolve URLs via the Cloudflare CDN
 */

export const CDN_BASE_URL = import.meta.env.VITE_CDN_URL || 'https://cdn.sambabrasilchannel.com.ar';
export const UPLOAD_API = import.meta.env.VITE_UPLOAD_API || '/upload_b2.php';

export interface UploadResult {
  success: boolean;
  url?: string;
  object_key?: string;
  filename?: string;
  mime?: string;
  size?: number;
  error?: string;
}

export async function uploadImage(file: File, folder: string = 'gallery'): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch(UPLOAD_API, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error || `Error ${response.status}: Error al subir imagen`);
  }

  return response.json();
}

export function getCdnUrl(objectKey: string): string {
  if (objectKey.startsWith('http://') || objectKey.startsWith('https://')) {
    return objectKey;
  }
  return `${CDN_BASE_URL}/${objectKey.replace(/^\/+/, '')}`;
}
