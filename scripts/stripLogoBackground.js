/**
 * One-off dev tool: loads the ApexNova Systems logo PNG (solid white
 * background) and makes near-white pixels transparent, so it composites
 * cleanly over the app's gradient splash background. Edge pixels get a
 * partial alpha ramp (based on how close to white they are) to avoid a
 * hard aliased cutout.
 * Run with: node scripts/stripLogoBackground.js
 */
const CanvasKitInit = require('canvaskit-wasm');
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'src', 'assets', 'branding', 'apexnova-logo.png');
const OUT = path.join(__dirname, '..', 'src', 'assets', 'branding', 'apexnova-logo-transparent.png');
const WHITE_THRESHOLD = 246; // pixels with min(r,g,b) >= this are fully transparent
const FADE_BAND = 40; // pixels within this band below the threshold get a partial fade

async function main() {
  const CanvasKit = await CanvasKitInit();
  const bytes = fs.readFileSync(SRC);
  const image = CanvasKit.MakeImageFromEncoded(bytes);
  if (!image) {
    throw new Error('Failed to decode ' + SRC);
  }

  const width = image.width();
  const height = image.height();
  const pixels = image.readPixels(0, 0, {
    width,
    height,
    colorType: CanvasKit.ColorType.RGBA_8888,
    alphaType: CanvasKit.AlphaType.Unpremul,
    colorSpace: CanvasKit.ColorSpace.SRGB,
  });

  const out = new Uint8Array(pixels.length);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    const minC = Math.min(r, g, b);

    let alphaMul = 1;
    if (minC >= WHITE_THRESHOLD) {
      alphaMul = 0;
    } else if (minC >= WHITE_THRESHOLD - FADE_BAND) {
      alphaMul = (WHITE_THRESHOLD - minC) / FADE_BAND;
    }

    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
    out[i + 3] = Math.round(a * alphaMul);
  }

  // Trim to the bounding box of non-transparent pixels so the logo fills
  // its frame instead of floating in a sea of padding at small sizes.
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (out[(y * width + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  const pad = 12;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);
  const cropW = maxX - minX + 1;
  const cropH = maxY - minY + 1;

  const outImage = CanvasKit.MakeImage(
    {width, height, alphaType: CanvasKit.AlphaType.Unpremul, colorType: CanvasKit.ColorType.RGBA_8888, colorSpace: CanvasKit.ColorSpace.SRGB},
    out,
    width * 4,
  );

  const surface = CanvasKit.MakeSurface(cropW, cropH);
  const canvas = surface.getCanvas();
  canvas.clear(CanvasKit.TRANSPARENT);
  canvas.drawImageRect(
    outImage,
    CanvasKit.LTRBRect(minX, minY, maxX + 1, maxY + 1),
    CanvasKit.LTRBRect(0, 0, cropW, cropH),
    new CanvasKit.Paint(),
  );
  surface.flush();

  const snapshot = surface.makeImageSnapshot();
  const pngBytes = snapshot.encodeToBytes(CanvasKit.ImageFormat.PNG);
  fs.writeFileSync(OUT, Buffer.from(pngBytes));
  console.log('Wrote', OUT, `(${cropW}x${cropH}, cropped from ${width}x${height})`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
