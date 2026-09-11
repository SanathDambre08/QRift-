import React, { useEffect, useState, useCallback } from 'react';
import type { ScanReport } from '@qrift/shared';
import { getAllScans } from '../../storage/indexedDb';
import { browser } from 'wxt/browser';
import { ExternalLink } from 'lucide-react';

export default function SidePanelHome({ onSelectScan }: { onSelectScan: (id: string) => void }) {
  const [scans, setScans] = useState<ScanReport[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const processDataUrl = (dataUrl: string) => {
    setIsProcessing(true);
    browser.runtime.sendMessage({ 
      type: 'START_DEEP_VERIFY', 
      payload: { dataUrl, isScreenshot: true } 
    })
    .then(response => {
      if (response && response.success && response.report) {
        onSelectScan(response.report.scanId);
      } else {
        console.error('Scan failed', response?.error);
        alert('Scan failed: ' + (response?.error || 'Unknown error'));
      }
    })
    .catch(console.error)
    .finally(() => setIsProcessing(false));
  };

  const processFile = (file: File) => {
    if (!file || !file.type || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        processDataUrl(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handleMessage = (message: any) => {
      if (message.type === 'PROCESS_AUTO_SCREENSHOT' && message.payload?.dataUrl) {
        processDataUrl(message.payload.dataUrl);
      }
    };
    browser.runtime.onMessage.addListener(handleMessage);
    return () => browser.runtime.onMessage.removeListener(handleMessage);
  }, [onSelectScan]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    }
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const captureAndAnalyzeScreen = () => {
    setIsProcessing(true);
    browser.runtime.sendMessage({ type: 'CAPTURE_AND_ANALYZE_SCREEN' })
      .then(response => {
        if (response && response.success && response.report) {
          onSelectScan(response.report.scanId);
        } else if (response && !response.success) {
          console.error('Scan failed:', response.error);
          alert('Scan failed: ' + response.error);
        }
      })
      .catch(err => {
         console.error('Message failed:', err);
         alert('Message failed: ' + err.message);
      })
      .finally(() => setIsProcessing(false));
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-neutral-50 font-sans selection:bg-indigo-500/30">
      {/* Sticky Header / Uploader */}
      <div className="sticky top-0 z-10 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900 px-4 py-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-neutral-200">Inbox</h2>
            <div className="text-[10px] font-mono font-medium text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded-full">
              {scans.length}
            </div>
          </div>
          <button 
            onClick={() => window.open('http://localhost:5173', '_blank')}
            className="text-[10px] flex items-center gap-1 font-bold text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Open Full Dashboard"
          >
            DASHBOARD <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        
        <div 
          className={`border border-dashed rounded-xl p-4 text-center transition-all ${
            isDragging ? 'border-indigo-500 bg-indigo-500/5' : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <p className="text-[11px] font-medium text-neutral-300 mb-3">
            {isProcessing ? 'Processing QR...' : 'Drop a QR code to scan'}
          </p>
          <label className="bg-neutral-100 hover:bg-white text-neutral-950 font-bold text-[10px] uppercase tracking-wider py-1.5 px-3 rounded-md cursor-pointer transition-colors inline-block">
            Browse
            <input type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={isProcessing} />
          </label>
        </div>

        <button
          onClick={captureAndAnalyzeScreen}
          className="mt-3 w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold text-[10px] uppercase tracking-wider py-2 rounded-md transition-colors disabled:opacity-50"
          disabled={isProcessing}
        >
          {isProcessing ? 'Scanning...' : 'Auto-Detect on Screen'}
        </button>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {scans.length === 0 ? (
          <div className="text-center py-8 text-neutral-600 text-xs font-medium">
            No scans yet
          </div>
        ) : (
          scans.map((scan) => (
            <div 
              key={scan.scanId} 
              onClick={() => onSelectScan(scan.scanId)}
              className="bg-neutral-900/50 p-4 rounded-xl border border-neutral-800 cursor-pointer hover:border-neutral-700 transition-all flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <p className="text-[11px] font-mono font-medium text-neutral-400">
                  {scan.scanId.split('-')[0]}
                </p>
                <div className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-widest ${
                  scan.status === 'stable' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {scan.status === 'stable' ? 'STABLE' : 'UNSTABLE'}
                </div>
              </div>
              
              {scan.destination && (
                <div className="mt-1">
                  <p className="text-sm font-medium text-neutral-200 truncate" title={scan.destination.hostname}>
                    {scan.destination.hostname}
                  </p>
                  <p className={`text-[10px] font-semibold mt-0.5 ${
                    scan.destination.reputationStatus === 'Safe' ? 'text-indigo-400' : 'text-rose-400'
                  }`}>
                    {scan.destination.reputationStatus}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
