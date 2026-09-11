export function imageBitmapToImageData(bitmap: ImageBitmap): ImageData {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const ctx = canvas.getContext('2d') as any;
  if (!ctx) throw new Error('Failed to get 2d context');
  ctx.drawImage(bitmap, 0, 0);
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
}

export function cropImageData(imageData: ImageData, x: number, y: number, width: number, height: number): ImageData {
  const canvas = new OffscreenCanvas(imageData.width, imageData.height);
  const ctx = canvas.getContext('2d') as any;
  if (!ctx) throw new Error('Failed to get 2d context for cropping');
  
  ctx.putImageData(imageData, 0, 0);
  
  // To crop, we just create a new canvas of the target size and draw the cropped region
  const cropCanvas = new OffscreenCanvas(width, height);
  const cropCtx = cropCanvas.getContext('2d') as any;
  if (!cropCtx) throw new Error('Failed to get 2d context for cropped image');
  
  cropCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
  return cropCtx.getImageData(0, 0, width, height);
}
