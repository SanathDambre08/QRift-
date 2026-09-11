import type {  TransformResult, DecodeResult  } from '@qrift/shared';
import { Registry } from '../decoders/registry';
import { imageBitmapToImageData } from '../decoders/utils';

export class TransformRunner {
  private registry: Registry;

  constructor(registry: Registry) {
    this.registry = registry;
  }

  async runAll(image: ImageBitmap | ImageData, referencePayload?: string): Promise<TransformResult[]> {
    // Basic transforms: scale 0.5x, blur
    const results: TransformResult[] = [];
    
    // 1. Scale 0.5x
    results.push(await this.testTransform(image, 'scale 0.5x', async (ctx, img) => {
      ctx.scale(0.5, 0.5);
      ctx.drawImage(img instanceof ImageBitmap ? img : await createImageBitmap(img), 0, 0);
    }, referencePayload));

    // 2. Blur (approximation via downscale/upscale or canvas filter if supported)
    results.push(await this.testTransform(image, 'blur', async (ctx, img) => {
      ctx.filter = 'blur(1.5px)';
      ctx.drawImage(img instanceof ImageBitmap ? img : await createImageBitmap(img), 0, 0);
    }, referencePayload));

    return results;
  }

  private async testTransform(
    image: ImageBitmap | ImageData, 
    condition: string, 
    transformFn: (ctx: OffscreenCanvasRenderingContext2D, img: ImageBitmap | ImageData) => void | Promise<void>,
    referencePayload?: string
  ): Promise<TransformResult> {
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d') as any;
    if (ctx) {
      await transformFn(ctx, image);
      const newImgData = ctx.getImageData(0, 0, image.width, image.height);
      const decodes = await this.registry.runAll(newImgData);
      const successful = decodes.find(d => d.success);
      
      return {
        transformId: condition,
        condition,
        payload: successful?.payload,
        payloadHash: successful?.payload ? btoa(successful.payload).slice(0, 10) : undefined,
        changed: successful?.payload !== referencePayload,
        success: !!successful
      };
    }
    return { transformId: condition, condition, changed: false, success: false };
  }
}
