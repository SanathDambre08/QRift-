import React, { useEffect, useState } from 'react';
import type { ScanReport } from '@qrift/shared';
import { getScanReport } from '../../storage/indexedDb';

export default function QRDetail({ scanId, onBack }: { scanId: string, onBack: () => void }) {
  const [scan, setScan] = useState<any | null>(null);

  useEffect(() => {
    getScanReport(scanId).then(report => {
      if (report) setScan(report);
    }).catch(err => {
      console.error("Failed to load scan:", err);
    });
  }, [scanId]);

  if (!scan) return <div className="p-4 text-neutral-400 font-medium">Loading report...</div>;

  // Defensively extract payload (handles if it was saved as 'decodes' or 'decoders')
  const decodersList = Array.isArray(scan.decoders) ? scan.decoders : (Array.isArray(scan.decodes) ? scan.decodes : []);
  const payloadStr = String(decodersList[0]?.payload || scan.payload || '');

  return (
    <div className="flex flex-col gap-6 bg-neutral-950 text-neutral-50 h-full p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
        <button 
          onClick={onBack} 
          className="text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1"
        >
          &larr; Back
        </button>
        <div className={`text-[10px] font-bold tracking-widest px-2 py-1 rounded-md ${
          scan.status === 'stable' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'
        }`}>
          {scan.status === 'stable' ? 'STABLE' : 'UNSTABLE'}
        </div>
      </div>

      {/* Score Section */}
      <div className="flex flex-col items-center gap-2 py-4">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Forensic Score</h3>
        <div className="flex items-baseline gap-1">
          <span className={`text-5xl font-black tracking-tighter ${
            (scan.score ?? 0) >= 80 ? 'text-indigo-500' : (scan.score ?? 0) >= 50 ? 'text-amber-500' : 'text-rose-500'
          }`}>
            {scan.score ?? 0}
          </span>
        </div>
      </div>

      {/* Destination Analysis */}
      {scan.destination && typeof scan.destination === 'object' && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Destination</h3>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex flex-col gap-3">
            <div>
              <p className="text-[10px] text-neutral-500 font-medium mb-1">Target URL</p>
              <p className="text-sm font-medium text-neutral-200 break-all leading-tight">{scan.destination.url || 'Unknown'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-800/50">
              <div>
                <p className="text-[10px] text-neutral-500 font-medium mb-1">Domain Age</p>
                <p className="text-sm font-semibold text-neutral-300">{scan.destination.domainAgeDays !== undefined ? `${scan.destination.domainAgeDays}d` : 'Unknown'}</p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-500 font-medium mb-1">Reputation (VT+AI)</p>
                <p className={`text-xs font-bold leading-tight ${
                  String(scan.destination.reputationStatus || '').includes('Safe') ? 'text-indigo-400' :
                  String(scan.destination.reputationStatus || '').includes('Suspicious') ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {scan.destination.reputationStatus || 'Unknown'}
                </p>
              </div>
            </div>
            {Array.isArray(scan.destination.safetyChecks) && scan.destination.safetyChecks.length > 0 && (
              <div className="pt-3 border-t border-neutral-800/50">
                <p className="text-[10px] text-neutral-500 font-medium mb-2">Safety Parameters</p>
                <div className="flex flex-col gap-2">
                  {scan.destination.safetyChecks.map((check: any, idx: number) => (
                    <div key={idx} className="flex items-start justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-neutral-300">{check.name}</span>
                        {check.message && <span className="text-[10px] text-neutral-500">{check.message}</span>}
                      </div>
                      <span className={`text-[10px] font-bold ${check.passed ? 'text-indigo-400' : 'text-rose-400'}`}>
                        {check.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Threat Score */}
      {typeof scan.payloadThreatScore === 'number' && (
        <div className="flex flex-col gap-3">
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">AI Deep URL Analysis</h3>
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-200">On-Device Heuristics</span>
              <span className="text-[10px] text-neutral-500">Simulated DistilBERT</span>
            </div>
            <div className={`text-lg font-black tracking-tighter ${
              scan.payloadThreatScore > 0.5 ? 'text-rose-500' : scan.payloadThreatScore > 0.2 ? 'text-amber-500' : 'text-indigo-500'
            }`}>
              {(scan.payloadThreatScore * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      )}

      {/* Payload Context */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Raw Payload</h3>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
          <p className="text-xs font-mono text-neutral-400 break-all leading-relaxed bg-neutral-950 p-2 rounded-lg border border-neutral-800/50 mb-3">
            {payloadStr || 'No payload'}
          </p>
          <div className="flex gap-2">
            <button 
              className="flex-1 bg-neutral-100 hover:bg-white text-neutral-950 text-[11px] font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
              onClick={() => payloadStr ? navigator.clipboard.writeText(payloadStr) : null}
              disabled={!payloadStr}
            >
              Copy
            </button>
            <button 
              className="flex-1 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-[11px] font-bold py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                if (payloadStr && typeof payloadStr === 'string' && payloadStr.startsWith('http')) window.open(payloadStr, '_blank');
              }}
              disabled={!(payloadStr && typeof payloadStr === 'string' && payloadStr.startsWith('http'))}
            >
              Open Link
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Properties */}
      <div className="flex flex-col gap-3 pb-8">
        <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Evidence</h3>
        <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden flex flex-col">
          {Array.isArray(scan.transforms) && scan.transforms.map((t: any, i: number) => t ? (
            <div key={i} className="flex flex-col p-3 border-b border-neutral-800 last:border-b-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[11px] font-medium text-neutral-300 capitalize">{t.condition || 'Unknown'}</span>
                <span className={`text-[10px] font-bold ${t.success || t.signal ? 'text-amber-500' : 'text-neutral-500'}`}>
                  {t.success || t.signal ? 'DETECTED' : 'CLEAR'}
                </span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500 truncate">{t.payloadHash || 'N/A'}</span>
            </div>
          ) : null)}
          {(!Array.isArray(scan.transforms) || scan.transforms.length === 0) && (
            <div className="p-3 text-[10px] text-neutral-500">No transformations applied</div>
          )}
        </div>
      </div>
    </div>
  );
}
