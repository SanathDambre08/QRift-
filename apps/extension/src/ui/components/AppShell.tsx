import React, { useState } from 'react';
import Header from './Header';
import SidePanelHome from '../screens/SidePanelHome';
import QRDetail from '../screens/QRDetail';

export default function AppShell() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'detail' | 'settings'>('home');
  const [selectedScanId, setSelectedScanId] = useState<string | null>(null);

  const navigateToDetail = (scanId: string) => {
    setSelectedScanId(scanId);
    setCurrentScreen('detail');
  };

  return (
    <div className="flex flex-col h-screen bg-graphite-900 text-gray-100 overflow-hidden font-sans">
      <Header />
      <main className="flex-1 overflow-y-auto p-4">
        {currentScreen === 'home' && <SidePanelHome onSelectScan={navigateToDetail} />}
        {currentScreen === 'detail' && selectedScanId && <QRDetail scanId={selectedScanId} onBack={() => setCurrentScreen('home')} />}
      </main>
    </div>
  );
}
