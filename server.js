const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Set COOP/COEP/CORP headers to enable cross-origin isolation (required for threads/SharedArrayBuffer)
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

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


