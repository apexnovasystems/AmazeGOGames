/**
 * One-off dev tool: renders the PaintRoll launcher icon (legacy + adaptive
 * layers + Play Store hi-res) using CanvasKit (Skia's WASM build), so the
 * icon matches the in-app brand palette exactly without needing a design
 * tool. Run with: node scripts/generateAppIcon.js <outDir>
 */
const CanvasKitInit = require('canvaskit-wasm');
const fs = require('fs');
const path = require('path');

const OUT_DIR = process.argv[2] || path.join(__dirname, '..', 'build-icons');

const PRIMARY = [0x7c, 0x5c, 0xff, 255];
const PRIMARY_DARK = [0x5b, 0x3f, 0xd6, 255];
const TEAL = [0x06, 0xd6, 0xc6, 255];
const CORAL = [0xff, 0x6b, 0x6b, 255];
const GOLD = [0xff, 0xc9, 0x4d, 255];
const WHITE = [0xff, 0xff, 0xff, 255];

function toFloatColor(CanvasKit, rgba) {
  return CanvasKit.Color4f(rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, rgba[3] / 255);
}

function drawMark(CanvasKit, canvas, size, scale) {
  const cx = size / 2;
  const cy = size / 2;
  const s = size * scale;

  const ballPaint = new CanvasKit.Paint();
  ballPaint.setColor(toFloatColor(CanvasKit, WHITE));
  ballPaint.setAntiAlias(true);
  canvas.drawCircle(cx - s * 0.05, cy - s * 0.04, s * 0.27, ballPaint);
  ballPaint.delete();

  const drips = [
    {dx: 0.34, dy: 0.3, r: 0.09, color: TEAL},
    {dx: 0.3, dy: -0.32, r: 0.075, color: CORAL},
    {dx: -0.33, dy: 0.33, r: 0.065, color: GOLD},
  ];
  for (const drip of drips) {
    const paint = new CanvasKit.Paint();
    paint.setColor(toFloatColor(CanvasKit, drip.color));
    paint.setAntiAlias(true);
    canvas.drawCircle(cx + s * drip.dx, cy + s * drip.dy, s * drip.r, paint);
    paint.delete();
  }
}

function drawBackground(CanvasKit, canvas, size, rounded) {
  const paint = new CanvasKit.Paint();
  paint.setAntiAlias(true);
  const shader = CanvasKit.Shader.MakeLinearGradient(
    [0, 0],
    [size, size],
    [toFloatColor(CanvasKit, PRIMARY), toFloatColor(CanvasKit, PRIMARY_DARK)],
    null,
    CanvasKit.TileMode.Clamp,
  );
  paint.setShader(shader);
  if (rounded) {
    const r = size * 0.22;
    const rrect = CanvasKit.RRectXY(CanvasKit.LTRBRect(0, 0, size, size), r, r);
    canvas.drawRRect(rrect, paint);
  } else {
    canvas.drawRect(CanvasKit.LTRBRect(0, 0, size, size), paint);
  }
  shader.delete();
  paint.delete();
}

function surfaceToPng(CanvasKit, surface, outPath) {
  const img = surface.makeImageSnapshot();
  const pngBytes = img.encodeToBytes(CanvasKit.ImageFormat.PNG, 100);
  fs.writeFileSync(outPath, Buffer.from(pngBytes));
  img.delete();
}

CanvasKitInit({
  locateFile: file => path.join(require.resolve('canvaskit-wasm/bin/canvaskit.wasm'), '..', file),
}).then(CanvasKit => {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, {recursive: true});
  }

  const legacySizes = {mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192};
  for (const [density, size] of Object.entries(legacySizes)) {
    const surface = CanvasKit.MakeSurface(size, size);
    const canvas = surface.getCanvas();
    drawBackground(CanvasKit, canvas, size, true);
    drawMark(CanvasKit, canvas, size, 0.62);
    surfaceToPng(CanvasKit, surface, path.join(OUT_DIR, `ic_launcher_${density}.png`));
    surfaceToPng(CanvasKit, surface, path.join(OUT_DIR, `ic_launcher_round_${density}.png`));
    surface.delete();
  }

  const adaptiveSizes = {mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432};
  for (const [density, size] of Object.entries(adaptiveSizes)) {
    const fgSurface = CanvasKit.MakeSurface(size, size);
    const fgCanvas = fgSurface.getCanvas();
    fgCanvas.clear(CanvasKit.Color4f(0, 0, 0, 0));
    drawMark(CanvasKit, fgCanvas, size, 0.34);
    surfaceToPng(CanvasKit, fgSurface, path.join(OUT_DIR, `ic_launcher_foreground_${density}.png`));
    fgSurface.delete();
  }

  const storeSurface = CanvasKit.MakeSurface(512, 512);
  const storeCanvas = storeSurface.getCanvas();
  drawBackground(CanvasKit, storeCanvas, 512, false);
  drawMark(CanvasKit, storeCanvas, 512, 0.62);
  surfaceToPng(CanvasKit, storeSurface, path.join(OUT_DIR, 'playstore_icon_512.png'));
  storeSurface.delete();

  console.log('Icon generation complete:', OUT_DIR);
});
