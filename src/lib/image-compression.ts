import imageCompression from 'browser-image-compression'

/**
 * Compress an image file for upload
 * @param file The image file to compress
 * @returns Compressed image as Blob (compatible with upload functions)
 *
 * Features:
 * - Preserves animated GIFs (returns original)
 * - Compresses other images to max 1MB, 1920px max dimension
 * - Uses web worker for non-blocking compression
 * - Preserves original format (JPEG stays JPEG, PNG stays PNG, etc.)
 * - Falls back to original file if compression fails
 */
export async function compressImageForUpload(file: File): Promise<Blob> {
  // Preserve animated GIFs - don't compress them
  if (file.type === 'image/gif') {
    return file
  }

  try {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.8,
      // Preserve original format
      fileType: file.type,
    }

    const compressed = await imageCompression(file, options)
    return compressed
  } catch (error) {
    console.error('Image compression failed, using original:', error)
    // Fallback to original file if compression fails
    return file
  }
}
