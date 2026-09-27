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

// 4. Update Adaptive Icon XMLs to match the flat Gboard Material You Emblem
const bgXmlPath = path.join(appMainDir, 'res', 'values', 'ic_launcher_background.xml');
if (fs.existsSync(bgXmlPath)) {
  fs.writeFileSync(
    bgXmlPath,
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#1E232E</color>
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
    <!-- Top 4 Gboard Color Dots -->
    <path android:fillColor="#4285F4" android:pathData="M35,31 m-3.5,0 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0" />
    <path android:fillColor="#EA4335" android:pathData="M47,31 m-3.5,0 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0" />
    <path android:fillColor="#FBBC04" android:pathData="M59,31 m-3.5,0 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0" />
    <path android:fillColor="#34A853" android:pathData="M71,31 m-3.5,0 a3.5,3.5 0 1,0 7,0 a3.5,3.5 0 1,0 -7,0" />

    <!-- Row 1 Flat Keys -->
    <path android:fillColor="#2F3542" android:pathData="M28,41 h11 a2.5,2.5 0 0 1 2.5,2.5 v7 a2.5,2.5 0 0 1 -2.5,2.5 h-11 a2.5,2.5 0 0 1 -2.5,-2.5 v-7 a2.5,2.5 0 0 1 2.5,-2.5 z" />
    <path android:fillColor="#2F3542" android:pathData="M43,41 h11 a2.5,2.5 0 0 1 2.5,2.5 v7 a2.5,2.5 0 0 1 -2.5,2.5 h-11 a2.5,2.5 0 0 1 -2.5,-2.5 v-7 a2.5,2.5 0 0 1 2.5,-2.5 z" />
    <path android:fillColor="#2F3542" android:pathData="M58,41 h11 a2.5,2.5 0 0 1 2.5,2.5 v7 a2.5,2.5 0 0 1 -2.5,2.5 h-11 a2.5,2.5 0 0 1 -2.5,-2.5 v-7 a2.5,2.5 0 0 1 2.5,-2.5 z" />
    <path android:fillColor="#2F3542" android:pathData="M73,41 h9 a2.5,2.5 0 0 1 2.5,2.5 v7 a2.5,2.5 0 0 1 -2.5,2.5 h-9 a2.5,2.5 0 0 1 -2.5,-2.5 v-7 a2.5,2.5 0 0 1 2.5,-2.5 z" />

    <!-- Row 2 Flat Keys with Highlighted Center Key -->
    <path android:fillColor="#2F3542" android:pathData="M31,56 h11 a2.5,2.5 0 0 1 2.5,2.5 v7 a2.5,2.5 0 0 1 -2.5,2.5 h-11 a2.5,2.5 0 0 1 -2.5,-2.5 v-7 a2.5,2.5 0 0 1 2.5,-2.5 z" />
    <path android:fillColor="#A8C7FA" android:pathData="M46,56 h18 a2.5,2.5 0 0 1 2.5,2.5 v7 a2.5,2.5 0 0 1 -2.5,2.5 h-18 a2.5,2.5 0 0 1 -2.5,-2.5 v-7 a2.5,2.5 0 0 1 2.5,-2.5 z" />
    <path android:fillColor="#2F3542" android:pathData="M68,56 h11 a2.5,2.5 0 0 1 2.5,2.5 v7 a2.5,2.5 0 0 1 -2.5,2.5 h-11 a2.5,2.5 0 0 1 -2.5,-2.5 v-7 a2.5,2.5 0 0 1 2.5,-2.5 z" />

    <!-- Row 3 Flat Spacebar & Pill Enter -->
    <path android:fillColor="#252A34" android:pathData="M28,71 h9 a2.5,2.5 0 0 1 2.5,2.5 v6 a2.5,2.5 0 0 1 -2.5,2.5 h-9 a2.5,2.5 0 0 1 -2.5,-2.5 v-6 a2.5,2.5 0 0 1 2.5,-2.5 z" />
    <path android:fillColor="#3A4152" android:pathData="M41,71 h28 a4,4 0 0 1 4,4 v3 a4,4 0 0 1 -4,4 h-28 a4,4 0 0 1 -4,-4 v-3 a4,4 0 0 1 4,-4 z" />
    <path android:fillColor="#A8C7FA" android:pathData="M73,71 h9 a4,4 0 0 1 4,4 v3 a4,4 0 0 1 -4,4 h-9 a4,4 0 0 1 -4,-4 v-3 a4,4 0 0 1 4,-4 z" />
</vector>
`,
  'utf8'
);

// 5. Generate Flat Material PNG Launcher Icons for mipmap-* folders
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

function generateGboardStylePng(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    const ny = y / size;
    for (let x = 0; x < size; x++) {
      const nx = x / size;
      const idx = rowStart + 1 + x * 4;

      // Flat Material Dark background (#1E232E)
      let r = 30, g = 35, b = 46, a = 255;

      // Top 4 dots
      if (ny >= 0.18 && ny <= 0.25) {
        if (nx >= 0.22 && nx <= 0.29) { r = 66; g = 133; b = 244; }
        else if (nx >= 0.37 && nx <= 0.44) { r = 234; g = 67; b = 53; }
        else if (nx >= 0.52 && nx <= 0.59) { r = 251; g = 188; b = 4; }
        else if (nx >= 0.67 && nx <= 0.74) { r = 52; g = 168; b = 83; }
      }

      // Row 1 flat keys
      if (ny >= 0.34 && ny <= 0.47) {
        for (let col = 0; col < 4; col++) {
          const x0 = 0.15 + col * 0.18;
          const x1 = x0 + 0.14;
          if (nx >= x0 && nx <= x1) {
            r = 47; g = 53; b = 66;
          }
        }
      }

      // Row 2 flat keys with accent center key
      if (ny >= 0.52 && ny <= 0.65) {
        if (nx >= 0.19 && nx <= 0.34) { r = 47; g = 53; b = 66; }
        else if (nx >= 0.38 && nx <= 0.62) { r = 168; g = 199; b = 250; }
        else if (nx >= 0.66 && nx <= 0.81) { r = 47; g = 53; b = 66; }
      }

      // Row 3 flat spacebar & pill enter
      if (ny >= 0.70 && ny <= 0.82) {
        if (nx >= 0.15 && nx <= 0.27) { r = 37; g = 42; b = 52; }
        else if (nx >= 0.31 && nx <= 0.69) { r = 58; g = 65; b = 82; }
        else if (nx >= 0.73 && nx <= 0.85) { r = 168; g = 199; b = 250; }
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
  ihdr[8] = 8;
  ihdr[9] = 6;
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
  const pngBuffer = generateGboardStylePng(size);
  fs.writeFileSync(path.join(dir, 'ic_launcher.png'), pngBuffer);
  fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), pngBuffer);
  fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), pngBuffer);
}

console.log('Successfully configured Android InputMethodService (TextQBoardIMEService) and flat Material You icons!');
