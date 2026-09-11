import type {  QRDecoder, DecodeResult, DecoderRegistry  } from '@qrift/shared';
import { JSQRDecoder } from './jsqr';
import { ZXingDecoder } from './zxing';

export class Registry implements DecoderRegistry {
  private decoders: QRDecoder[] = [
    new JSQRDecoder(),
    new ZXingDecoder()
  ];

  list(): QRDecoder[] {
    return this.decoders;
  }

  async runAll(input: ImageBitmap | ImageData): Promise<DecodeResult[]> {
    const promises = this.decoders.map(decoder => decoder.decode(input));
    return Promise.all(promises);
  }
}
