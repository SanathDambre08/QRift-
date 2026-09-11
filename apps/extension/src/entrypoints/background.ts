import { browser } from 'wxt/browser';

export default defineBackground(() => {
  console.log('QRift background service worker started.', { id: browser.runtime.id });
  
  // Remove openPanelOnActionClick to allow intercepting the click
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(console.error);

  browser.action.onClicked.addListener(async (tab) => {
    try {
      if (tab.windowId) {
        // 1. Open side panel manually
        await browser.sidePanel.open({ windowId: tab.windowId });
        
        // 2. Capture the visible tab
        const dataUrl = await browser.tabs.captureVisibleTab(tab.windowId, { format: 'png' });
        
        // Give the side panel a brief moment to initialize if it was just opened
        setTimeout(() => {
          browser.runtime.sendMessage({ 
            type: 'PROCESS_AUTO_SCREENSHOT', 
            payload: { dataUrl } 
          }).catch(err => {
            // If the side panel wasn't ready, it might throw, but it's usually fine
            console.error("Failed to send screenshot to side panel:", err);
          });
        }, 500);
      }
    } catch (e) {
      console.error("Action click auto-scan failed:", e);
    }
  });

  // Set up offscreen document
  async function setupOffscreenDocument() {
    if (await browser.offscreen.hasDocument()) return;
    await browser.offscreen.createDocument({
      url: browser.runtime.getURL('/offscreen.html'),
      reasons: [browser.offscreen.Reason.DOM_PARSER], // DOM_PARSER or other suitable reason for canvas
      justification: 'QR code image processing and decoding'
    });
  }

  // Listen for messages to forward or handle
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'START_DEEP_VERIFY') {
      
      const processMessage = async () => {
        let payload = message.payload || {};
        
        // If an imageUrl is provided (from content script), fetch it here in the background
        // where CORS is less restrictive, and convert to dataUrl for the offscreen document
        if (payload.imageUrl && !payload.dataUrl) {
          try {
            const res = await fetch(payload.imageUrl);
            const blob = await res.blob();
            const buffer = await blob.arrayBuffer();
            
            // Convert ArrayBuffer to base64
            let binary = '';
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]!);
            }
            const base64 = btoa(binary);
            payload.dataUrl = `data:${blob.type || 'image/png'};base64,${base64}`;
          } catch (e) {
            console.error("Failed to fetch image in background:", e);
          }
        }
        
        await setupOffscreenDocument();
        // Wait for offscreen modules to initialize
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Forward message to offscreen
        return await browser.runtime.sendMessage({ ...message, payload, type: 'RUN_QR_ANALYSIS' });
      };

      processMessage()
        .then(response => sendResponse(response))
        .catch(err => {
          console.error("QR Analysis failed:", err);
          sendResponse({ success: false, error: err.message || String(err) });
        });
        
      return true;
    }
    
    if (message.type === 'CAPTURE_AND_ANALYZE_SCREEN') {
      const processCapture = async () => {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if (!activeTab || !activeTab.windowId) {
          throw new Error('No active tab found');
        }
        
        const dataUrl = await browser.tabs.captureVisibleTab(activeTab.windowId, { format: 'png' });
        
        await setupOffscreenDocument();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return await browser.runtime.sendMessage({ 
          type: 'RUN_QR_ANALYSIS', 
          payload: { dataUrl, isScreenshot: true } 
        });
      };

      processCapture()
        .then(response => sendResponse(response))
        .catch(err => {
          console.error("Screen capture analysis failed:", err);
          sendResponse({ success: false, error: err.message || String(err) });
        });
        
      return true;
    }
  });
});

