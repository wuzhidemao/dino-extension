// make-icons.js - 生成 PNG 图标
// 使用方法: node make-icons.js

const fs = require('fs');
const path = require('path');

// 简单的 PNG 生成（使用 BMP 伪装）
function createSimplePNG(width, height, color) {
  // BMP 文件头
  const fileHeader = Buffer.alloc(14);
  fileHeader.write('BM', 0);
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelDataSize = rowSize * height;
  const fileSize = 14 + 40 + pixelDataSize;
  fileHeader.writeUInt32LE(fileSize, 2);
  fileHeader.writeUInt32LE(0, 6);
  fileHeader.writeUInt32LE(54, 10);

  // DIB 头
  const dibHeader = Buffer.alloc(40);
  dibHeader.writeUInt32LE(40, 0);
  dibHeader.writeInt32LE(width, 4);
  dibHeader.writeInt32LE(height, 8);
  dibHeader.writeUInt16LE(1, 12);
  dibHeader.writeUInt16LE(24, 14);
  dibHeader.writeUInt32LE(0, 16);
  dibHeader.writeUInt32LE(pixelDataSize, 20);
  dibHeader.writeInt32LE(2835, 24);
  dibHeader.writeInt32LE(2835, 28);
  dibHeader.writeUInt32LE(0, 32);
  dibHeader.writeUInt32LE(0, 36);

  // 像素数据（BGR 格式，从下往上）
  const pixels = Buffer.alloc(pixelDataSize);
  const [r, g, b] = color;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (height - 1 - y) * rowSize + x * 3;
      pixels[offset] = b;
      pixels[offset + 1] = g;
      pixels[offset + 2] = r;
    }
  }

  return Buffer.concat([fileHeader, dibHeader, pixels]);
}

// 创建恐龙形状的图标
function createDinoIcon(size) {
  const canvas = [];
  const bgColor = [26, 26, 46]; // 深蓝背景
  const dinoColor = [74, 222, 128]; // 绿色恐龙
  const eyeColor = [26, 26, 26]; // 黑色眼睛
  const groundColor = [233, 69, 96]; // 红色地面

  // 初始化背景
  for (let y = 0; y < size; y++) {
    const row = [];
    for (let x = 0; x < size; x++) {
      row.push(bgColor);
    }
    canvas.push(row);
  }

  // 绘制恐龙身体（简化版）
  const scale = size / 128;
  const drawRect = (x1, y1, w, h, color) => {
    for (let y = Math.floor(y1 * scale); y < Math.floor((y1 + h) * scale); y++) {
      for (let x = Math.floor(x1 * scale); x < Math.floor((x1 + w) * scale); x++) {
        if (y >= 0 && y < size && x >= 0 && x < size) {
          canvas[y][x] = color;
        }
      }
    }
  };

  // 身体
  drawRect(28, 45, 35, 30, dinoColor);
  // 头
  drawRect(44, 18, 40, 26, dinoColor);
  // 嘴
  drawRect(80, 28, 15, 8, dinoColor);
  // 眼睛
  drawRect(70, 22, 12, 12, eyeColor);
  // 腿
  drawRect(32, 75, 12, 28, dinoColor);
  drawRect(58, 75, 12, 28, dinoColor);
  // 地面
  drawRect(13, 115, 102, 6, groundColor);

  // 转换为 BMP
  return createSimplePNG(size, size, bgColor);
}

// 主程序
const sizes = [16, 48, 128];
const outDir = path.join(__dirname, 'icons');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir);
}

sizes.forEach(size => {
  const bmp = createDinoIcon(size);
  fs.writeFileSync(path.join(outDir, `icon${size}.bmp`), bmp);
  console.log(`Created icon${size}.bmp`);
});

console.log('\n注意：生成的是 BMP 格式，需要转换为 PNG 才能被 Edge 扩展使用。');
console.log('建议使用在线工具或图像编辑软件将 BMP 转换为 PNG。');
