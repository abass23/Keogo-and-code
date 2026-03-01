/**
 * Generates PWA icons as SVG files in public/icons/.
 * Run: node scripts/generate-icons.mjs
 *
 * For production, replace the PNGs with a proper logo using a tool like:
 *   npx pwa-asset-generator logo.svg public/icons
 */

import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = resolve(__dirname, '../public/icons');
mkdirSync(iconsDir, { recursive: true });

function makeSVG(size, maskable = false) {
  const padding = maskable ? size * 0.15 : size * 0.1;
  const inner = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const r = inner / 2;

  // CPU chip icon — matches the app header icon
  const chipSize = inner * 0.45;
  const chipX = cx - chipSize / 2;
  const chipY = cy - chipSize / 2;
  const pinLen = inner * 0.08;
  const pinGap = chipSize / 4;
  const pinW = inner * 0.025;

  // Build pin lines (4 per side)
  const pins = [];
  for (let i = 1; i <= 3; i++) {
    const t = chipX + (chipSize * i) / 4;
    const l = chipX - pinLen;
    const rb = chipX + chipSize + pinLen;
    const tv = chipY + (chipSize * i) / 4;
    const tp = chipY - pinLen;
    const bv = chipY + chipSize + pinLen;

    // left pins
    pins.push(`<line x1="${l}" y1="${tv}" x2="${chipX}" y2="${tv}" stroke="#22d3ee" stroke-width="${pinW}" stroke-linecap="round"/>`);
    // right pins
    pins.push(`<line x1="${chipX + chipSize}" y1="${tv}" x2="${rb}" y2="${tv}" stroke="#22d3ee" stroke-width="${pinW}" stroke-linecap="round"/>`);
    // top pins
    pins.push(`<line x1="${t}" y1="${tp}" x2="${t}" y2="${chipY}" stroke="#22d3ee" stroke-width="${pinW}" stroke-linecap="round"/>`);
    // bottom pins
    pins.push(`<line x1="${t}" y1="${chipY + chipSize}" x2="${t}" y2="${bv}" stroke="#22d3ee" stroke-width="${pinW}" stroke-linecap="round"/>`);
  }

  const gridSpacing = chipSize / 4;
  const dotR = chipSize * 0.025;
  const dots = [];
  for (let row = 1; row <= 3; row++) {
    for (let col = 1; col <= 3; col++) {
      dots.push(`<circle cx="${chipX + gridSpacing * col}" cy="${chipY + gridSpacing * row}" r="${dotR}" fill="#22d3ee" opacity="0.5"/>`);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${maskable ? size * 0.18 : size * 0.22}" fill="#09090b"/>
  <rect x="${chipX}" y="${chipY}" width="${chipSize}" height="${chipSize}"
        rx="${chipSize * 0.12}" fill="none" stroke="#22d3ee" stroke-width="${chipSize * 0.06}"/>
  ${pins.join('\n  ')}
  ${dots.join('\n  ')}
  <text x="${cx}" y="${cy + inner * 0.28}" text-anchor="middle"
        font-family="monospace" font-size="${inner * 0.14}" font-weight="bold"
        fill="#22d3ee" opacity="0.9">K&amp;C</text>
</svg>`;
}

const sizes = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-maskable-512.png', size: 512, maskable: true },
];

for (const { name, size, maskable } of sizes) {
  const svgName = name.replace('.png', '.svg');
  const svgPath = resolve(iconsDir, svgName);
  writeFileSync(svgPath, makeSVG(size, maskable));
  console.log(`✓ Created ${svgPath}`);
}

console.log('\nSVG icons created in public/icons/');
console.log('Note: The manifest references .png files.');
console.log('To convert SVGs to PNGs, run:');
console.log('  npx pwa-asset-generator public/icons/icon-512.svg public/icons --icon-only --favicon');
console.log('\nOr use https://www.pwabuilder.com/imageGenerator to generate proper PNGs from an image.');
