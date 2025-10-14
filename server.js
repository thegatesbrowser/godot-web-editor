const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const publishProjectTargetPath = '/api/publish_project';
const publishProjectOrigin = 'http://127.0.0.1:8000';

// Set COOP/COEP/CORP headers to enable cross-origin isolation (required for threads/SharedArrayBuffer)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.options('/api/publish_project', (req, res) => {
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204);
});

app.use('/api/publish_project', createProxyMiddleware({
  target: publishProjectOrigin,
  changeOrigin: true,
  pathRewrite: (path) => {
    const queryIndex = path.indexOf('?');
    if (queryIndex === -1) {
      return publishProjectTargetPath;
    }
    return `${publishProjectTargetPath}${path.slice(queryIndex)}`;
  },
  onProxyRes: (proxyRes) => {
    proxyRes.headers['access-control-allow-origin'] = '*';
  },
  onError: (err, req, res) => {
    console.error('Failed to proxy /api/publish_project request:', err);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
    }
    res.end(JSON.stringify({ error: 'Failed to publish project' }));
  },
}));

// Serve all static files from the project directory
app.use(express.static(path.join(__dirname, '.'), {
  setHeaders: (res, filePath) => {
    // Ensure correct content-type for WASM
    if (filePath.endsWith('.wasm')) {
      res.setHeader('Content-Type', 'application/wasm');
    }
  },
}));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


