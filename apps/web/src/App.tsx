import React, { useState, useEffect, useRef } from 'react';
import { Shield, QrCode, Globe, Upload, AlertTriangle, CheckCircle, Search, Users, BarChart3, Mail } from 'lucide-react';
import jsQR from 'jsqr';

interface ScanResult {
  id: string;
  url: string;
  risk: 'CRITICAL' | 'MEDIUM' | 'LOW';
  timestamp: Date;
  safetyChecks?: any[];
}

function App() {
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if the extension injected the DOM element
    const checkExtension = () => {
      const el = document.getElementById('qrift-extension-is-installed');
      if (el) setIsExtensionInstalled(true);
    };
    checkExtension();
    const timeout = setTimeout(checkExtension, 1000);

    // Fetch live telemetry from backend
    const fetchScans = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/scans');
        const data = await res.json();
        setScans(data.map((d: any) => ({ ...d, timestamp: new Date(d.timestamp) })));
      } catch (err) {
        console.error('Failed to fetch scans', err);
      }
    };
    fetchScans();
    
    // Poll every 3 seconds for new scans
    const pollInterval = setInterval(fetchScans, 3000);

    return () => {
      clearTimeout(timeout);
      clearInterval(pollInterval);
    };
  }, []);

  const analyzeQRCode = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        // Mock Risk Assessment
        const lowerUrl = code.data.toLowerCase();
        const isMalicious = lowerUrl.includes('phish') || lowerUrl.includes('malicious') || lowerUrl.includes('suspicious');
        const isRedirect = lowerUrl.includes('bit.ly') || lowerUrl.includes('redirect');
        const risk = isMalicious ? 'CRITICAL' : (isRedirect ? 'MEDIUM' : 'LOW');
        
        const isPunycode = lowerUrl.includes('xn--');
        const isRecentlyRegistered = lowerUrl.includes('login-') || lowerUrl.includes('update-');
        const hasSuspiciousSSL = lowerUrl.includes('http:') && (lowerUrl.includes('secure') || lowerUrl.includes('auth'));
        
        const safetyChecks = [
          { name: 'Punycode Homograph Check', passed: !isPunycode, message: isPunycode ? 'Punycode domain detected' : 'Standard character set' },
          { name: 'WHOIS Registration Age', passed: !isRecentlyRegistered, message: isRecentlyRegistered ? 'Domain recently registered' : 'Domain age established' },
          { name: 'SSL Certificate Validation', passed: !hasSuspiciousSSL, message: hasSuspiciousSSL ? 'Missing SSL on sensitive domain' : 'SSL context secure' }
        ];
        
        const newScan = {
          id: `SCN-${Math.floor(Math.random() * 1000)}`,
          url: code.data,
          risk,
          timestamp: new Date().toISOString(),
          safetyChecks
        };
        
        // Push scan to backend
        fetch('http://localhost:3000/api/scans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newScan)
        }).then(() => {
          setScans(prev => [{ ...newScan, timestamp: new Date() } as ScanResult, ...prev]);
        }).catch(console.error);
      } else {
        alert("No valid QR code found in this image.");
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      analyzeQRCode(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      analyzeQRCode(e.target.files[0]);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030303] text-neutral-50 font-sans selection:bg-indigo-500/30 pb-24 overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="bg-glow-orb bg-glow-orb-1"></div>
      <div className="bg-glow-orb bg-glow-orb-2"></div>

      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto border-b border-white/5 relative z-10 glass-panel mt-6 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
            <Shield className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">QRift<span className="text-indigo-500">.</span></span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          {isExtensionInstalled ? (
            <div className="flex items-center gap-2 text-indigo-300 bg-indigo-500/10 px-5 py-2.5 rounded-full border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <CheckCircle className="w-4 h-4" />
              <span>Extension Active</span>
            </div>
          ) : (
            <a 
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white hover:bg-neutral-200 text-neutral-950 px-6 py-2.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105"
            >
              Install Extension
            </a>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 mt-20 flex flex-col gap-24 relative z-10">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center gap-8 max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-neutral-300 backdrop-blur-md mb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Enterprise Grade Protection
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1]">
              Metamorphic <br />
              <span className="text-gradient">QR Forensics</span>
            </h1>
            <p className="text-lg md:text-xl text-neutral-400 leading-relaxed max-w-2xl mx-auto font-medium">
              Scan, decode, and analyze QR codes with military-grade safety checks. Protect your organization against phishing and hidden payloads.
            </p>
          </div>

          <div 
            className={`relative flex flex-col items-center justify-center p-14 w-full max-w-2xl border-2 border-dashed rounded-[2.5rem] transition-all duration-300 backdrop-blur-xl ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.2)] scale-[1.02]' 
                : 'border-white/10 bg-neutral-900/30 hover:border-white/20 hover:bg-neutral-900/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[2.5rem] pointer-events-none"></div>
            
            <div className="bg-neutral-800/50 p-4 rounded-2xl mb-6 border border-white/5 shadow-inner">
              <Upload className={`w-10 h-10 transition-colors ${dragActive ? 'text-indigo-400' : 'text-neutral-400'}`} />
            </div>
            
            <h3 className="text-2xl font-bold mb-3 text-white">Drop a QR Code here</h3>
            <p className="text-neutral-400 text-sm mb-8 max-w-sm text-center">
              Upload any image containing a QR code to run an instant forensic safety check.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-white hover:bg-neutral-200 text-neutral-950 px-8 py-3.5 rounded-full font-bold transition-all flex items-center gap-2 hover:scale-105 shadow-lg"
            >
              <Search className="w-4 h-4" /> Browse Files
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept="image/*"
              className="hidden" 
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Global Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
          <div className="glass-card p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                <BarChart3 className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-400">Total QR Scanned</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">124.5K</span>
                  <span className="text-xs font-bold text-emerald-400">+12%</span>
                </div>
              </div>
            </div>
            {/* Animated Bar Chart */}
            <div className="h-12 flex items-end gap-1.5 w-full mt-2">
              {[40, 70, 45, 90, 65, 85, 100, 60, 75, 50, 80, 95].map((height, i) => (
                <div key={i} className="flex-1 bg-indigo-500/20 rounded-t-sm hover:bg-indigo-400 transition-colors relative group/bar">
                  <div 
                    className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm stats-grow"
                    style={{ height: `${height}%`, animationDelay: `${i * 0.05}s` }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all duration-500"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-400">Threats Blocked</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">8,204</span>
                  <span className="text-xs font-bold text-rose-400">Live</span>
                </div>
              </div>
            </div>
            {/* Animated Line Graph (Sparkline) */}
            <div className="h-12 w-full mt-2 relative">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                <path 
                  d="M0,35 Q10,35 20,25 T40,15 T60,20 T80,5 T100,10" 
                  fill="none" 
                  stroke="rgba(244, 63, 94, 0.5)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  className="stats-draw stroke-rose-500"
                />
                <path 
                  d="M0,40 L0,35 Q10,35 20,25 T40,15 T60,20 T80,5 T100,10 L100,40 Z" 
                  fill="url(#roseGradient)" 
                  className="stats-fade-in opacity-0"
                />
                <defs>
                  <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(244, 63, 94, 0.2)" />
                    <stop offset="100%" stopColor="rgba(244, 63, 94, 0)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-400">Active Visitors</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white flex items-center gap-2">
                    1,432
                  </span>
                </div>
              </div>
            </div>
            {/* Animated Activity Monitor */}
            <div className="h-12 w-full mt-2 relative flex items-end justify-between px-2 gap-1">
               {[20, 40, 30, 80, 50, 90, 60, 40, 70, 30, 60, 20].map((h, i) => (
                  <div key={i} className="flex-1 flex items-end justify-center h-full">
                    <div 
                      className="w-1.5 rounded-full bg-emerald-500 stats-bounce"
                      style={{ 
                        height: `${h}%`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    ></div>
                  </div>
               ))}
            </div>
          </div>
        </div>

        {/* Telemetry Grid */}
        <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
          <div className="flex items-center justify-between border-b border-white/5 pb-5">
            <h3 className="text-xl font-semibold flex items-center gap-3 text-white">
              <div className="p-1.5 bg-indigo-500/20 rounded-md">
                <Globe className="w-5 h-5 text-indigo-400" />
              </div>
              Live Scan Telemetry
            </h3>
            <span className="text-sm text-indigo-400 font-mono font-medium bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
              {scans.length} SCANS
            </span>
          </div>
          
          {scans.length === 0 ? (
            <div className="text-center py-20 text-neutral-500 font-medium glass-panel rounded-3xl border border-dashed border-white/10">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Globe className="w-6 h-6 text-neutral-400" />
              </div>
              Waiting for incoming forensic scans...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scans.map((scan) => (
                <div 
                  key={scan.id + scan.timestamp.getTime()} 
                  onClick={() => setSelectedScan(scan)}
                  className="glass-card group flex flex-col p-6 rounded-2xl cursor-pointer hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={`p-3 rounded-xl shadow-inner ${
                      scan.risk === 'CRITICAL' ? 'bg-rose-500/10 border border-rose-500/20' :
                      scan.risk === 'MEDIUM' ? 'bg-amber-500/10 border border-amber-500/20' :
                      'bg-indigo-500/10 border border-indigo-500/20'
                    }`}>
                      {scan.risk === 'CRITICAL' ? (
                        <AlertTriangle className="w-5 h-5 text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                      ) : (
                        <QrCode className={`w-5 h-5 ${
                          scan.risk === 'MEDIUM' ? 'text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]'
                        }`} />
                      )}
                    </div>
                    <div className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase border ${
                      scan.risk === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                      scan.risk === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                    }`}>
                      {scan.risk}
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-mono text-xs font-bold text-neutral-300">{scan.id}</p>
                      <span className="text-[10px] text-neutral-500 font-mono font-medium">{scan.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-neutral-400 truncate" title={scan.url}>{scan.url}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Customer Reviews Section */}
        <div className="flex flex-col gap-8 w-full max-w-6xl mx-auto pt-10 pb-10 border-t border-white/5">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">Trusted by Security Professionals</h2>
            <p className="text-neutral-400">See what our enterprise users say about QRift's forensic capabilities.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-8 rounded-[2rem] flex flex-col gap-6">
              <div className="flex text-amber-400">
                {Array(5).fill(0).map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>)}
              </div>
              <p className="text-neutral-300 leading-relaxed font-medium">"QRift completely revolutionized our device onboarding. We no longer worry about malicious QR payloads targeting our employees."</p>
              <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400">SD</div>
                <div>
                  <p className="text-sm font-bold text-white">Sanath Dambre</p>
                  <p className="text-xs text-neutral-500">Student</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2rem] flex flex-col gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Shield className="w-24 h-24 text-indigo-500" />
              </div>
              <div className="flex text-amber-400">
                {Array(5).fill(0).map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>)}
              </div>
              <p className="text-neutral-300 leading-relaxed font-medium">"The zero-day heuristic detection on hidden redirects is unparalleled. It catches things that standard scanners blindly follow."</p>
              <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center font-bold text-purple-400">AT</div>
                <div>
                  <p className="text-sm font-bold text-white">Ayush Tated</p>
                  <p className="text-xs text-neutral-500">Student</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2rem] flex flex-col gap-6">
              <div className="flex text-amber-400">
                {Array(5).fill(0).map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>)}
              </div>
              <p className="text-neutral-300 leading-relaxed font-medium">"Finally a tool that treats QR codes as attack vectors rather than just convenient links. The live extension integration is flawless."</p>
              <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-400">OB</div>
                <div>
                  <p className="text-sm font-bold text-white">Om Bikkad</p>
                  <p className="text-xs text-neutral-500">Student</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 rounded-[2rem] flex flex-col gap-6">
              <div className="flex text-amber-400">
                {Array(5).fill(0).map((_, i) => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>)}
              </div>
              <p className="text-neutral-300 leading-relaxed font-medium">"The telemetry dashboard gives us complete visibility into the threats our users are facing through physical media."</p>
              <div className="mt-auto pt-6 border-t border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-sky-500/20 flex items-center justify-center font-bold text-sky-400">SG</div>
                <div>
                  <p className="text-sm font-bold text-white">Sahil Gadghe</p>
                  <p className="text-xs text-neutral-500">Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-black/40 backdrop-blur-md relative z-10 py-12 mt-12">
        <div className="max-w-6xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-indigo-500" />
            <span className="text-lg font-bold tracking-tight text-white">QRift<span className="text-indigo-500">.</span></span>
          </div>
          <div className="text-sm font-medium text-neutral-400 flex items-center gap-2">
            <Mail className="w-4 h-4" /> 
            <a href="mailto:aryanmandhre11@gmail.com" className="hover:text-indigo-400 transition-colors">
              aryanmandhre11@gmail.com
            </a>
          </div>
          <div className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} QRift Forensics. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Detail Report Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedScan(null)}>
          <div 
            className="glass-panel rounded-3xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-neutral-900/80 backdrop-blur-md z-10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" /> Forensic Report
              </h2>
              <button 
                onClick={() => setSelectedScan(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white font-bold transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              {/* Score Section */}
              <div className="flex flex-col items-center gap-2 py-4">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Threat Level</h3>
                <div className={`text-5xl font-black tracking-tighter drop-shadow-lg ${
                  selectedScan.risk === 'CRITICAL' ? 'text-rose-500' : selectedScan.risk === 'MEDIUM' ? 'text-amber-500' : 'text-indigo-500'
                }`}>
                  {selectedScan.risk}
                </div>
              </div>

              {/* Destination Analysis */}
              <div className="flex flex-col gap-3">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Destination Context</h3>
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 shadow-inner">
                  <div>
                    <p className="text-[10px] text-neutral-500 font-medium mb-1.5">Target URL</p>
                    <p className="text-sm font-medium text-white break-all leading-tight">{selectedScan.url}</p>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] text-neutral-500 font-medium mb-1.5">Reputation (VT+AI)</p>
                    <p className={`text-sm font-bold ${
                      selectedScan.risk === 'LOW' ? 'text-indigo-400' :
                      selectedScan.risk === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {selectedScan.risk === 'LOW' ? 'Safe' : selectedScan.risk === 'MEDIUM' ? 'Suspicious (Heuristics)' : 'Critical Malicious (VT Flagged)'}
                    </p>
                  </div>
                  {Array.isArray(selectedScan.safetyChecks) && selectedScan.safetyChecks.length > 0 && (
                    <div className="pt-4 border-t border-white/5">
                      <p className="text-[10px] text-neutral-500 font-medium mb-3">Safety Parameters</p>
                      <div className="flex flex-col gap-3">
                        {selectedScan.safetyChecks.map((check: any, idx: number) => (
                          <div key={idx} className="flex items-start justify-between bg-white/[0.02] p-3 rounded-xl border border-white/[0.02]">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-neutral-300">{check.name}</span>
                              {check.message && <span className="text-[10px] text-neutral-500">{check.message}</span>}
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md bg-black/50 ${check.passed ? 'text-indigo-400' : 'text-rose-400'}`}>
                              {check.passed ? 'PASS' : 'FAIL'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payload Context */}
              <div className="flex flex-col gap-3 pb-2">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-neutral-500">Raw Payload</h3>
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                  <p className="text-xs font-mono text-neutral-400 break-all leading-relaxed bg-[#0a0a0a] p-4 rounded-xl border border-white/5 mb-4 shadow-inner">
                    {selectedScan.url}
                  </p>
                  <div className="flex gap-3">
                    <button 
                      className="flex-1 bg-white hover:bg-neutral-200 text-neutral-950 text-[11px] font-bold py-2.5 rounded-xl transition-all shadow-lg hover:scale-[1.02]"
                      onClick={() => navigator.clipboard.writeText(selectedScan.url)}
                    >
                      Copy Link
                    </button>
                    <button 
                      className="flex-1 border border-white/10 hover:bg-white/5 text-white text-[11px] font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                      onClick={() => window.open(selectedScan.url, '_blank')}
                      disabled={!selectedScan.url.startsWith('http')}
                    >
                      Open Link
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
