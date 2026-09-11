import React, { useState } from 'react';
import Header from './Header';
import SidePanelHome from '../screens/SidePanelHome';
import QRDetail from '../screens/QRDetail';
import { ErrorBoundary } from './ErrorBoundary';

export default function AppShell() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'detail' | 'settings'>('home');
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  const navigateToDetail = (scanId: string) => {
    setSelectedScanId(scanId);
    setCurrentScreen('detail');
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-50 overflow-hidden font-sans">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <ErrorBoundary>
          {currentScreen === 'home' && <SidePanelHome onSelectScan={navigateToDetail} />}
          {currentScreen === 'detail' && selectedScanId && <QRDetail scanId={selectedScanId} onBack={() => setCurrentScreen('home')} />}
        </ErrorBoundary>
      </main>
    </div>
  );
}
