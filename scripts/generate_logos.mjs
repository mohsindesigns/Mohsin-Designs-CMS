import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public', 'images');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. Navy Logo (for customer confirmation & light backgrounds)
const navySvg = `
<svg width="340" height="80" viewBox="0 0 340 80" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B1F4B" />
      <stop offset="100%" stop-color="#142C66" />
    </linearGradient>
  </defs>
  <!-- Brand Circle Emblem -->
  <circle cx="40" cy="40" r="32" fill="url(#blueGrad)" />
  <text x="40" y="49" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="27" font-weight="900" fill="#FFFFFF" text-anchor="middle">M</text>
  <!-- Gold Accent Badge -->
  <circle cx="62" cy="18" r="9" fill="#E9BD36" stroke="#FFFFFF" stroke-width="2" />
  <polygon points="62,12 63.8,16 68,16.5 64.8,19.3 65.8,23.5 62,21.2 58.2,23.5 59.2,19.3 56,16.5 60.2,16" fill="#0B1F4B" />
  
  <!-- Typography -->
  <text x="86" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="27" font-weight="900" letter-spacing="1px" fill="#0B1F4B">MOHSIN</text>
  <text x="87" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="11.5" font-weight="800" letter-spacing="4px" fill="#1F5BD8">DESIGNS</text>
</svg>
`;

// 2. White Logo (for admin email dark header)
const whiteSvg = `
<svg width="300" height="70" viewBox="0 0 300 70" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="whiteBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1F5BD8" />
      <stop offset="100%" stop-color="#10389C" />
    </linearGradient>
  </defs>
  <!-- Brand Circle Emblem -->
  <circle cx="35" cy="35" r="28" fill="url(#whiteBlueGrad)" stroke="#3069E0" stroke-width="1.5" />
  <text x="35" y="43" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle">M</text>
  <!-- Gold Accent Badge -->
  <circle cx="54" cy="16" r="8" fill="#E9BD36" stroke="#0B1F4B" stroke-width="2" />
  <polygon points="54,11 55.5,14.5 59,15 56.4,17.2 57.2,20.8 54,18.8 50.8,20.8 51.6,17.2 49,15 52.5,14.5" fill="#0B1F4B" />
  
  <!-- Typography -->
  <text x="76" y="37" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="24" font-weight="900" letter-spacing="1px" fill="#FFFFFF">MOHSIN</text>
  <text x="77" y="53" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="10.5" font-weight="800" letter-spacing="3.8px" fill="#A9B6D3">DESIGNS</text>
</svg>
`;

async function run() {
  await sharp(Buffer.from(navySvg))
    .png({ quality: 100 })
    .toFile(path.join(outDir, 'logo-navy.png'));
  console.log('Created logo-navy.png');

  await sharp(Buffer.from(whiteSvg))
    .png({ quality: 100 })
    .toFile(path.join(outDir, 'logo-white.png'));
  console.log('Created logo-white.png');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
