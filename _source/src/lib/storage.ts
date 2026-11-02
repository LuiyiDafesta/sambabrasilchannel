/**
 * Helper to upload files via the PHP proxy endpoint on Ferozo
 * and resolve URLs via the Cloudflare CDN
 */

export const CDN_BASE_URL = import.meta.env.VITE_CDN_URL || 'https://cdn.sambabrasilchannel.com.ar';
export const UPLOAD_API = import.meta.env.VITE_UPLOAD_API || '/upload_b2.php';
export const DELETE_API = import.meta.env.VITE_DELETE_API || '/delete_b2.php';

export interface UploadResult {
  success: boolean;
  url?: string;
  object_key?: string;
  filename?: string;
  mime?: string;
  size?: number;
  error?: string;
}

export async function deleteImage(urlOrKey: string): Promise<boolean> {
  if (!urlOrKey) return false;
  try {
    const response = await fetch(DELETE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: urlOrKey }),
    });
    if (!response.ok) {
      console.warn(`[Storage] Failed to delete image ${urlOrKey}: HTTP ${response.status}`);
      return false;
    }
    const data = await response.json().catch(() => ({}));
    return !!data.success;
  } catch (err) {
    console.warn(`[Storage] Error deleting image from B2/storage:`, err);
    return false;
  }
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
  // If blob or data URI, return as-is
  if (objectKey.startsWith('blob:') || objectKey.startsWith('data:')) {
    return objectKey;
  }
  // Otherwise append path to CDN_BASE_URL
  return `${CDN_BASE_URL}/${objectKey.replace(/^\/+/, '')}`;
}

/**
 * Helper to get a proxy URL for downloading/fetching remote photos with CORS
 */
export function getDownloadProxyUrl(url: string, filename?: string, download: boolean = false): string {
  const cdnUrl = getCdnUrl(url);
  // If already a same-origin relative URL or blob/data, return as-is
  if (cdnUrl.startsWith('/') && !cdnUrl.startsWith('//')) {
    return cdnUrl;
  }
  if (cdnUrl.startsWith('blob:') || cdnUrl.startsWith('data:')) {
    return cdnUrl;
  }
  const params = new URLSearchParams();
  params.set('url', cdnUrl);
  if (filename) params.set('filename', filename);
  if (download) params.set('download', '1');
  return `/download_photo.php?${params.toString()}`;
}

/**
 * Downloads a single photo directly without compression
 */
export async function downloadDirectPhoto(url: string, filename: string): Promise<void> {
  const cdnUrl = getCdnUrl(url);
  const proxyUrl = getDownloadProxyUrl(cdnUrl, filename, true);

  try {
    // 1. Fetch via same-origin proxy (avoids cross-origin CORS restriction)
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'foto-sambabrasil.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
  } catch (err) {
    console.warn('[Direct Download] Proxy fetch error, triggering attachment download:', err);
    // 2. Direct browser trigger of proxy download endpoint (forces Content-Disposition: attachment)
    const link = document.createElement('a');
    link.href = proxyUrl;
    link.download = filename || 'foto-sambabrasil.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
