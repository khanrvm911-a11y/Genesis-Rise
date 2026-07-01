import { readFileSync, existsSync } from 'fs';
import { createServer } from 'http';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const dist = join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

if (!existsSync(dist)) {
  console.error('dist/ folder not found. Run "npm run build" first.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
};

createServer((req, res) => {
  const path = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const filePath = join(dist, path);

  if (existsSync(filePath)) {
    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(path)] || 'application/octet-stream' });
    res.end(content);
  } else {
    const idx = readFileSync(join(dist, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(idx);
  }
}).listen(PORT, () => {
  console.log(`Serving on port ${PORT}`);
});
