import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const rootDir = process.cwd();
const androidDir = path.join(rootDir, 'android');
const appMainDir = path.join(androidDir, 'app', 'src', 'main');
const javaPkgDir = path.join(appMainDir, 'java', 'com', 'textqboard', 'app');
const resXmlDir = path.join(appMainDir, 'res', 'xml');

if (!fs.existsSync(androidDir)) {
  console.error('Error: android/ directory does not exist. Run npx cap add android first.');
  process.exit(1);
}

// 1. Ensure target directories exist
fs.mkdirSync(javaPkgDir, { recursive: true });
fs.mkdirSync(resXmlDir, { recursive: true });

// 2. Copy AndroidManifest.xml, MainActivity.java, TextQBoardIMEService.java, and method.xml
fs.copyFileSync(
  path.join(rootDir, 'android-ime', 'AndroidManifest.xml'),
  path.join(appMainDir, 'AndroidManifest.xml')
);
fs.copyFileSync(
  path.join(rootDir, 'android-ime', 'MainActivity.java'),
  path.join(javaPkgDir, 'MainActivity.java')
);
fs.copyFileSync(
  path.join(rootDir, 'android-ime', 'TextQBoardIMEService.java'),
  path.join(javaPkgDir, 'TextQBoardIMEService.java')
);
fs.copyFileSync(
  path.join(rootDir, 'android-ime', 'method.xml'),
  path.join(resXmlDir, 'method.xml')
);

// 3. Ensure androidx.webkit:webkit is in android/app/build.gradle
const appBuildGradlePath = path.join(androidDir, 'app', 'build.gradle');
if (fs.existsSync(appBuildGradlePath)) {
  let gradleContent = fs.readFileSync(appBuildGradlePath, 'utf8');
  if (!gradleContent.includes('androidx.webkit:webkit')) {
    gradleContent = gradleContent.replace(
      'implementation project(\':capacitor-android\')',
      'implementation project(\':capacitor-android\')\n    implementation "androidx.webkit:webkit:$androidxWebkitVersion"'
    );
    fs.writeFileSync(appBuildGradlePath, gradleContent, 'utf8');
  }
}

// 4. Update Adaptive Icon XMLs to match the Text Q Board Cyber Cyan 8-Key Logo
const bgXmlPath = path.join(appMainDir, 'res', 'values', 'ic_launcher_background.xml');
if (fs.existsSync(bgXmlPath)) {
  fs.writeFileSync(
    bgXmlPath,
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0B1320</color>
</resources>
`,
    'utf8'
  );
}

const fgXmlDir = path.join(appMainDir, 'res', 'drawable-v24');
fs.mkdirSync(fgXmlDir, { recursive: true });
fs.writeFileSync(
  path.join(fgXmlDir, 'ic_launcher_foreground.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Row 1: 4 Cyber Cyan Keycaps [T] [+] [●] [—] -->
    <path android:fillColor="#16243A" android:strokeColor="#22D3EE" android:strokeWidth="1.5"
        android:pathData="M24,30 h13 a3,3 0 0 1 3,3 v13 a3,3 0 0 1 -3,3 h-13 a3,3 0 0 1 -3,-3 v-13 a3,3 0 0 1 3,-3 z" />
    <path android:fillColor="#E0F2FE" android:pathData="M27,35 h7 v2 h-2.5 v7 h-2 v-7 h-2.5 z" />

    <path android:fillColor="#16243A" android:strokeColor="#22D3EE" android:strokeWidth="1.5"
        android:pathData="M41,30 h13 a3,3 0 0 1 3,3 v13 a3,3 0 0 1 -3,3 h-13 a3,3 0 0 1 -3,-3 v-13 a3,3 0 0 1 3,-3 z" />
    <path android:fillColor="#67E8F9" android:pathData="M46.5,35.5 h2 v3 h3 v2 h-3 v3 h-2 v-3 h-3 v-2 h3 z" />

    <path android:fillColor="#16243A" android:strokeColor="#22D3EE" android:strokeWidth="1.5"
        android:pathData="M58,30 h13 a3,3 0 0 1 3,3 v13 a3,3 0 0 1 -3,3 h-13 a3,3 0 0 1 -3,-3 v-13 a3,3 0 0 1 3,-3 z" />
    <path android:fillColor="#67E8F9" android:pathData="M64.5,39.5 m-3,0 a3,3 0 1,0 6,0 a3,3 0 1,0 -6,0" />

    <path android:fillColor="#16243A" android:strokeColor="#22D3EE" android:strokeWidth="1.5"
        android:pathData="M75,30 h13 a3,3 0 0 1 3,3 v13 a3,3 0 0 1 -3,3 h-13 a3,3 0 0 1 -3,-3 v-13 a3,3 0 0 1 3,-3 z" />
    <path android:fillColor="#67E8F9" android:pathData="M78,38.5 h7 v2 h-7 z" />

    <!-- Row 2: 4 Cyber Cyan Keycaps [—] [Q] [+] [B] -->
    <path android:fillColor="#16243A" android:strokeColor="#22D3EE" android:strokeWidth="1.5"
        android:pathData="M24,50 h13 a3,3 0 0 1 3,3 v13 a3,3 0 0 1 -3,3 h-13 a3,3 0 0 1 -3,-3 v-13 a3,3 0 0 1 3,-3 z" />
    <path android:fillColor="#67E8F9" android:pathData="M27,58.5 h7 v2 h-7 z" />

    <path android:fillColor="#0E7490" android:strokeColor="#67E8F9" android:strokeWidth="1.8"
        android:pathData="M41,50 h13 a3,3 0 0 1 3,3 v13 a3,3 0 0 1 -3,3 h-13 a3,3 0 0 1 -3,-3 v-13 a3,3 0 0 1 3,-3 z" />
    <path android:fillColor="#FFFFFF" android:pathData="M44.5,55 h6 v8 h-1.5 l1.5,1.5 l-1,1 l-2,-2 h-3 z M46.5,57 v4 h2 v-4 z" />

    <path android:fillColor="#16243A" android:strokeColor="#22D3EE" android:strokeWidth="1.5"
        android:pathData="M58,50 h13 a3,3 0 0 1 3,3 v13 a3,3 0 0 1 -3,3 h-13 a3,3 0 0 1 -3,-3 v-13 a3,3 0 0 1 3,-3 z" />
    <path android:fillColor="#67E8F9" android:pathData="M63.5,55.5 h2 v3 h3 v2 h-3 v3 h-2 v-3 h-3 v-2 h3 z" />

    <path android:fillColor="#16243A" android:strokeColor="#22D3EE" android:strokeWidth="1.5"
        android:pathData="M75,50 h13 a3,3 0 0 1 3,3 v13 a3,3 0 0 1 -3,3 h-13 a3,3 0 0 1 -3,-3 v-13 a3,3 0 0 1 3,-3 z" />
    <path android:fillColor="#E0F2FE" android:pathData="M78.5,55 h5.5 v3.5 h-1 v1 h1 v3.5 h-5.5 z M80.5,56.8 v1.5 h1.8 v-1.5 z M80.5,59.8 v1.5 h1.8 v-1.5 z" />

    <!-- Bottom Glossy Pill Bar -->
    <path android:fillColor="#E2E8F0" android:strokeColor="#38BDF8" android:strokeWidth="1.5"
        android:pathData="M31,73 h46 a5,5 0 0 1 5,5 v2 a5,5 0 0 1 -5,5 h-46 a5,5 0 0 1 -5,-5 v-2 a5,5 0 0 1 5,-5 z" />
    <path android:fillColor="#0F172A" android:pathData="M36,77.5 h36 v3 h-36 z" />
</vector>
`,
  'utf8'
);

// 5. Generate PNG Launcher Icons for mipmap-* folders (pure Node.js PNG encoder)
function createCrc32Table() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}
const crcTable = createCrc32Table();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generateTextQBoardPng(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0; // filter type 0
    const ny = y / size;
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const idx = rowStart + 1 + x * 4;

      // Dark slate background (#0b1320)
      let r = 11, g = 19, b = 32, a = 255;

      // Draw 4x2 grid of Cyber Cyan keycaps in middle
      const inRow1 = ny >= 0.20 && ny <= 0.43;
      const inRow2 = ny >= 0.46 && ny <= 0.69;
      if (inRow1 || inRow2) {
        for (let col = 0; col < 4; col++) {
          const x0 = 0.12 + col * 0.195;
          const x1 = x0 + 0.17;
          const y0 = inRow1 ? 0.20 : 0.46;
          const y1 = y0 + 0.23;
          if (nx >= x0 && nx <= x1 && ny >= y0 && ny <= y1) {
            const isBorder =
              nx - x0 < 0.018 || x1 - nx < 0.018 || ny - y0 < 0.018 || y1 - ny < 0.018;
            if (isBorder) {
              // Glowing Cyan border (#22d3ee)
              r = 34; g = 211; b = 238;
            } else {
              // Keycap interior (#18253a)
              r = 24; g = 37; b = 58;
              // Center symbol glow
              const cx = (x0 + x1) / 2;
              const cy = (y0 + y1) / 2;
              if (Math.abs(nx - cx) < 0.035 && Math.abs(ny - cy) < 0.035) {
                r = 224; g = 242; b = 254;
              }
            }
          }
        }
      }

      // Bottom white-cyan pill ("Text Q Board")
      if (ny >= 0.74 && ny <= 0.86 && nx >= 0.18 && nx <= 0.82) {
        const isPillBorder =
          nx - 0.18 < 0.015 || 0.82 - nx < 0.015 || ny - 0.74 < 0.015 || 0.86 - ny < 0.015;
        if (isPillBorder) {
          r = 56; g = 189; b = 248;
        } else {
          r = 235; g = 244; b = 252;
        }
      }

      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const compressed = zlib.deflateSync(raw);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

const mipmapSizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

for (const { folder, size } of mipmapSizes) {
  const dir = path.join(appMainDir, 'res', folder);
  fs.mkdirSync(dir, { recursive: true });
  const pngBuffer = generateTextQBoardPng(size);
  fs.writeFileSync(path.join(dir, 'ic_launcher.png'), pngBuffer);
  fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), pngBuffer);
  fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), pngBuffer);
}

console.log('Successfully configured Android InputMethodService (TextQBoardIMEService) and custom icons!');
