import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-900 bg-neutral-950">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-indigo-500" />
        <h1 className="text-lg font-semibold tracking-wide text-neutral-100">QRift</h1>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 ml-1">1.0</span>
      </div>
    </header>
  );
}
