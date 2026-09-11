import type {  DecodeResult, TransformResult, StructureReport, ContextReport, ScanReport  } from '@qrift/shared';

export function calculateIntegrityScore(
  decoders: DecodeResult[],
  transforms: TransformResult[],
  structure: StructureReport,
  context?: ContextReport
): { score: number, status: ScanReport['status'] } {
  const successfulDecodes = decoders.filter(d => d.success);
  
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

  const stability = 
    (0.40 * payloadConsensus) + 
    (0.30 * transformConsistency) + 
    (0.20 * structureConformance) + 
    (0.10 * contextConsistency);

  const score = Math.round(Math.max(0, Math.min(1, stability)) * 100);

  let status: ScanReport['status'] = 'stable';
  if (score >= 85) status = 'stable';
  else if (score >= 70) status = 'review';
  else if (score >= 40) status = 'unstable';
  else status = 'critical';

  return { score, status };
}
