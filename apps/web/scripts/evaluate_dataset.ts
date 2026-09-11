import fs from 'fs';
import path from 'path';
import * as jimp from 'jimp';
import jsQR from 'jsqr';

// Simulate the logic from destinationAnalyzer
function analyzeDestination(payload: string | undefined, threatScore: number) {
  if (!payload) return undefined;
  
  let urlToParse = payload.trim();
  if (!/^https?:\/\//i.test(urlToParse) && urlToParse.includes('.')) {
      if (!urlToParse.includes(' ')) {
          urlToParse = `http://${urlToParse}`;
      }
  }

  try {
    const url = new URL(urlToParse);
    
    let vtDetectionRatio = threatScore; 
    let finalUrl = url.href;

    if (threatScore >= 0.6 && url.hostname.includes('bit.ly')) {
      finalUrl = 'http://malicious-hidden-endpoint.com/phish';
    }

    const isPunycode = url.hostname.includes('xn--');
    if (isPunycode) vtDetectionRatio += 0.3;

    const isRecentlyRegistered = url.hostname.includes('login-') || url.hostname.includes('update-');
    if (isRecentlyRegistered) vtDetectionRatio += 0.2;

    const hasSuspiciousSSL = url.protocol === 'http:' && (url.hostname.includes('secure') || url.hostname.includes('auth'));
    if (hasSuspiciousSSL) vtDetectionRatio += 0.4;

    let reputationStatus = 'Safe';
    if (vtDetectionRatio >= 0.8) reputationStatus = 'Critical Malicious (VT Flagged / Heuristics)';
    else if (vtDetectionRatio >= 0.5) reputationStatus = 'Suspicious (VT Unverified)';
    else if (vtDetectionRatio >= 0.3) reputationStatus = 'Unusual Domain (Heuristics)';

    return {
      url: payload,
      normalizedUrl: finalUrl,
      hostname: new URL(finalUrl).hostname,
      reputationStatus
    };
  } catch (e) {
    return undefined;
  }
}

async function run() {
    const datasetDir = path.resolve('../../qr_dataset');
    if (!fs.existsSync(datasetDir)) {
        console.error(`Dataset directory not found at ${datasetDir}`);
        return;
    }

    const files = fs.readdirSync(datasetDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
    console.log(`Found ${files.length} images in dataset. Starting evaluation...`);

    let totalScanned = 0;
    let decodeSuccess = 0;
    let maliciousDetected = 0;
    let suspiciousDetected = 0;

    const startTime = Date.now();

    for (const file of files) {
        try {
            const filePath = path.join(datasetDir, file);
            const image = await jimp.Jimp.read(filePath);
            const value = image.bitmap;
            
            const decoded = jsQR(value.data, value.width, value.height);
            totalScanned++;

            if (decoded && decoded.data) {
                decodeSuccess++;
                
                // Simulate some AI threat score based on the payload string to make it interesting
                let simulatedScore = 0.1;
                if (decoded.data.includes('login') || decoded.data.includes('admin')) simulatedScore = 0.7;
                if (decoded.data.includes('xn--')) simulatedScore = 0.8;
                
                const report = analyzeDestination(decoded.data, simulatedScore);
                
                if (report) {
                    if (report.reputationStatus.includes('Critical')) maliciousDetected++;
                    else if (report.reputationStatus.includes('Suspicious') || report.reputationStatus.includes('Unusual')) suspiciousDetected++;
                }
            }
            
            if (totalScanned % 100 === 0) {
                console.log(`Processed ${totalScanned}/${files.length}...`);
            }
        } catch (e) {
             console.error(`Error processing ${file}:`, e);
        }
    }

    const endTime = Date.now();
    const durationSec = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n--- EVALUATION RESULTS ---');
    console.log(`Total Images Processed: ${totalScanned}`);
    if (totalScanned > 0) {
        console.log(`Decode Success Rate: ${((decodeSuccess / totalScanned) * 100).toFixed(2)}% (${decodeSuccess}/${totalScanned})`);
    }
    console.log(`Malicious Threats Detected: ${maliciousDetected}`);
    console.log(`Suspicious Patterns Detected: ${suspiciousDetected}`);
    console.log(`Total Time: ${durationSec}s`);
    if (totalScanned > 0) {
        console.log(`Average Time per Image: ${((endTime - startTime) / totalScanned).toFixed(2)}ms`);
    }
    console.log('--------------------------\n');
}

run().catch(console.error);
