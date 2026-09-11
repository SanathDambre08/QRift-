import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '../../assets/tailwind.css';

function BlockedPage() {
  const [url, setUrl] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const originalUrl = params.get('url');
    if (originalUrl) {
      setUrl(originalUrl);
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-neutral-900 border border-rose-500/30 rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl shadow-rose-900/20">
        <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white mb-2">Malicious Link Blocked</h1>
        <p className="text-sm text-neutral-400 mb-6">
          QRift blocked you from visiting this URL because it was flagged as malicious or unstable by our deep verification engine.
        </p>
        <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 mb-8 overflow-hidden">
          <p className="text-xs font-mono text-neutral-500 mb-1 text-left">Blocked Destination:</p>
          <p className="text-sm font-medium text-rose-400 break-all text-left">{url || 'Unknown'}</p>
        </div>
        <div className="flex w-full gap-3">
          <button 
            onClick={() => window.close()}
            className="flex-1 bg-neutral-100 hover:bg-white text-neutral-950 font-bold py-3 rounded-xl transition-colors"
          >
            Close Tab
          </button>
          <button 
            onClick={() => { if (url) window.location.href = url; }}
            className="flex-1 bg-transparent hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold py-3 rounded-xl transition-colors"
          >
            Proceed Anyway
          </button>
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<BlockedPage />);
}
