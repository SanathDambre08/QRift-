import React, { useEffect, useState, useCallback } from 'react';
import type { ScanReport } from '@qrift/shared';
import { getAllScans } from '../../storage/indexedDb';
import { browser } from 'wxt/browser';

export default function SidePanelHome({ onSelectScan }: { onSelectScan: (id: string) => void }) {
  const [scans, setScans] = useState<ScanReport[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Poll for updates since we don't have a reactive DB wrapper yet
  useEffect(() => {
    const fetchScans = () => getAllScans().then(setScans);
    fetchScans();
    const interval = setInterval(fetchScans, 2000);
    return () => clearInterval(interval);
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        browser.runtime.sendMessage({
          type: 'START_DEEP_VERIFY',
          payload: { dataUrl }
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div 
        className={`border-2 border-dashed rounded-[14px] p-6 text-center transition-colors ${isDragging ? 'border-cyan-500 bg-cyan-900/20' : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <p className="text-sm text-gray-300 mb-2">Drag & drop a QR code image here</p>
        <p className="text-xs text-gray-500 mb-4">or</p>
        <label className="bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 px-4 rounded-[8px] cursor-pointer transition-colors">
          Browse Files
          <input type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </label>
      </div>
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
