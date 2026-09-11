import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize SQLite Database
const dbPath = path.join(process.cwd(), 'qrift-data.db');
const db = new Database(dbPath);

// Create table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS scans (
    id TEXT PRIMARY KEY,
    url TEXT NOT NULL,
    risk TEXT NOT NULL,
    timestamp TEXT NOT NULL
  )
`);

app.get('/api/scans', (req, res) => {
  const scans = db.prepare('SELECT * FROM scans ORDER BY timestamp DESC LIMIT 100').all();
  res.json(scans);
});

app.post('/api/scans', (req, res) => {
  const { id, url, risk, timestamp } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const newScan = {
    id: id || `SCN-${Math.floor(Math.random() * 10000)}`,
    url,
    risk: risk || 'LOW',
    timestamp: timestamp || new Date().toISOString()
  };

  try {
    const insert = db.prepare('INSERT INTO scans (id, url, risk, timestamp) VALUES (@id, @url, @risk, @timestamp)');
    insert.run(newScan);
    res.status(201).json(newScan);
  } catch (error) {
    console.error('Database Error:', error);
    res.status(500).json({ error: 'Failed to insert scan' });
  }
});

// Anti-Quishing Enterprise Gateway Endpoint
// Simulates Office365/Google Workspace pre-delivery scanning
app.post('/api/gateway/scan', (req, res) => {
  const { payload } = req.body;
  
  if (!payload) {
    return res.status(400).json({ error: 'No QR payload provided' });
  }

  // Simulate server-side DistilBERT / Heuristics threat analysis
  const lower = payload.toLowerCase();
  let isPhishing = false;
  let rewrittenUrl = payload;

  const threatKeywords = ['login', 'auth', 'secure', 'bit.ly', 'tinyurl.com'];
  if (threatKeywords.some(kw => lower.includes(kw)) || /https?:\/\/(?:[0-9]{1,3}\.){3}[0-9]{1,3}/.test(lower)) {
    isPhishing = true;
    // Real-time rewriting of malicious URLs (Enterprise Sandbox)
    rewrittenUrl = `https://qrift-gateway.security/blocked?original=${encodeURIComponent(payload)}`;
  }

  res.json({
    originalUrl: payload,
    action: isPhishing ? 'REWRITE_AND_BLOCK' : 'ALLOW',
    rewrittenUrl,
    detectionRate: 99.98,
    scannedAt: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`QRift Telemetry & Gateway API listening on http://localhost:${PORT}`);
});
