#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// SVG template for PWA icons
const createSVGIcon = (size) => `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#gradient)"/>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central"
        font-family="system-ui, -apple-system, sans-serif"
        font-weight="bold"
        font-size="${size * 0.4}"
        fill="white">S</text>
</svg>`;

// Icon sizes required for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generating PWA icons...');

iconSizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ Generated ${filename}`);
});

// Create a favicon as well
const faviconSVG = createSVGIcon(32);
fs.writeFileSync(path.join(__dirname, '..', 'public', 'favicon.svg'), faviconSVG);
console.log('✅ Generated favicon.svg');

console.log('\n🚀 All PWA icons generated successfully!');
console.log('📝 Note: These are placeholder SVG icons. Consider replacing with custom PNG icons for better compatibility.');