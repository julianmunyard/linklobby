import type { Area } from 'react-easy-crop'

// Create image element from URL with CORS handling
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous' // Required for canvas operations
    image.onload = () => resolve(image)
    image.onerror = (error) => reject(error)
    image.src = url
  })

// Get cropped image as Blob
export async function getCroppedImg(
  imageSrc: string,
  croppedAreaPixels: Area,
  rotation = 0,
  outputFormat: 'image/jpeg' | 'image/png' = 'image/jpeg'
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  // Handle rotation if needed
  const radians = (rotation * Math.PI) / 180
  const rotatedWidth =
    Math.abs(Math.cos(radians) * image.width) +
    Math.abs(Math.sin(radians) * image.height)
  const rotatedHeight =
    Math.abs(Math.sin(radians) * image.width) +
    Math.abs(Math.cos(radians) * image.height)

  canvas.width = rotatedWidth
  canvas.height = rotatedHeight
  ctx.translate(rotatedWidth / 2, rotatedHeight / 2)
  ctx.rotate(radians)
  ctx.drawImage(image, -image.width / 2, -image.height / 2)
  ctx.setTransform(1, 0, 0, 1, 0, 0)

  // Extract cropped area
  const croppedCanvas = document.createElement('canvas')
  const croppedCtx = croppedCanvas.getContext('2d')!
  croppedCanvas.width = croppedAreaPixels.width
  croppedCanvas.height = croppedAreaPixels.height

  croppedCtx.drawImage(
    canvas,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    croppedAreaPixels.width,
    croppedAreaPixels.height
  )

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Canvas toBlob failed'))
      },
      outputFormat,
      outputFormat === 'image/jpeg' ? 0.9 : undefined // 90% quality for JPEG
    )
  })
}
