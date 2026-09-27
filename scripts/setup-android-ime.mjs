import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const rootDir = process.cwd();
const androidDir = path.join(rootDir, 'android');
const appMainDir = path.join(androidDir, 'app', 'src', 'main');
const javaPkgDir = path.join(appMainDir, 'java', 'com', 'textqboard', 'app');
const resDir = path.join(appMainDir, 'res');
const resXmlDir = path.join(resDir, 'xml');

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
      "implementation project(':capacitor-android')",
      'implementation project(\':capacitor-android\')\n    implementation "androidx.webkit:webkit:$androidxWebkitVersion"'
    );
    fs.writeFileSync(appBuildGradlePath, gradleContent, 'utf8');
  }
}

// 4. Unified Adaptive Icon XMLs matching TextQBoardLogo & Initial Banner 100%
const valuesDir = path.join(resDir, 'values');
fs.mkdirSync(valuesDir, { recursive: true });
fs.writeFileSync(
  path.join(valuesDir, 'ic_launcher_background.xml'),
  `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#151922</color>
</resources>
`,
  'utf8'
);

// Update styles.xml so the initial launch screen uses #151922 dark theme instead of white Capacitor splash
const stylesXmlPath = path.join(valuesDir, 'styles.xml');
if (fs.existsSync(stylesXmlPath)) {
  fs.writeFileSync(
    stylesXmlPath,
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="colorPrimary">#A8C7FA</item>
        <item name="colorPrimaryDark">#111318</item>
        <item name="colorAccent">#A8C7FA</item>
        <item name="android:windowBackground">#111318</item>
        <item name="android:statusBarColor">#111318</item>
        <item name="android:navigationBarColor">#111318</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="windowActionBar">false</item>
        <item name="windowNoTitle">true</item>
        <item name="android:background">@null</item>
        <item name="android:windowBackground">#111318</item>
        <item name="android:statusBarColor">#111318</item>
        <item name="android:navigationBarColor">#111318</item>
    </style>

    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="android:background">@drawable/splash</item>
        <item name="android:windowBackground">@drawable/splash</item>
        <item name="android:statusBarColor">#111318</item>
        <item name="android:navigationBarColor">#111318</item>
    </style>
</resources>
`,
    'utf8'
  );
}

const foregroundVectorXml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <!-- Inner Keyboard Chassis Frame (Safe Zone 24..84) -->
    <path
        android:fillColor="#1E2430"
        android:strokeColor="#A8C7FA"
        android:strokeWidth="1.5"
        android:pathData="M29,28 h50 a6,6 0 0 1 6,6 v40 a6,6 0 0 1 -6,6 h-50 a6,6 0 0 1 -6,-6 v-40 a6,6 0 0 1 6,-6 z" />

    <!-- Top 4 Gboard Suggestion Strip Color Dots -->
    <path android:fillColor="#4285F4" android:pathData="M38,35 m-2.8,0 a2.8,2.8 0 1,0 5.6,0 a2.8,2.8 0 1,0 -5.6,0" />
    <path android:fillColor="#EA4335" android:pathData="M48.5,35 m-2.8,0 a2.8,2.8 0 1,0 5.6,0 a2.8,2.8 0 1,0 -5.6,0" />
    <path android:fillColor="#FBBC04" android:pathData="M59,35 m-2.8,0 a2.8,2.8 0 1,0 5.6,0 a2.8,2.8 0 1,0 -5.6,0" />
    <path android:fillColor="#34A853" android:pathData="M69.5,35 m-2.8,0 a2.8,2.8 0 1,0 5.6,0 a2.8,2.8 0 1,0 -5.6,0" />

    <!-- Row 1 High-Contrast Keycaps (#DCE2EE) -->
    <path android:fillColor="#DCE2EE" android:pathData="M30,42 h9 a2,2 0 0 1 2,2 v5.5 a2,2 0 0 1 -2,2 h-9 a2,2 0 0 1 -2,-2 v-5.5 a2,2 0 0 1 2,-2 z" />
    <path android:fillColor="#DCE2EE" android:pathData="M43,42 h9 a2,2 0 0 1 2,2 v5.5 a2,2 0 0 1 -2,2 h-9 a2,2 0 0 1 -2,-2 v-5.5 a2,2 0 0 1 2,-2 z" />
    <path android:fillColor="#DCE2EE" android:pathData="M56,42 h9 a2,2 0 0 1 2,2 v5.5 a2,2 0 0 1 -2,2 h-9 a2,2 0 0 1 -2,-2 v-5.5 a2,2 0 0 1 2,-2 z" />
    <path android:fillColor="#DCE2EE" android:pathData="M69,42 h9 a2,2 0 0 1 2,2 v5.5 a2,2 0 0 1 -2,2 h-9 a2,2 0 0 1 -2,-2 v-5.5 a2,2 0 0 1 2,-2 z" />

    <!-- Row 2 Keycaps with Highlighted Material Blue Center 'Q' Key -->
    <path android:fillColor="#DCE2EE" android:pathData="M31.5,54 h9.5 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-9.5 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z" />
    <path android:fillColor="#A8C7FA" android:pathData="M45.5,53.5 h17 a2.5,2.5 0 0 1 2.5,2.5 v7 a2.5,2.5 0 0 1 -2.5,2.5 h-17 a2.5,2.5 0 0 1 -2.5,-2.5 v-7 a2.5,2.5 0 0 1 2.5,-2.5 z" />
    <!-- Geometric 'Q' inside Center Key -->
    <path
        android:strokeColor="#062E6F"
        android:strokeWidth="2.0"
        android:pathData="M54,59.2 m-3.0,0 a3.0,3.0 0 1,0 6.0,0 a3.0,3.0 0 1,0 -6.0,0 M56,61 L58,63" />
    <path android:fillColor="#DCE2EE" android:pathData="M67,54 h9.5 a2,2 0 0 1 2,2 v6 a2,2 0 0 1 -2,2 h-9.5 a2,2 0 0 1 -2,-2 v-6 a2,2 0 0 1 2,-2 z" />

    <!-- Row 3 Bottom Functional Keys + Wide Material Blue Spacebar + Pill Enter -->
    <path android:fillColor="#6E7B91" android:pathData="M30,67 h8.5 a2,2 0 0 1 2,2 v4.5 a2,2 0 0 1 -2,2 h-8.5 a2,2 0 0 1 -2,-2 v-4.5 a2,2 0 0 1 2,-2 z" />
    <path android:fillColor="#A8C7FA" android:pathData="M42.5,67 h23 a3,3 0 0 1 3,3 v2.5 a3,3 0 0 1 -3,3 h-23 a3,3 0 0 1 -3,-3 v-2.5 a3,3 0 0 1 3,-3 z" />
    <path android:fillColor="#4285F4" android:pathData="M69.5,67 h8.5 a3,3 0 0 1 3,3 v2.5 a3,3 0 0 1 -3,3 h-8.5 a3,3 0 0 1 -3,-3 v-2.5 a3,3 0 0 1 3,-3 z" />
</vector>
`;

const drawableDir = path.join(resDir, 'drawable');
const drawableV24Dir = path.join(resDir, 'drawable-v24');
fs.mkdirSync(drawableDir, { recursive: true });
fs.mkdirSync(drawableV24Dir, { recursive: true });

fs.writeFileSync(path.join(drawableDir, 'ic_launcher_foreground.xml'), foregroundVectorXml, 'utf8');
fs.writeFileSync(path.join(drawableV24Dir, 'ic_launcher_foreground.xml'), foregroundVectorXml, 'utf8');

// Ensure mipmap-anydpi-v26 uses @drawable/ic_launcher_foreground and @color/ic_launcher_background
const anyDpiDir = path.join(resDir, 'mipmap-anydpi-v26');
fs.mkdirSync(anyDpiDir, { recursive: true });
const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
`;
fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher.xml'), adaptiveIconXml, 'utf8');
fs.writeFileSync(path.join(anyDpiDir, 'ic_launcher_round.xml'), adaptiveIconXml, 'utf8');

// 5. PNG Generator for Unified Launcher Icon AND Launch Splash Screen
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

/**
 * Evaluates the exact Text Q Board Keyboard emblem at normalized coordinates (ux, uy) in [0, 1]
 */
function sampleKeyboardEmblem(ux, uy) {
  // Base background #151922
  let r = 21, g = 25, b = 34;

  // Inner Keyboard Chassis Frame [0.11..0.89, 0.15..0.85]
  if (ux >= 0.11 && ux <= 0.89 && uy >= 0.15 && uy <= 0.85) {
    // Border stroke #A8C7FA
    if (ux < 0.135 || ux > 0.865 || uy < 0.175 || uy > 0.825) {
      r = 90; g = 115; b = 155;
    } else {
      r = 30; g = 36; b = 48; // #1E2430
    }
  }

  // Top 4 Gboard Color Dots (uy in 0.22..0.29)
  if (uy >= 0.22 && uy <= 0.29) {
    if (ux >= 0.25 && ux <= 0.33) { r = 66; g = 133; b = 244; }      // Blue
    else if (ux >= 0.39 && ux <= 0.47) { r = 234; g = 67; b = 53; }  // Red
    else if (ux >= 0.53 && ux <= 0.61) { r = 251; g = 188; b = 4; }  // Yellow
    else if (ux >= 0.67 && ux <= 0.75) { r = 52; g = 168; b = 83; }  // Green
  }

  // Row 1 High-Contrast Keycaps (#DCE2EE)
  if (uy >= 0.34 && uy <= 0.46) {
    for (let col = 0; col < 4; col++) {
      const x0 = 0.17 + col * 0.175;
      const x1 = x0 + 0.135;
      if (ux >= x0 && ux <= x1) {
        r = 220; g = 226; b = 238;
      }
    }
  }

  // Row 2 Keycaps with Center Material Blue 'Q' Key
  if (uy >= 0.50 && uy <= 0.64) {
    if (ux >= 0.19 && ux <= 0.34) {
      r = 220; g = 226; b = 238;
    } else if (ux >= 0.37 && ux <= 0.63) {
      // Center Hero Key (#A8C7FA) with dark #062E6F 'Q' ring in center
      r = 168; g = 199; b = 250;
      const dx = (ux - 0.50) / 0.055;
      const dy = (uy - 0.57) / 0.045;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if ((dist >= 0.55 && dist <= 1.0) || (ux >= 0.51 && ux <= 0.55 && uy >= 0.58 && uy <= 0.62)) {
        r = 6; g = 46; b = 111;
      }
    } else if (ux >= 0.66 && ux <= 0.81) {
      r = 220; g = 226; b = 238;
    }
  }

  // Row 3 Bottom Functional Keys + Wide Material Blue Spacebar + Pill Enter
  if (uy >= 0.68 && uy <= 0.79) {
    if (ux >= 0.17 && ux <= 0.30) {
      r = 110; g = 123; b = 145; // Left functional key
    } else if (ux >= 0.33 && ux <= 0.67) {
      r = 168; g = 199; b = 250; // Wide Spacebar (#A8C7FA)
    } else if (ux >= 0.70 && ux <= 0.83) {
      r = 66; g = 133; b = 244;  // Pill Enter (#4285F4)
    }
  }

  return [r, g, b, 255];
}

function encodePng(width, height, pixelFn) {
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 4;
      const [r, g, b, a] = pixelFn(x, y, width, height);
      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = a;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
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

function generateLauncherPng(size) {
  return encodePng(size, size, (x, y, w, h) => {
    return sampleKeyboardEmblem(x / w, y / h);
  });
}

function generateSplashPng(width, height) {
  const iconBox = Math.round(Math.min(width, height) * 0.34);
  const x0 = Math.round((width - iconBox) / 2);
  const y0 = Math.round((height - iconBox) / 2);

  return encodePng(width, height, (x, y) => {
    if (x >= x0 && x < x0 + iconBox && y >= y0 && y < y0 + iconBox) {
      return sampleKeyboardEmblem((x - x0) / iconBox, (y - y0) / iconBox);
    }
    return [17, 19, 24, 255]; // #111318 app dark background
  });
}

const mipmapSizes = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
];

for (const { folder, size } of mipmapSizes) {
  const dir = path.join(resDir, folder);
  fs.mkdirSync(dir, { recursive: true });
  const pngBuffer = generateLauncherPng(size);
  fs.writeFileSync(path.join(dir, 'ic_launcher.png'), pngBuffer);
  fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), pngBuffer);
  fs.writeFileSync(path.join(dir, 'ic_launcher_foreground.png'), pngBuffer);
}

// 6. Replace ALL Capacitor default white/blue-X splash.png files so launch screen matches the app icon & logo
const splashPngBuffer = generateSplashPng(480, 480);
if (fs.existsSync(resDir)) {
  const entries = fs.readdirSync(resDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && entry.name.startsWith('drawable')) {
      const splashPath = path.join(resDir, entry.name, 'splash.png');
      if (fs.existsSync(splashPath) || entry.name === 'drawable') {
        fs.writeFileSync(splashPath, splashPngBuffer);
      }
    }
  }
}

console.log('Successfully configured Android InputMethodService, Unified Launcher Icons, and Dark Splash Screen!');
