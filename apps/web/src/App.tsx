import { Shield, QrCode, Lock, Globe, ArrowRight } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-cyan-400" />
          <span className="text-xl font-bold tracking-tight">QRift</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">Features</a>
          <a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">Security</a>
          <a href="#" className="text-slate-300 hover:text-cyan-400 transition-colors">Documentation</a>
          <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-5 py-2 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:shadow-[0_0_25px_rgba(34,211,238,0.5)]">
            Install Extension
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-24 flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Extension v1.1 Live
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Defend against <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Malicious QR Codes.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
            QRift is a metamorphic forensic scanner that protects you from phishing, tracking, and obfuscated payloads hidden inside QR codes across the entire web.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
            <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 px-8 py-4 rounded-xl font-bold text-lg transition-all">
              View Dashboard
            </button>
          </div>
        </div>

        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full"></div>
          <div className="relative bg-graphite-900 border border-slate-800 p-8 rounded-3xl shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="w-5 h-5 text-cyan-400" />
                Live Scan Telemetry
              </h3>
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-md font-mono">SECURE</span>
            </div>
            
            <div className="space-y-4">
              {[
                { id: 'SCN-892', risk: 'LOW', url: 'https://example.com' },
                { id: 'SCN-891', risk: 'CRITICAL', url: 'http://malicious-phishing.com' },
                { id: 'SCN-890', risk: 'MEDIUM', url: 'http://sneaky-redirect.net' }
              ].map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-900 rounded-lg">
                      <QrCode className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-mono text-sm text-slate-300">{scan.id}</p>
                      <p className="text-xs text-slate-500 truncate w-48">{scan.url}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-md text-xs font-bold ${
                    scan.risk === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                    scan.risk === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-cyan-500/20 text-cyan-400'
                  }`}>
                    {scan.risk}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-slate-950 py-24 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-8 grid md:grid-cols-3 gap-12">
          <div>
            <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-6">
              <Lock className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Local-First Privacy</h3>
            <p className="text-slate-400 leading-relaxed">All QR code decoding and forensic analysis happens entirely offline within your browser. No images are ever sent to our servers.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6">
              <QrCode className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Metamorphic Scanning</h3>
            <p className="text-slate-400 leading-relaxed">Our advanced heuristics process blurred, skewed, and obfuscated QR codes that standard phone cameras can't read.</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6">
              <Globe className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Global Protection</h3>
            <p className="text-slate-400 leading-relaxed">Integrated directly into Chrome, QRift automatically detects and warns you about malicious QR codes anywhere on the web.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
