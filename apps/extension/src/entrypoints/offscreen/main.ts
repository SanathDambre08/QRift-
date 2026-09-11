import { browser } from 'wxt/browser';
import jsQR from 'jsqr';
import { cropImageData } from '@/core/decoders/utils';
import { Registry } from '@/core/decoders/registry';
import { TransformRunner } from '@/core/transforms/runner';
import { analyzeStructure } from '@/core/forensics/structureScore';
import { calculateIntegrityScore } from '@/core/scoring/score';
import { analyzePayloadThreat } from '@/core/forensics/payloadScore';
import { analyzeDestination } from '@/core/forensics/destinationAnalyzer';
import { saveScanReport } from '@/storage/indexedDb';

const registry = new Registry();
const transformRunner = new TransformRunner(registry);

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'RUN_QR_ANALYSIS') {
    handleQRAnalysis(message).then(sendResponse);
    return true;
  }
});

async function handleQRAnalysis(message: any) {
  try {
    let imageData = message.imageData;
    if (!imageData && message.payload?.dataUrl) {
      imageData = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
          } else reject(new Error('no context'));
        };
        img.onerror = reject;
        img.src = message.payload.dataUrl;
      });
    }

    if (!imageData) {
      return { success: false, error: 'No image data provided' };
    }

    // --- Primary QR Code Heuristic ---
    let maxArea = 0;
    let bestLoc: any = null;

    // 1. Try Native BarcodeDetector (Highly robust for full-page screenshots)
    if ('BarcodeDetector' in globalThis) {
      try {
        const detector = new (globalThis as any).BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await detector.detect(imageData);
        for (const barcode of barcodes) {
          const rect = barcode.boundingBox;
          const area = rect.width * rect.height;
          if (area > maxArea) {
            maxArea = area;
            bestLoc = { minX: rect.x, maxX: rect.x + rect.width, minY: rect.y, maxY: rect.y + rect.height };
          }
        }
      } catch (e) {
        console.warn('Native BarcodeDetector failed', e);
      }
    }

    // 2. Fallback to jsQR if BarcodeDetector is unavailable or failed to find anything
    if (!bestLoc) {
      const dataCopy = new Uint8ClampedArray(imageData.data);
      const searchImageData = new ImageData(dataCopy, imageData.width, imageData.height);
      
      while (true) {
        const code = jsQR(searchImageData.data, searchImageData.width, searchImageData.height);
        if (!code) break;
        
        const loc = code.location;
        const minX = Math.min(loc.topLeftCorner.x, loc.bottomLeftCorner.x, loc.bottomRightCorner.x, loc.topRightCorner.x);
        const maxX = Math.max(loc.topRightCorner.x, loc.bottomRightCorner.x, loc.topLeftCorner.x, loc.bottomLeftCorner.x);
        const minY = Math.min(loc.topLeftCorner.y, loc.topRightCorner.y, loc.bottomRightCorner.y, loc.bottomLeftCorner.y);
        const maxY = Math.max(loc.bottomLeftCorner.y, loc.bottomRightCorner.y, loc.topLeftCorner.y, loc.topRightCorner.y);
        const area = (maxX - minX) * (maxY - minY);
        
        if (area > maxArea) {
          maxArea = area;
          bestLoc = { minX, maxX, minY, maxY };
        }

        // Black out this QR code to find the next one
        for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
          for (let x = Math.floor(minX); x <= Math.ceil(maxX); x++) {
            if (x >= 0 && x < searchImageData.width && y >= 0 && y < searchImageData.height) {
              const idx = (y * searchImageData.width + x) * 4;
              searchImageData.data[idx] = 255;
              searchImageData.data[idx+1] = 255;
              searchImageData.data[idx+2] = 255;
              searchImageData.data[idx+3] = 255;
            }
          }
        }
      }
    }

    let processedImageData = imageData;
    
    // If we found a primary QR code that is reasonably sized, crop the image
    if (bestLoc && maxArea > 0) {
      const padding = 40; // Add quiet zone padding
      const cropX = Math.max(0, Math.floor(bestLoc.minX) - padding);
      const cropY = Math.max(0, Math.floor(bestLoc.minY) - padding);
      
      // Calculate width and height safely ensuring they stay within image bounds
      const rawW = Math.ceil(bestLoc.maxX - bestLoc.minX) + padding * 2;
      const rawH = Math.ceil(bestLoc.maxY - bestLoc.minY) + padding * 2;
      const cropW = Math.max(1, Math.min(imageData.width - cropX, rawW));
      const cropH = Math.max(1, Math.min(imageData.height - cropY, rawH));
      
      try {
        processedImageData = cropImageData(imageData, cropX, cropY, cropW, cropH);
      } catch (e) {
        console.warn('Failed to crop image data, falling back to full image', e);
      }
    } else {
      // If we are doing a screen capture (which went through the heuristic) and found absolutely nothing,
      // abort early so we don't return random noise or an empty report.
      if (message.type === 'RUN_QR_ANALYSIS' && message.payload?.dataUrl) {
         return { success: false, error: 'No QR code found on screen' };
      }
    }
    // ---------------------------------

    const decodes = await registry.runAll(processedImageData);
    const successful = decodes.find((d: any) => d.success);
    const referencePayload = successful?.payload;

    const transforms = await transformRunner.runAll(imageData, referencePayload);
    const structure = analyzeStructure(imageData);
    const payloadThreatScore = analyzePayloadThreat(referencePayload);
    const destination = analyzeDestination(referencePayload, payloadThreatScore);
    
    const { score, status } = calculateIntegrityScore(decodes, transforms, structure, payloadThreatScore);

    const report = { 
      scanId: `SCN-${Date.now()}`,
      createdAt: new Date().toISOString(),
      decodes, 
      transforms, 
      structure, 
      payloadThreatScore,
      destination,
      score, 
      status, 
      action: status === 'stable' ? 'allow' : 'review' 
    };

    // Save to IndexedDB so side panel sees it
    await saveScanReport(report as any);

    // Push to backend telemetry
    if (referencePayload) {
      try {
        await fetch('http://localhost:3000/api/scans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: report.scanId,
            url: referencePayload,
            risk: status === 'stable' ? 'LOW' : 'CRITICAL'
          })
        });
      } catch (e) {
        console.error('Failed to sync to backend', e);
      }
    }

    return { success: true, report };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
