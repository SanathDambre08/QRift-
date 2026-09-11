import React, { useEffect, useState } from 'react';
import type {  ScanReport  } from '@qrift/shared';
import { getScanReport } from '../../storage/indexedDb';

export default function QRDetail({ scanId, onBack }: { scanId: string, onBack: () => void }) {
  const [scan, setScan] = useState<ScanReport | null>(null);

  useEffect(() => {
    getScanReport(scanId).then(report => {
      if (report) setScan(report);
    });
  }, [scanId]);

  if (!scan) return <div className="p-4">Loading...</div>;

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onBack} className="text-cyan-400 text-sm mb-2 text-left">&lt; Back to Inbox</button>
      
      <div className="bg-graphite-800 p-4 rounded-[14px] border border-slate-700">
        <h2 className="text-xl font-bold mb-2">
          {scan.status === 'stable' ? 'Stable' : 'Interpretation unstable'}
        </h2>
        <div className="flex justify-between items-center bg-slate-700/50 p-4 rounded-[10px]">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wider">Integrity Score</div>
            <div className="text-3xl font-mono mt-1">
              <span className={scan.score >= 85 ? 'text-green-400' : 'text-red-400'}>{scan.score}</span>
              <span className="text-gray-500 text-xl">/100</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold uppercase">{scan.status}</div>
            <div className="text-xs text-gray-400 mt-1">
              {scan.status === 'stable' ? 'Verified under test conditions' : 'Do not open or scan this QR.'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Decoders and Transforms */}
      <div className="bg-graphite-800 p-4 rounded-[14px] border border-slate-700">
        <h3 className="text-sm font-semibold border-b border-slate-700 pb-2 mb-4">Evidence Matrix</h3>
        <div className="text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 border-b border-slate-700">
                <th className="pb-2 font-medium">Test</th>
                <th className="pb-2 font-medium">Result</th>
                <th className="pb-2 font-medium text-right">Signal</th>
              </tr>
            </thead>
            <tbody>
              {scan.transforms.map((t, i) => (
                <tr key={i} className="border-b border-slate-700/50 last:border-0">
                  <td className="py-2 capitalize">{t.condition}</td>
                  <td className="py-2 text-gray-400">{t.payloadHash || 'failed'}</td>
                  <td className="py-2 text-right">
                    <span className={t.changed ? 'text-red-400' : 'text-green-400'}>
                      {t.changed ? 'diverged' : 'stable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
