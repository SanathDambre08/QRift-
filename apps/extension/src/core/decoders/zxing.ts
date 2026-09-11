import type {  QRDecoder, DecodeResult  } from '@qrift/shared';
import { BrowserQRCodeReader } from '@zxing/library';
import { imageBitmapToImageData } from './utils';

export class ZXingDecoder implements QRDecoder {
  id = 'zxing';
  private reader = new BrowserQRCodeReader();

  async decode(image: ImageBitmap | ImageData): Promise<DecodeResult> {
    const start = performance.now();
    try {
      const imageData = image instanceof ImageBitmap ? imageBitmapToImageData(image) : image;
      
      // Convert ImageData to an HTMLCanvasElement/HTMLImageElement or use decodeFromImageUrl/decodeFromVideoDevice?
      // Wait, zxing library can decode from a canvas or image element, but offscreen worker only has OffscreenCanvas.
      // However, newer versions or specific methods might accept ImageData or a URL.
      // Let's create an offscreen canvas and draw the imageData to it.
      
      let canvas: HTMLCanvasElement | OffscreenCanvas;
      if (typeof HTMLCanvasElement !== 'undefined') {
        canvas = document.createElement('canvas');
      } else {
        canvas = new OffscreenCanvas(imageData.width, imageData.height);
      }
      
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d') as any;
      if (ctx) {
        ctx.putImageData(imageData, 0, 0);
      }

      // @zxing/library's BrowserQRCodeReader.decodeFromCanvas is available?
      // If it doesn't support OffscreenCanvas, we might need a workaround. Let's try decodeFromCanvas.
      // Types might complain if it strictly wants HTMLCanvasElement.
      const result = await this.reader.decodeFromCanvas(canvas as any);
      
      return {
        decoderId: this.id,
        success: true,
        payload: result.getText(),
        elapsedMs: performance.now() - start
      };
    } catch (e: any) {
      return {
        decoderId: this.id,
        success: false,
        elapsedMs: performance.now() - start,
        error: e.message
      };
    }
  }
}
