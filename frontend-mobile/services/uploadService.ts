import { API_BASE_URL } from '../api/apiClient';
import { useAuthStore } from '@/features/auth/store/authStore';

export interface UploadMediaResponse {
  success: boolean;
  data: {
    url: string;
    key: string;
  };
}

/**
 * Uploads a single local photo or video file using fetch() API
 * to prevent Axios serialization bugs in React Native.
 */
export async function uploadFile(uri: string): Promise<string> {
  if (!uri) return '';
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri;
  }

  const filename = uri.split('/').pop() || `file_${Date.now()}`;
  const match = /\.(\w+)$/.exec(filename);
  let type = 'application/octet-stream';
  if (match) {
    const ext = match[1].toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
      type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    } else if (['mp4', 'mov', 'm4v', '3gp', 'avi'].includes(ext)) {
      type = `video/${ext === 'mov' ? 'quicktime' : ext}`;
    }
  }

  const formData = new FormData();
  formData.append('file', {
    uri,
    name: filename,
    type,
  } as any);

  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/media/upload`, {
    method: 'POST',
    body: formData,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }

  const resData = await response.json();
  if (resData?.success && resData.data?.url) {
    return resData.data.url;
  }
  throw new Error(`Failed to upload media: ${filename}`);
}

/**
 * Runs `worker` on each item, with at most `limit` concurrent executions.
 * Results are returned in the original order.
 */
async function runWithConcurrencyLimit<T>(
  items: string[],
  limit: number,
  worker: (item: string) => Promise<T>
): Promise<T[]> {
  const results: T[] = new Array(items.length);
  let index = 0;

  async function next(): Promise<void> {
    const current = index++;
    if (current >= items.length) return;
    results[current] = await worker(items[current]);
    return next();
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, next));
  return results;
}

/**
 * Uploads an array of local/remote photo URIs with a concurrency cap of 3.
 * Remote URLs are preserved. Local URIs are uploaded via single-file requests.
 * Returns an array of CDN URLs in the original order.
 */
export async function uploadPhotos(localUris: string[]): Promise<string[]> {
  if (!localUris || localUris.length === 0) return [];
  return runWithConcurrencyLimit(localUris, 3, uploadFile);
}


/**
 * Deletes a single uploaded media file from CDN.
 */
export async function deleteMedia(url: string): Promise<boolean> {
  if (!url || url.startsWith('file://')) return true;
  try {
    const token = useAuthStore.getState().token;
    const response = await fetch(`${API_BASE_URL}/media`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) return false;
    const resData = await response.json();
    return !!resData?.success;
  } catch (err) {
    if (__DEV__) {
      console.error('[deleteMedia] Error deleting media:', err);
    }
    return false;
  }
}
