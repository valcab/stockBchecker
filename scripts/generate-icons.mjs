import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

const root = process.cwd()
const outDir = path.join(root, 'icons')

function crc32(buf) {
  let crc = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i]
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1)
      crc = (crc >>> 1) ^ (0xedb88320 & mask)
    }
  }
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crc])
}

function encodePng(width, height, rgba) {
  const rows = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1)
    rows[rowStart] = 0
    rgba.copy(rows, rowStart + 1, y * width * 4, (y + 1) * width * 4)
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(rows, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v))
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

function mix(a, b, t) {
  return a + (b - a) * t
}

function lerpColor(a, b, t) {
  return [
    mix(a[0], b[0], t),
    mix(a[1], b[1], t),
    mix(a[2], b[2], t),
    mix(a[3], b[3], t),
  ]
}

function over(dst, src) {
  const sa = src[3]
  const da = dst[3]
  const outA = sa + da * (1 - sa)
  if (outA <= 0) return [0, 0, 0, 0]
  return [
    (src[0] * sa + dst[0] * da * (1 - sa)) / outA,
    (src[1] * sa + dst[1] * da * (1 - sa)) / outA,
    (src[2] * sa + dst[2] * da * (1 - sa)) / outA,
    outA,
  ]
}

function roundedRectAlpha(x, y, cx, cy, hw, hh, r, aa) {
  const qx = Math.abs(x - cx) - (hw - r)
  const qy = Math.abs(y - cy) - (hh - r)
  const ox = Math.max(qx, 0)
  const oy = Math.max(qy, 0)
  const dist = Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r
  return 1 - smoothstep(0, aa, dist)
}

function circleRingAlpha(x, y, cx, cy, radius, thickness, aa) {
  const d = Math.abs(Math.hypot(x - cx, y - cy) - radius) - thickness / 2
  return 1 - smoothstep(0, aa, d)
}

function circleFillAlpha(x, y, cx, cy, radius, aa) {
  const d = Math.hypot(x - cx, y - cy) - radius
  return 1 - smoothstep(0, aa, d)
}

function rectFillAlpha(x, y, x1, y1, x2, y2, aa) {
  const dx = Math.max(x1 - x, 0, x - x2)
  const dy = Math.max(y1 - y, 0, y - y2)
  const d = Math.hypot(dx, dy)
  const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2
  return inside ? 1 : 1 - smoothstep(0, aa, d)
}

function generateIcon(size) {
  const pixels = Buffer.alloc(size * size * 4)
  const aa = 1.25
  const c = size / 2
  const blueA = [14, 165, 255, 1]
  const blueB = [20, 99, 255, 1]
  const blueC = [11, 27, 94, 1]
  const white = [255, 255, 255, 1]
  const sky = [125, 211, 252, 1]

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x + 0.5
      const py = y + 0.5
      let color = [0, 0, 0, 0]

      const bgAlpha = roundedRectAlpha(
        px,
        py,
        c,
        c,
        size * 0.405,
        size * 0.405,
        size * 0.115,
        aa
      )
      if (bgAlpha > 0) {
        const gx = px / size
        const gy = py / size
        const top = lerpColor(blueA, blueB, gx * 0.8 + gy * 0.2)
        const bottom = lerpColor(top, blueC, gy * 0.92)
        color = over(color, [bottom[0], bottom[1], bottom[2], bgAlpha])
      }

      const ring1 = circleRingAlpha(px, py, c, size * 0.49, size * 0.28, size * 0.032, aa)
      color = over(color, [255, 255, 255, ring1 * 0.18])

      const ring2 = circleRingAlpha(px, py, c, size * 0.49, size * 0.203, size * 0.034, aa)
      color = over(color, [138, 228, 255, ring2 * 0.55])

      const stem = rectFillAlpha(px, py, size * 0.355, size * 0.275, size * 0.44, size * 0.735, aa)
      color = over(color, [255, 255, 255, stem])

      const topOuter = circleFillAlpha(px, py, size * 0.49, size * 0.455, size * 0.155, aa)
      const topInner = circleFillAlpha(px, py, size * 0.475, size * 0.455, size * 0.094, aa)
      const topBowl = Math.max(0, topOuter - topInner) * rectFillAlpha(px, py, size * 0.39, size * 0.3, size * 0.69, size * 0.61, aa)
      color = over(color, [255, 255, 255, topBowl])

      const bottomOuter = circleFillAlpha(px, py, size * 0.5, size * 0.71, size * 0.165, aa)
      const bottomInner = circleFillAlpha(px, py, size * 0.485, size * 0.71, size * 0.102, aa)
      const bottomBowl = Math.max(0, bottomOuter - bottomInner) * rectFillAlpha(px, py, size * 0.39, size * 0.56, size * 0.71, size * 0.86, aa)
      color = over(color, [255, 255, 255, bottomBowl])

      const arc1 = circleRingAlpha(px, py, size * 0.77, size * 0.31, size * 0.12, size * 0.021, aa)
      const arc2 = circleRingAlpha(px, py, size * 0.77, size * 0.31, size * 0.18, size * 0.018, aa)
      color = over(color, [255, 255, 255, arc1 * 0.7])
      color = over(color, [255, 255, 255, arc2 * 0.28])

      const dot = circleFillAlpha(px, py, size * 0.77, size * 0.275, size * 0.067, aa)
      const dotStroke = circleRingAlpha(px, py, size * 0.77, size * 0.275, size * 0.067, size * 0.024, aa)
      color = over(color, [125, 211, 252, dot])
      color = over(color, [255, 255, 255, dotStroke])

      const shadow = roundedRectAlpha(px, py, c, c + size * 0.02, size * 0.395, size * 0.395, size * 0.11, aa) * 0.08
      color = over([0, 0, 0, shadow], color)

      const idx = (y * size + x) * 4
      pixels[idx] = Math.round(color[0])
      pixels[idx + 1] = Math.round(color[1])
      pixels[idx + 2] = Math.round(color[2])
      pixels[idx + 3] = Math.round(color[3] * 255)
    }
  }

  return pixels
}

for (const size of [16, 48, 128]) {
  const png = encodePng(size, size, generateIcon(size))
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png)
  console.log(`generated icon-${size}.png`)
}
