export type QRArtifact = {
  id: string;
  source: 'gmail' | 'webpage' | 'context-menu' | 'lab';
  pageUrl?: string;
  imageHash: string;
  thumbnailDataUrl?: string;
  detectedAt: string;
  bbox?: { x: number; y: number; width: number; height: number };
};

export type DecodeResult = {
  decoderId: string;
  success: boolean;
  payload?: string;
  payloadType?: 'url' | 'text' | 'wifi' | 'other';
  confidence?: number;
  elapsedMs: number;
  error?: string;
};

export type StructureReport = {
  anomalyScore: number;
  // Raw metrics can be added here based on forensics
};

export type TransformResult = {
  transformId: string;
  condition: string;
  payloadHash?: string;
  payload?: string;
  changed: boolean;
  success: boolean;
};

export type DestinationReport = {
  url: string;
  normalizedUrl: string;
  hostname: string;
  reputationStatus?: string;
};

export type ContextReport = {
  mismatch: boolean;
  explanation?: string;
};

export type Finding = {
  code: string;
  severity: 'warning' | 'critical' | 'info';
  message?: string;
};

export type ScanReport = {
  scanId: string;
  artifactId: string;
  status: 'stable' | 'review' | 'unstable' | 'critical' | 'error';
  score: number;
  confidence: number;
  decoders: DecodeResult[];
  structure: StructureReport;
  transforms: TransformResult[];
  destination?: DestinationReport;
  context?: ContextReport;
  findings: Finding[];
  action: 'allow' | 'review' | 'block';
  createdAt: string;
};

export type Policy = {
  // configuration
};

export interface QRDecoder {
  id: string;
  decode(image: ImageBitmap | ImageData): Promise<DecodeResult>;
}

export interface DecoderRegistry {
  list(): QRDecoder[];
  runAll(input: ImageBitmap): Promise<DecodeResult[]>;
}
