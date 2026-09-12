# Privacy Policy for QRift

**Last Updated: September 12, 2026**

This Privacy Policy explains how the QRift Chrome Extension ("the Extension") handles data. By using the Extension, you agree to the collection and use of information in accordance with this policy.

## 1. Data Collection & Usage

QRift is built with a privacy-first architecture. We explicitly **DO NOT** collect or transmit Personally Identifiable Information (PII), browsing history, or user identity data. 

The extension performs the vast majority of its operations locally on your device:
- **Local Scanning**: Screen captures used for identifying QR codes are processed entirely locally in memory and are discarded immediately after analysis. They are never saved to disk or transmitted over the internet.

### Telemetry Data
The only data transmitted from the Extension is anonymous threat telemetry. When a QR code is scanned, the Extension sends the following metadata to our backend for dashboard analytics:
- A randomly generated scan ID.
- The decoded URL payload found in the QR code.
- The risk assessment level (e.g., LOW or CRITICAL).

This data is used solely to provide real-time threat intelligence and maintain the public telemetry dashboard. It cannot be linked back to you or your device.

## 2. Permissions Justification

To function, QRift requires specific browser permissions. Here is exactly why we need them:

- **`sidePanel`**: Required to display the QRift dashboard interface alongside your web content.
- **`storage`**: Used to save your local settings, recent scans, and historical threat logs directly on your device.
- **`scripting` & `activeTab`**: Required to safely inject isolation boundaries and block navigation to malicious URLs detected on the current page.
- **`contextMenus`**: Allows you to right-click specific images or links on a page and manually scan them using QRift.
- **`offscreen`**: Critical for privacy-preserving local analysis. It allows the extension to use standard Web APIs to decode QR codes in a hidden background document, avoiding the need to send screenshots to a remote server.
- **`host_permissions` (`*://*/*`)**: Required to monitor any website you visit for malicious QR codes and intercept dangerous payloads before they execute.

## 3. Third-Party Sharing

We do not sell, trade, or otherwise transfer your data to outside parties. Telemetry data is only displayed anonymously on the public QRift web dashboard.

## 4. Contact Us

If you have any questions about this Privacy Policy, please contact us at:
**Email:** aryanmandhre11@gmail.com
