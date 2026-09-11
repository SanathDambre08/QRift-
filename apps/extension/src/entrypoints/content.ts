
import { browser } from 'wxt/browser';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_idle',
  main() {
    console.log('QRift Anti-Quishing: Monitoring page for QR codes...');

    const processedImages = new Set<string>();

    const analyzeImage = async (img: HTMLImageElement) => {
      // Ignore tiny tracking pixels or already processed images
      if (img.width < 50 || img.height < 50) return;
      if (processedImages.has(img.src)) return;
      processedImages.add(img.src);

      // Phase 4: Enterprise Pre-delivery & PDF Sandbox
      // Detect if we are inside a Chrome PDF viewer
      const isPdfViewer = window.location.pathname.endsWith('.pdf') || document.body.tagName.toLowerCase() === 'embed' || document.body.tagName.toLowerCase() === 'pdf-viewer';
      if (isPdfViewer) {
         console.log('[QRift] PDF Sandbox mode active: Scanning embedded PDF image');
      }

      // Check for inline base64 common in phishing emails
      const isInlineBase64 = img.src.startsWith('data:image/');
      if (isInlineBase64) {
         console.log('[QRift] Base64 Inline Image detected (Possible Email Sandbox bypass attempt)');
      }

      try {
        // Since we are in the content script, we can often fetch the image 
        // to a blob if it's same-origin, or rely on the background script otherwise.
        // We'll pass the URL to the background script.
        const response = await browser.runtime.sendMessage({
          type: 'START_DEEP_VERIFY',
          payload: { imageUrl: img.src }
        });

        if (response && response.success && response.report) {
          const report = response.report;
          if (report.status === 'critical' || report.status === 'unstable') {
            console.warn(`[QRift] Malicious QR detected! Source: ${img.src}`);
            blockMaliciousQR(img, report);
          } else {
            console.log(`[QRift] QR is safe. Source: ${img.src}`);
          }
        }
      } catch (err) {
        console.error('[QRift] Error analyzing image:', err);
      }
    };

    const blockMaliciousQR = (img: HTMLImageElement, report: any) => {
      // 1. Visually warn the user by overlaying a warning on the image
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      wrapper.style.width = img.width + 'px';
      wrapper.style.height = img.height + 'px';

      img.parentNode?.insertBefore(wrapper, img);
      wrapper.appendChild(img);

      const overlay = document.createElement('div');
      overlay.style.position = 'absolute';
      overlay.style.inset = '0';
      overlay.style.backgroundColor = 'rgba(239, 68, 68, 0.85)'; // Red-500
      overlay.style.display = 'flex';
      overlay.style.flexDirection = 'column';
      overlay.style.alignItems = 'center';
      overlay.style.justifyContent = 'center';
      overlay.style.color = 'white';
      overlay.style.fontFamily = 'sans-serif';
      overlay.style.fontWeight = 'bold';
      overlay.style.zIndex = '9999';
      overlay.style.borderRadius = '8px';
      overlay.style.pointerEvents = 'none'; // let clicks pass through to the anchor tag

      overlay.innerHTML = `
        <svg style="width:32px;height:32px;margin-bottom:8px" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
        <span style="font-size:14px;text-align:center">Malicious QR<br/>Blocked</span>
      `;
      wrapper.appendChild(overlay);

      // 2. Intercept clicks or rewrite anchor tags
      let parent = img.parentElement;
      while (parent && parent.tagName !== 'A') {
        parent = parent.parentElement;
      }

      const originalUrl = report.destination?.normalizedUrl || report.url;
      const warningUrl = browser.runtime.getURL('/blocked.html') + '?url=' + encodeURIComponent(originalUrl);

      if (parent && parent.tagName === 'A') {
        // Rewrite the href of the anchor
        parent.setAttribute('data-original-href', parent.getAttribute('href') || '');
        parent.setAttribute('href', warningUrl);
      } else {
        // If it's not wrapped in an anchor, just add a click listener to the wrapper
        wrapper.style.cursor = 'pointer';
        wrapper.style.pointerEvents = 'auto'; // Re-enable pointer events on wrapper
        overlay.style.pointerEvents = 'auto'; // allow clicking the overlay
        overlay.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          window.location.href = warningUrl;
        };
      }
    };

    // Initial scan of existing images
    document.querySelectorAll('img').forEach(analyzeImage);

    // Mutation observer for dynamically added images (e.g. SPAs, Webmail)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeName === 'IMG') {
            analyzeImage(node as HTMLImageElement);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            element.querySelectorAll('img').forEach(analyzeImage);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
});
