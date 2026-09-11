import type {  QRDecoder, DecodeResult  } from '@qrift/shared';
import jsQR from 'jsqr';
import { imageBitmapToImageData } from './utils';

export class JSQRDecoder implements QRDecoder {
  id = 'jsqr';

  async decode(image: ImageBitmap | ImageData): Promise<DecodeResult> {
    const start = performance.now();
    try {
      const imageData = image instanceof ImageBitmap ? imageBitmapToImageData(image) : image;
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      const elapsedMs = performance.now() - start;

      if (code) {
        return {
          decoderId: this.id,
          success: true,
          payload: code.data,
          elapsedMs
        };
      } else {
        return {
          decoderId: this.id,
          success: false,
          elapsedMs,
          error: 'QR not found'
        };
      }
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
