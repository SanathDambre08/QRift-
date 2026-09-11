import { browser } from 'wxt/browser';

export default defineBackground(() => {
  console.log('QRift background service worker started.', { id: browser.runtime.id });
  
  // Set up offscreen document
  async function setupOffscreenDocument(path: string) {
    if (await browser.offscreen.hasDocument()) return;
    await browser.offscreen.createDocument({
      url: browser.runtime.getURL(path),
      reasons: [browser.offscreen.Reason.DOM_PARSER], // DOM_PARSER or other suitable reason for canvas
      justification: 'QR code image processing and decoding'
    });
  }

  // Listen for messages to forward or handle
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_DEEP_VERIFY') {
      setupOffscreenDocument('offscreen/index.html').then(() => {
        // Forward message to offscreen
        browser.runtime.sendMessage({ ...message, type: 'RUN_QR_ANALYSIS' }).then(sendResponse);
      });
      return true;
    }
  });
});

