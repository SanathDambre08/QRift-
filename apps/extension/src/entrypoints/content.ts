export default defineContentScript({
  matches: ['*://mail.google.com/*'],
  main() {
    console.log('QRift Gmail integration active.');

    const observer = new MutationObserver((mutations) => {
      // Throttle and check for new images in the DOM
      // In a full implementation, we'd specifically look for images with potential QR codes
      // and inject the inline badge next to them.
    });

    observer.observe(document.body, { childList: true, subtree: true });
    
    // For demo purposes, we can simulate sending a candidate to the background
    // browser.runtime.sendMessage({ type: 'QR_CANDIDATES_FOUND', ... });
  },
});
