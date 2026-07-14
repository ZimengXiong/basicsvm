import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const outputRoot = path.join(root, 'public', 'og');
const logo = await fs.readFile(path.join(root, 'public', 'logo.webp'));
const logoPng = await sharp(logo).png().toBuffer();
const logoUrl = `data:image/png;base64,${logoPng.toString('base64')}`;

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function wrapTitle(value) {
  const words = value.split(/\s+/);
  const limit = value.length > 55 ? 20 : 23;
  const lines = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > limit && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

async function markdownFiles(directory, prefix = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'public') continue;
    const relative = path.join(prefix, entry.name);
    if (entry.isDirectory()) files.push(...await markdownFiles(path.join(directory, entry.name), relative));
    else if (entry.name.endsWith('.md')) files.push(relative);
  }
  return files;
}

await fs.rm(outputRoot, { recursive: true, force: true });

for (const relativePath of await markdownFiles(root)) {
  if (relativePath === 'index.md') continue;
  const markdown = await fs.readFile(path.join(root, relativePath), 'utf8');
  const heading = markdown.match(/^#\s+(.+)$/m)?.[1]?.replace(/[`*_]/g, '') || 'bASICs VM';
  const title = `${heading} - bASICs VM`;
  const lines = wrapTitle(title);
  const fontSize = lines.length >= 3 ? 48 : lines.length === 2 ? 56 : 62;
  const lineHeight = Math.round(fontSize * 1.12);
  const titleY = lines.length === 1 ? 280 : lines.length === 2 ? 248 : 220;
  const tspans = lines.map((line, index) =>
    `<tspan x="545" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
  ).join('');
  const output = path.join(outputRoot, relativePath.replace(/\.md$/, '.png'));

  const svg = `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="blur"><feGaussianBlur stdDeviation="58"/></filter>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#777" flood-opacity=".35"/>
        </filter>
        <clipPath id="card"><rect x="0" y="0" width="400" height="467" rx="28"/></clipPath>
      </defs>
      <rect width="1200" height="630" fill="#fff"/>
      <g transform="translate(-90 10) rotate(-21 240 281)" opacity=".9" filter="url(#blur)">
        <image href="${logoUrl}" width="481" height="562" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <g transform="translate(76 82) rotate(-7 200 233)" filter="url(#shadow)">
        <rect x="-6" y="-6" width="412" height="479" rx="34" fill="#eee"/>
        <image href="${logoUrl}" width="400" height="467" preserveAspectRatio="xMidYMid slice" clip-path="url(#card)"/>
      </g>
      <rect x="545" y="148" width="330" height="43" rx="22" fill="#dbdbdb" fill-opacity=".7"/>
      <text x="565" y="176" fill="#000" font-family="Arial, Helvetica, sans-serif" font-size="22">basics.alpacawebservices.com</text>
      <text x="545" y="${titleY}" fill="#000" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="900">${tspans}</text>
      <g filter="url(#shadow)">
        <rect x="545" y="485" width="230" height="62" rx="31" fill="#000"/>
        <text x="660" y="525" text-anchor="middle" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="600">Read Docs</text>
      </g>
    </svg>`;

  await fs.mkdir(path.dirname(output), { recursive: true });
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(output);
}
