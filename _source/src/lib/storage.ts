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
  if (!objectKey) return '';
  // If it already uses the configured CDN base
  if (objectKey.startsWith(CDN_BASE_URL)) {
    return objectKey;
  }
  // If it's a direct Backblaze B2 public URL, rewrite to CDN URL to leverage Cloudflare caching
  const b2Match = objectKey.match(/https?:\/\/[^\/]+\/file\/[^\/]+\/(.+)/);
  if (b2Match && b2Match[1]) {
    return `${CDN_BASE_URL}/${b2Match[1]}`;
  }
  // If already an absolute http/https URL that is not Backblaze
  if (objectKey.startsWith('http://') || objectKey.startsWith('https://')) {
    return objectKey;
  }
  // Otherwise append path to CDN_BASE_URL
  return `${CDN_BASE_URL}/${objectKey.replace(/^\/+/, '')}`;
}

/**
 * Downloads a single photo directly without compression
 */
export async function downloadDirectPhoto(url: string, filename: string): Promise<void> {
  const cdnUrl = getCdnUrl(url);
  try {
    const res = await fetch(cdnUrl, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'foto-sambabrasil.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);
  } catch (err) {
    // Direct anchor fallback
    const link = document.createElement('a');
    link.href = cdnUrl;
    link.download = filename || 'foto-sambabrasil.jpg';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
