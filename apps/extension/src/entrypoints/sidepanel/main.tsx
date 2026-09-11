import React from 'react';
import ReactDOM from 'react-dom/client';
import '@/assets/tailwind.css';
import AppShell from '@/ui/components/AppShell';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>
);
