import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: 'src',
  modules: ['@wxt-dev/module-react'],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: "QRift",
    description: "Metamorphic forensic scanner for QR codes",
    action: {},
    permissions: [
      'sidePanel',
      'storage',
      'scripting',
      'activeTab',
      'contextMenus',
      'offscreen'
    ],
    host_permissions: [
      '*://*/*'
    ]
  }
});
