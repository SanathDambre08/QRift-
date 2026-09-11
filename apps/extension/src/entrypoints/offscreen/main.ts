import { browser } from 'wxt/browser';
import { Registry } from '@/core/decoders/registry';
import { TransformRunner } from '@/core/transforms/runner';
import { analyzeStructure } from '@/core/forensics/structureScore';
import { calculateIntegrityScore } from '@/core/scoring/score';

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
    const decodes = await registry.runAll(message.imageData);
    const successful = decodes.find(d => d.success);
    const referencePayload = successful?.payload;

    const transforms = await transformRunner.runAll(message.imageData, referencePayload);
    const structure = analyzeStructure(message.imageData);
    
    const { score, status } = calculateIntegrityScore(decodes, transforms, structure);

    return { 
      success: true, 
      report: { decodes, transforms, structure, score, status, action: status === 'stable' ? 'allow' : 'review' } 
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
