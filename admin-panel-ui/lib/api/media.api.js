import { apiClient } from './client';
/**
 * Upload property media files to S3.
 * Call this BEFORE creating/updating a property.
 *
 * @param photos  - Image File objects (up to 15)
 * @param video   - Optional video File
 */
export async function uploadMedia(photos, video) {
    const formData = new FormData();
    photos.forEach((f) => formData.append('photos', f));
    if (video)
        formData.append('video', video);
    const res = await apiClient.post('/v1/admin/media', formData);
    return res.data;
}
/**
 * Delete media files from S3.
 * Call this when the user removes a photo/video from the form.
 *
 * @param urls - Array of full S3 URLs to delete
 */
export async function deleteMedia(urls) {
    const res = await apiClient.delete('/v1/admin/media', {
        data: { urls },
    });
    return res.data;
}
