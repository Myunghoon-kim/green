#!/usr/bin/env node
/**
 * Green 앱 아이콘 생성기.
 *
 * 1024x1024 RGB PNG 를 의존성 없이 그려서 assets/icon.png 로 저장.
 * 디자인: 크림 배경 + 그린 원 + 좌상단 흰 드롭 (스플래시와 동일한 비주얼 모티프).
 *
 * iOS App Store 는 알파 채널이 없는 아이콘을 요구하므로 colorType=2 (RGB) 사용.
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const SIZE = 1024;

// 팔레트 (src/theme/colors.ts 와 동일).
const BG = [0xff, 0xf8, 0xf0]; // cream
const PRIMARY = [0x4c, 0xaf, 0x50]; // green
const DROP = [0xff, 0xff, 0xff]; // white

// 도형 파라미터.
const CIRCLE_CX = SIZE / 2;
const CIRCLE_CY = SIZE / 2;
const CIRCLE_R = SIZE * 0.34;
const DROP_CX = SIZE * 0.42;
const DROP_CY = SIZE * 0.42;
const DROP_R = SIZE * 0.07;

const inCircle = (x, y, cx, cy, r) => {
  const dx = x - cx;
  const dy = y - cy;
  return dx * dx + dy * dy <= r * r;
};

const buildRgbBuffer = () => {
  // 행마다 filter byte(0) + RGB*SIZE 바이트.
  const rowSize = 1 + SIZE * 3;
  const buf = Buffer.alloc(rowSize * SIZE);
  for (let y = 0; y < SIZE; y++) {
    const rowStart = y * rowSize;
    buf[rowStart] = 0; // filter: None
    for (let x = 0; x < SIZE; x++) {
      let color;
      if (inCircle(x, y, DROP_CX, DROP_CY, DROP_R) && inCircle(x, y, CIRCLE_CX, CIRCLE_CY, CIRCLE_R)) {
        color = DROP;
      } else if (inCircle(x, y, CIRCLE_CX, CIRCLE_CY, CIRCLE_R)) {
        color = PRIMARY;
      } else {
        color = BG;
      }
      const p = rowStart + 1 + x * 3;
      buf[p] = color[0];
      buf[p + 1] = color[1];
      buf[p + 2] = color[2];
    }
  }
  return buf;
};

// --- PNG 인코딩 ---
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
};

const buildPng = (rgbBuffer) => {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(SIZE, 0);
  ihdr.writeUInt32BE(SIZE, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: RGB
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const idat = zlib.deflateSync(rgbBuffer);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

const out = path.join(__dirname, '..', 'assets', 'icon.png');
fs.writeFileSync(out, buildPng(buildRgbBuffer()));
console.log(`wrote ${out} (${SIZE}x${SIZE})`);
