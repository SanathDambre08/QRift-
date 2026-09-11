import React, { useEffect, useState } from 'react';
import type {  ScanReport  } from '@qrift/shared';
import { getAllScans } from '../../storage/indexedDb';

export default function SidePanelHome({ onSelectScan }: { onSelectScan: (id: string) => void }) {
  const [scans, setScans] = useState<ScanReport[]>([]);

  useEffect(() => {
    getAllScans().then(setScans);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-slate-700/50 p-4 rounded-[14px] border border-slate-700">
        <h2 className="text-sm font-medium text-gray-300">Inbox - security review</h2>
        <div className="mt-2 text-xs text-gray-400">
          {scans.length} QR codes found
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        {scans.map(scan => (
          <div 
            key={scan.scanId} 
            onClick={() => onSelectScan(scan.scanId)}
            className="bg-graphite-800 p-4 rounded-[14px] border border-slate-700 cursor-pointer hover:border-cyan-500 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold">{scan.status === 'stable' ? 'Stable' : 'Interpretation unstable'}</p>
                <p className="text-xs text-gray-400">Score: {scan.score}</p>
              </div>
              <div className="text-cyan-400 text-xs">Open report &gt;</div>
            </div>
          </div>
        ))}
        {scans.length === 0 && (
          <div className="text-center text-sm text-gray-500 mt-8">No QR codes found yet.</div>
        )}
      </div>
    </div>
  );
}
