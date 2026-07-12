/**
 * One-off dev tool: renders the Play Store feature graphic (1024x500) using
 * CanvasKit (Skia's WASM build), reusing the same brand palette and ball
 * mark as the app icon. Run with: node scripts/generateFeatureGraphic.js
 */
const CanvasKitInit = require('canvaskit-wasm');
const fs = require('fs');
const path = require('path');

const OUT_PATH = path.join(__dirname, '..', 'store-assets', 'feature_graphic.png');
const WIDTH = 1024;
const HEIGHT = 500;

const PRIMARY = [0x7c, 0x5c, 0xff, 255];
const PRIMARY_DARK = [0x42, 0x2c, 0xb0, 255];
const TEAL = [0x06, 0xd6, 0xc6, 255];
const CORAL = [0xff, 0x6b, 0x6b, 255];
const GOLD = [0xff, 0xc9, 0x4d, 255];
const WHITE = [0xff, 0xff, 0xff, 255];

function toFloatColor(CanvasKit, rgba) {
  return CanvasKit.Color4f(rgba[0] / 255, rgba[1] / 255, rgba[2] / 255, rgba[3] / 255);
}

function drawBall(CanvasKit, canvas, cx, cy, r) {
  const ballPaint = new CanvasKit.Paint();
  ballPaint.setColor(toFloatColor(CanvasKit, WHITE));
  ballPaint.setAntiAlias(true);
  canvas.drawCircle(cx, cy, r, ballPaint);
  ballPaint.delete();

  const drips = [
    {dx: 0.62, dy: 0.55, r: 0.19, color: TEAL},
    {dx: 0.55, dy: -0.6, r: 0.16, color: CORAL},
    {dx: -0.62, dy: 0.6, r: 0.14, color: GOLD},
  ];
  for (const drip of drips) {
    const paint = new CanvasKit.Paint();
    paint.setColor(toFloatColor(CanvasKit, drip.color));
    paint.setAntiAlias(true);
    canvas.drawCircle(cx + r * drip.dx, cy + r * drip.dy, r * drip.r, paint);
    paint.delete();
  }
}

function drawTileGrid(CanvasKit, canvas) {
  // Faint decorative painted-tile pattern in the background, evoking the
  // in-game grid without competing with the ball mark or the text.
  const cols = 9;
  const rows = 5;
  const cell = 76;
  const gap = 6;
  const startX = WIDTH - cols * (cell + gap) + 40;
  const startY = -30;
  const palette = [TEAL, CORAL, GOLD, PRIMARY];
  let seed = 7;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff);
  };
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (rand() > 0.45) continue;
      const color = palette[Math.floor(rand() * palette.length)];
      const paint = new CanvasKit.Paint();
      paint.setAntiAlias(true);
      paint.setColor(CanvasKit.Color4f(color[0] / 255, color[1] / 255, color[2] / 255, 0.14));
      const x = startX + col * (cell + gap);
      const y = startY + row * (cell + gap);
      const rrect = CanvasKit.RRectXY(CanvasKit.LTRBRect(x, y, x + cell, y + cell), 14, 14);
      canvas.drawRRect(rrect, paint);
      paint.delete();
    }
  }
}

CanvasKitInit({
  locateFile: file => path.join(require.resolve('canvaskit-wasm/bin/canvaskit.wasm'), '..', file),
}).then(CanvasKit => {
  const fontDir = 'C:/Windows/Fonts';
  const boldFontBytes = fs.readFileSync(path.join(fontDir, 'segoeuib.ttf'));
  const regularFontBytes = fs.readFileSync(path.join(fontDir, 'segoeui.ttf'));
  const boldTypeface = CanvasKit.Typeface.MakeTypefaceFromData(boldFontBytes);
  const regularTypeface = CanvasKit.Typeface.MakeTypefaceFromData(regularFontBytes);

  const surface = CanvasKit.MakeSurface(WIDTH, HEIGHT);
  const canvas = surface.getCanvas();

  // Background gradient
  const bgPaint = new CanvasKit.Paint();
  bgPaint.setAntiAlias(true);
  const shader = CanvasKit.Shader.MakeLinearGradient(
    [0, 0],
    [WIDTH, HEIGHT],
    [toFloatColor(CanvasKit, PRIMARY), toFloatColor(CanvasKit, PRIMARY_DARK)],
    null,
    CanvasKit.TileMode.Clamp,
  );
  bgPaint.setShader(shader);
  canvas.drawRect(CanvasKit.LTRBRect(0, 0, WIDTH, HEIGHT), bgPaint);
  shader.delete();
  bgPaint.delete();

  drawTileGrid(CanvasKit, canvas);

  // Ball mark, left side
  drawBall(CanvasKit, canvas, 168, HEIGHT / 2, 108);

  // Title: "Paint" (white) + "Roll" (gold)
  const titleSize = 92;
  const titleFontBold = new CanvasKit.Font(boldTypeface, titleSize);
  const paintPaint = new CanvasKit.Paint();
  paintPaint.setAntiAlias(true);
  paintPaint.setColor(toFloatColor(CanvasKit, WHITE));
  const rollPaint = new CanvasKit.Paint();
  rollPaint.setAntiAlias(true);
  rollPaint.setColor(toFloatColor(CanvasKit, GOLD));

  const titleX = 340;
  const titleY = 250;
  canvas.drawText('Paint', titleX, titleY, paintPaint, titleFontBold);
  const paintWidth = titleFontBold.getGlyphWidths(titleFontBold.getGlyphIDs('Paint')).reduce((a, b) => a + b, 0);
  canvas.drawText('Roll', titleX + paintWidth, titleY, rollPaint, titleFontBold);

  // Tagline
  const taglineSize = 34;
  const taglineFont = new CanvasKit.Font(regularTypeface, taglineSize);
  const taglinePaint = new CanvasKit.Paint();
  taglinePaint.setAntiAlias(true);
  taglinePaint.setColor(CanvasKit.Color4f(1, 1, 1, 0.88));
  canvas.drawText('Roll. Paint. Beat the clock.', titleX, titleY + 62, taglinePaint, taglineFont);

  surface.flush();
  const img = surface.makeImageSnapshot();
  const pngBytes = img.encodeToBytes(CanvasKit.ImageFormat.PNG, 100);
  fs.mkdirSync(path.dirname(OUT_PATH), {recursive: true});
  fs.writeFileSync(OUT_PATH, Buffer.from(pngBytes));
  console.log('Wrote', OUT_PATH, `(${WIDTH}x${HEIGHT})`);
});
