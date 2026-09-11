import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b border-slate-700 bg-graphite-900">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-cyan-400" />
        <h1 className="text-lg font-semibold tracking-wide text-gray-100">QRift</h1>
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-700 text-gray-300 ml-2">1.0</span>
      </div>
    </header>
  );
}
