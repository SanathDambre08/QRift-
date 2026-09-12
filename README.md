# QRift 🛡️

**Next-Generation Forensic QR Code Analysis & Security**

![QRift Dashboard Preview](https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

QRift is an advanced, privacy-first browser extension and telemetry dashboard designed to protect users from malicious QR code payloads. By treating QR codes as active attack vectors rather than mere links, QRift provides real-time heuristic scanning and zero-day threat detection directly in your browser.

## 🌟 Key Features

- **Live Screen Analysis**: Automatically detects and scans QR codes present on your active browser tab.
- **Deep Forensic Decoding**: Extracts payloads, analyzes hidden redirects, and evaluates destination safety before you ever click or scan with your phone.
- **Zero-Day Heuristics**: Custom algorithms detect obfuscated URLs, phishing domains, and malicious intent.
- **Dynamic Telemetry Dashboard**: A beautifully designed web application featuring live global stats, animated data visualizations, and threat intelligence tracking.
- **Privacy-First**: No images leave your device. All QR detection and decoding happens locally in the browser extension.

## 🚀 Architecture

QRift is a modern monorepo built with cutting-edge tools:
- **`apps/extension`**: The core Chrome Extension built with [WXT](https://wxt.dev/) (Manifest V3), React, and TailwindCSS. Uses `jsqr` and `BarcodeDetector` for local screen analysis.
- **`apps/web`**: The live telemetry dashboard built with Vite, React, and TailwindCSS, featuring a premium glassmorphism UI and CSS-powered data animations.

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SanathDambre08/QRift-.git
   cd QRift-
   ```

2. **Install Dependencies:**
   ```bash
   pnpm install
   ```

3. **Run the Development Servers:**
   To run both the extension and the web dashboard concurrently:
   ```bash
   pnpm run dev
   ```
   - The web app will be available at `http://localhost:5173`
   - The extension will automatically load in a new Chrome instance.

## 👨‍🎓 The Team
Built by passionate cybersecurity students:
- Sanath Dambre
- Ayush Tated
- Om Bikkad
- Sahil Gadghe

## 🛡️ License
This project is licensed under the MIT License.