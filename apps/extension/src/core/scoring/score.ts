import type {  DecodeResult, TransformResult, StructureReport, ContextReport, ScanReport  } from '@qrift/shared';

export function calculateIntegrityScore(
  decoders: DecodeResult[],
  transforms: TransformResult[],
  structure: StructureReport,
  payloadThreatScore: number = 0,
  context?: ContextReport
): { score: number, status: ScanReport['status'] } {
  const successfulDecodes = decoders.filter(d => d.success);
  
  // If no decoders succeeded, the QR is unreadable or non-existent
  if (successfulDecodes.length === 0) {
    return { score: 0, status: 'error' };
  }
  
  // payloadConsensus: agreement among successful decoders
  let payloadConsensus = 1;
  if (successfulDecodes.length > 1) {
    const payloads = new Set(successfulDecodes.map(d => d.payload));
    payloadConsensus = payloads.size === 1 ? 1 : 0; // strict mismatch
  }

  // transformConsistency: fraction of stress tests preserving the reference payload
  const transformConsistency = transforms.length > 0 
    ? transforms.filter(t => !t.changed).length / transforms.length 
    : 1;

  // structureConformance: 1 - normalized structural anomaly score
  const structureConformance = Math.max(0, 1 - structure.anomalyScore);

  // contextConsistency: default to 1 if no mismatch
  const contextConsistency = context?.mismatch ? 0 : 1;

  // payloadSafety: 1 - payloadThreatScore
  const payloadSafety = Math.max(0, 1 - payloadThreatScore);

  const stability = 
    (0.30 * payloadConsensus) + 
    (0.30 * transformConsistency) + 
    (0.30 * payloadSafety) + 
    (0.10 * structureConformance);

  const score = Math.round(Math.max(0, Math.min(1, stability)) * 100);

  let status: ScanReport['status'] = 'stable';
  if (score >= 85) status = 'stable';
  else if (score >= 70) status = 'review';
  else if (score >= 40) status = 'unstable';
  else status = 'critical';

  return { score, status };
}
