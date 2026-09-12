# Chrome Web Store Listing — QRift

> Last Updated: 2026-09-12

## Store Listing

**Extension Name** [REQUIRED]
QRift

**Short Description** [REQUIRED]
Metamorphic forensic scanner for QR codes. Detects and blocks malicious payloads in real-time.

**Detailed Description** [REQUIRED]
QRift is a privacy-first forensic browser extension that actively detects and mitigates malicious QR code payloads in real-time.

Features:
- Automated local screen scanning for QR codes without relying on remote servers.
- Privacy-first approach using hidden offscreen document processing.
- Manual right-click context menu scanning for specific images.
- A high-end developer dashboard that tracks real-time threat telemetry anonymously.
- Automatic navigation blocking when critical malicious URLs are detected on the active page.

How to Use:
1. Install the extension and pin it to your browser toolbar.
2. The extension automatically monitors the active page. If a malicious QR code is displayed, it will intercept and warn you.
3. You can also right-click on any image containing a QR code and select "Scan with QRift".
4. Open the side panel by clicking the extension icon to view recent threat logs.

Privacy Note:
QRift performs all its QR decoding locally on your device. We do not collect personally identifiable information (PII). We only send anonymous telemetry data (the QR URL and risk level) to maintain our public threat intelligence dashboard.

Support:
Contact us at aryanmandhre11@gmail.com for questions or issues.

**Category** [REQUIRED]
Developer Tools

**Single Purpose** [REQUIRED]
Detects and blocks malicious QR codes in real-time through privacy-first local scanning.

**Primary Language** [REQUIRED]
English

## Graphics & Assets

| Asset | Dimensions | Status | Filename |
|-------|-----------|--------|----------|
| Store Icon [REQUIRED] | 128×128 PNG | 🟡 Needs update | |
| Screenshot 1 [REQUIRED] | 1280×800 or 640×400 | 🟡 Needs update | |
| Screenshot 2 [RECOMMENDED] | 1280×800 or 640×400 | 🟡 Needs update | |
| Screenshot 3 [RECOMMENDED] | 1280×800 or 640×400 | 🟡 Needs update | |
| Small Promo Tile [RECOMMENDED] | 440×280 | 🟡 Needs update | |
| Marquee Promo Tile | 1400×560 | 🟡 Needs update | |

### Screenshot Notes
- Screenshot 1: Show the extension automatically detecting a malicious QR code on a sample phishing site with the warning active.
- Screenshot 2: Show the QRift Side Panel UI tracking recent scans.
- Screenshot 3: Show the right-click context menu "Scan with QRift" feature.

## Permissions Justification

| Permission | Type | Justification |
|------------|------|---------------|
| `sidePanel` | permissions | Used to present the user with a dashboard to view recent threat logs alongside the active webpage. |
| `storage` | permissions | Used to locally cache historical threat logs and user settings directly on the device. |
| `scripting` | permissions | Required to safely inject a protective overlay boundary and block navigation to malicious URLs detected on the active page. |
| `activeTab` | permissions | Required to interact with the currently viewed page to scan for QR codes and inject protective overlays when requested. |
| `contextMenus` | permissions | Allows users to manually initiate a targeted scan on specific images by right-clicking them. |
| `offscreen` | permissions | Critical for privacy-preserving local analysis. It allows the extension to decode QR codes in a hidden background document without relying on external servers. |
| `*://*/*` | host_permissions | Required to monitor any website the user visits for malicious QR codes and intercept dangerous payloads before they execute. |

## Privacy & Data Use

### Data Collection

**Does the extension collect user data?** Yes

| Data Type | Collected? | Transmitted Off-Device? | Purpose | Shared with Third Parties? |
|-----------|-----------|------------------------|---------|---------------------------|
| Personally identifiable info | No | No | | No |
| Health info | No | No | | No |
| Financial info | No | No | | No |
| Authentication info | No | No | | No |
| Personal communications | No | No | | No |
| Location | No | No | | No |
| Web history | No | No | | No |
| User activity | Yes | Yes | We anonymously track the URLs of scanned QR codes to provide real-time threat intelligence. | No |
| Website content | No | No | | No |

### Data Use Certification
- [x] Data is NOT sold to third parties
- [x] Data is NOT used for purposes unrelated to the extension's core functionality
- [x] Data is NOT used for creditworthiness or lending purposes

## Privacy Policy

**Privacy Policy URL** [REQUIRED]
https://github.com/SanathDambre08/QRift-/blob/main/PRIVACY_POLICY.md

## Distribution

**Visibility**: Public
**Regions**: All regions
**Pricing**: Free

## Developer Info

**Publisher Name** [REQUIRED]
QRift Team

**Contact Email** [REQUIRED]
aryanmandhre11@gmail.com

**Support URL / Email** [RECOMMENDED]
https://github.com/SanathDambre08/QRift-/issues

**Homepage URL** [RECOMMENDED]
https://github.com/SanathDambre08/QRift-

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 0.0.1 | 2026-09-12 | Initial release | Draft |

## Review Notes

### Known Issues / Limitations
None
