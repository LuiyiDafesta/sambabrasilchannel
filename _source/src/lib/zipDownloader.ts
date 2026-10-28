import JSZip from 'jszip';
import { getCdnUrl, downloadDirectPhoto } from './storage';
import { Fotografia } from '../types';

export interface DownloadProgress {
  current: number;
  total: number;
  percent: number;
  statusText: string;
  isCompleted: boolean;
  isError: boolean;
  errorMessage?: string;
}

/**
 * Creates and downloads a ZIP package containing the selected photos
 * while reporting sequential progress for each photo added.
 */
export async function downloadPhotosAsZip(
  photos: Fotografia[],
  zipFilename: string,
  onProgress: (progress: DownloadProgress) => void,
  abortSignal?: AbortSignal
): Promise<void> {
  const total = photos.length;
  if (total === 0) return;

  const zip = new JSZip();
  const folder = zip.folder(zipFilename.replace(/\.zip$/i, '')) || zip;

  for (let i = 0; i < total; i++) {
    if (abortSignal?.aborted) {
      throw new Error('Descarga cancelada por el usuario');
    }

    const photo = photos[i];
    const currentIndex = i + 1;
    const progressPercent = Math.round((i / total) * 85); // 0% to 85% for downloading

    onProgress({
      current: currentIndex,
      total,
      percent: progressPercent,
      statusText: `Obteniendo foto ${currentIndex} de ${total}...`,
      isCompleted: false,
      isError: false,
    });

    try {
      const cdnUrl = getCdnUrl(photo.url);
      const res = await fetch(cdnUrl, {
        signal: abortSignal,
        mode: 'cors',
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const safeFilename = photo.filename || `foto-${currentIndex}.jpg`;
      folder.file(safeFilename, blob);
    } catch (err: any) {
      if (abortSignal?.aborted) {
        throw new Error('Descarga cancelada por el usuario');
      }
      console.warn(`[ZIP Downloader] Error fetching photo ${photo.id}:`, err);
      // Fallback: create placeholder or continue so zip doesn't fail completely
    }
  }

  // Compression Phase (85% to 100%)
  onProgress({
    current: total,
    total,
    percent: 90,
    statusText: 'Comprimiendo fotos en archivo .ZIP...',
    isCompleted: false,
    isError: false,
  });

  const zipContent = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      const zipPercent = 90 + Math.round((metadata.percent / 100) * 9);
      onProgress({
        current: total,
        total,
        percent: Math.min(99, zipPercent),
        statusText: `Generando archivo ZIP (${Math.round(metadata.percent)}%)...`,
        isCompleted: false,
        isError: false,
      });
    }
  );

  // Trigger browser download of ZIP file
  const blobUrl = URL.createObjectURL(zipContent);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);

  onProgress({
    current: total,
    total,
    percent: 100,
    statusText: '¡Archivo ZIP descargado con éxito!',
    isCompleted: true,
    isError: false,
  });
}

/**
 * Downloads multiple photos individually one by one in queue with a short delay
 * to avoid browser pop-up blocking.
 */
export async function downloadPhotosSequentially(
  photos: Fotografia[],
  onProgress: (progress: DownloadProgress) => void,
  abortSignal?: AbortSignal
): Promise<void> {
  const total = photos.length;
  if (total === 0) return;

  for (let i = 0; i < total; i++) {
    if (abortSignal?.aborted) {
      throw new Error('Descarga cancelada por el usuario');
    }

    const photo = photos[i];
    const currentIndex = i + 1;
    const percent = Math.round((currentIndex / total) * 100);

    onProgress({
      current: currentIndex,
      total,
      percent,
      statusText: `Descargando foto ${currentIndex} de ${total}...`,
      isCompleted: false,
      isError: false,
    });

    await downloadDirectPhoto(photo.url, photo.filename || `foto-${currentIndex}.jpg`);

    // 400ms pause between downloads
    if (i < total - 1) {
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  onProgress({
    current: total,
    total,
    percent: 100,
    statusText: '¡Fotos descargadas en tu dispositivo!',
    isCompleted: true,
    isError: false,
  });
}
