const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const outputDir = path.join(__dirname, "..", "extension", "assets");
const sizes = [16, 32, 48, 128];
const SCALE = 4;

const BLUE = [90, 155, 234, 255];
const WHITE = [255, 255, 255, 255];

fs.mkdirSync(outputDir, { recursive: true });

for (const size of sizes) {
  const png = renderIcon(size);
  fs.writeFileSync(path.join(outputDir, `icon-${size}.png`), png);
}

console.log(`Generated ${sizes.length} icon sizes.`);

function renderIcon(size) {
  const canvasSize = size * SCALE;
  const highRes = Buffer.alloc(canvasSize * canvasSize * 4);

  drawShape(highRes, canvasSize, (x, y) => roundedRectMask(x, y, 0, 0, 1, 1, 0.24), () => BLUE);
  drawPolygon(highRes, canvasSize, [
    [0.17, 0.49],
    [0.22, 0.42],
    [0.33, 0.35],
    [0.48, 0.32],
    [0.63, 0.33],
    [0.76, 0.39],
    [0.84, 0.34],
    [0.91, 0.35],
    [0.83, 0.4],
    [0.8, 0.48],
    [0.87, 0.58],
    [0.93, 0.74],
    [0.96, 0.94],
    [0.91, 0.98],
    [0.82, 0.76],
    [0.67, 0.62],
    [0.55, 0.54],
    [0.45, 0.48],
    [0.36, 0.51],
    [0.27, 0.57],
    [0.2, 0.67],
    [0.165, 0.64],
    [0.2, 0.56],
  ], WHITE);
  drawPolygon(highRes, canvasSize, [
    [0.41, 0.55],
    [0.51, 0.73],
    [0.35, 0.6],
  ], WHITE);

  return encodePng(size, size, downsample(highRes, size, SCALE));
}

function drawPolygon(buffer, size, points, color) {
  drawShape(buffer, size, (x, y) => pointInPolygon(x, y, points), () => color);
}

function drawShape(buffer, size, mask, colorAt) {
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const nx = x / (size - 1);
      const ny = y / (size - 1);
      if (!mask(nx, ny)) {
        continue;
      }
      const index = (y * size + x) * 4;
      const color = colorAt(nx, ny);
      setPixel(buffer, index, color[0], color[1], color[2], color[3] ?? 255);
    }
  }
}

function downsample(highRes, size, scale) {
  const output = Buffer.alloc(size * size * 4);
  const highSize = size * scale;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const totals = [0, 0, 0, 0];
      for (let oy = 0; oy < scale; oy += 1) {
        for (let ox = 0; ox < scale; ox += 1) {
          const highIndex = ((y * scale + oy) * highSize + x * scale + ox) * 4;
          totals[0] += highRes[highIndex];
          totals[1] += highRes[highIndex + 1];
          totals[2] += highRes[highIndex + 2];
          totals[3] += highRes[highIndex + 3];
        }
      }
      const count = scale * scale;
      const index = (y * size + x) * 4;
      setPixel(
        output,
        index,
        Math.round(totals[0] / count),
        Math.round(totals[1] / count),
        Math.round(totals[2] / count),
        Math.round(totals[3] / count)
      );
    }
  }

  return output;
}

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const xi = points[i][0];
    const yi = points[i][1];
    const xj = points[j][0];
    const yj = points[j][1];
    const intersects = yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function roundedRectMask(x, y, left, top, width, height, radius) {
  if (x < left || x > left + width || y < top || y > top + height) {
    return false;
  }

  const right = left + width;
  const bottom = top + height;
  const px = x < left + radius ? left + radius : x > right - radius ? right - radius : x;
  const py = y < top + radius ? top + radius : y > bottom - radius ? bottom - radius : y;
  const dx = x - px;
  const dy = y - py;
  return dx * dx + dy * dy <= radius * radius;
}

function encodePng(width, height, rgba) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0;
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  const chunks = [
    makeChunk("IHDR", makeIhdr(width, height)),
    makeChunk("IDAT", zlib.deflateSync(raw)),
    makeChunk("IEND", Buffer.alloc(0)),
  ];
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), ...chunks]);
}

function makeIhdr(width, height) {
  const buffer = Buffer.alloc(13);
  buffer.writeUInt32BE(width, 0);
  buffer.writeUInt32BE(height, 4);
  buffer[8] = 8;
  buffer[9] = 6;
  buffer[10] = 0;
  buffer[11] = 0;
  buffer[12] = 0;
  return buffer;
}

function makeChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function setPixel(pixels, index, r, g, b, a) {
  pixels[index] = r;
  pixels[index + 1] = g;
  pixels[index + 2] = b;
  pixels[index + 3] = a;
}
