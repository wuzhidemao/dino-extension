// finalize.js - 合并生成完整 content.js
const fs = require('fs');

const part2 = `      } else {
        ctx.fillRect(x + 10, y + 22, 8, 6);
        ctx.fillRect(x + 10, y + 28, 10, 3);
        ctx.fillRect(x + 28, y + 22, 8, 8);
      }
    } else {
      var x = this.x, y = this.y;
      ctx.fillRect(x + 8, y + 8, 28, 24);
      ctx.fillRect(x + 16, y, 24, 20);
      ctx.fillRect(x + 36, y + 10, 8, 4);
      ctx.fillStyle = eyeColor;
      ctx.fillRect(x + 30, y + 4, 8, 8);
      ctx.fillStyle = '#333';
      ctx.fillRect(x + 33, y + 6, 4, 4);
      ctx.fillStyle = color;
      ctx.fillRect(x, y + 20, 10, 6);
      ctx.fillRect(x - 4, y + 24, 8, 4);
      var lf = Math.floor(frame / 6) % 2;
      if (lf === 0) {
        ctx.fillRect(x + 12, y + 32, 8, 16);
        ctx.fillRect(x + 24, y + 32, 8, 12);
        ctx.fillRect(x + 24, y + 44, 12, 4);
      } else {
        ctx.fillRect(x + 12, y + 32, 8, 12);
        ctx.fillRect(x + 12, y + 44, 12, 4);
        ctx.fillRect(x + 24, y + 32, 8, 16);
      }
      ctx.fillRect(x + 28, y + 18, 10, 6);
    }
    if (this.dead) {
      ctx.strokeStyle = dark ? '#ff4444' : '#cc0000';
      ctx.lineWidth = 2;
      var ex = this.x + 30, ey = this.y + 10;
      ctx.beginPath();
      ctx.moveTo(ex - 4, ey - 4);
      ctx.lineTo(ex + 4, ey + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex + 4, ey - 4);
      ctx.lineTo(ex - 4, ey + 4);
      ctx.stroke();
    }
    ctx.restore();
  };

  function Cactus(x, groundY) {
    this.groundY = groundY;
    var types = [
      { w: 20, h: 50, arms: 1 },
      { w: 24, h: 60, arms: 2 },
      { w: 16, h: 40, arms: 0 },
      { w: 44, h: 50, arms: 1, double: true },
    ];
    var t = types[Math.floor(Math.random() * types.length)];
    this.w = t.w;
    this.h = t.h;
    this.arms = t.arms;
    this.double = t.double || false;
    this.x = x;
    this.y = groundY - this.h;
  }

  Cactus.prototype.update = function(dt, speed) { this.x -= speed * dt; };

  Cactus.prototype.getHitbox = function() {
    return { x: this.x + 4, y: this.y + 4, w: this.w - 8, h: this.h - 4 };
  };

  Cactus.prototype.draw = function(ctx, dark, night) {
    var color = dark ? (night ? '#5a8a5a' : '#4a7a4a') : (night ? '#2a5a2a' : '#535353');
    ctx.fillStyle = color;
    this._drawSingle(ctx, this.x, this.y, this.w, this.h, this.arms);
    if (this.double) {
      this._drawSingle(ctx, this.x + this.w + 4, this.y + 10, this.w * 0.7, this.h * 0.8, 1);
    }
  };

  Cactus.prototype._drawSingle = function(ctx, x, y, w, h, arms) {
    ctx.fillRect(x + w * 0.3, y, w * 0.4, h);
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + 2, w * 0.2, 0, Math.PI * 2);
    ctx.fill();
    if (arms >= 1) {
      ctx.fillRect(x, y + h * 0.3, w * 0.35, w * 0.3);
      ctx.fillRect(x, y + h * 0.15, w * 0.3, w * 0.3);
      ctx.beginPath();
      ctx.arc(x + w * 0.15, y + h * 0.15, w * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    if (arms >= 2) {
      ctx.fillRect(x + w * 0.65, y + h * 0.4, w * 0.35, w * 0.3);
      ctx.fillRect(x + w * 0.7, y + h * 0.25, w * 0.3, w * 0.3);
      ctx.beginPath();
      ctx.arc(x + w * 0.85, y + h * 0.25, w * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  function Pterodactyl(x, groundY) {
    this.w = 46;
    this.h = 30;
    this.x = x;
    var heights = [groundY - 80, groundY - 110, groundY - 140];
    this.y = heights[Math.floor(Math.random() * heights.length)];
    this.wingFrame = 0;
  }

  Pterodactyl.prototype.update = function(dt, speed) {
    this.x -= speed * dt;
    this.wingFrame++;
  };

  Pterodactyl.prototype.getHitbox = function() {
    return { x: this.x + 4, y: this.y + 4, w: this.w - 8, h: this.h - 8 };
  };

  Pterodactyl.prototype.draw = function(ctx, dark, night) {
    var color = dark ? (night ? '#aaa' : '#bbb') : (night ? '#666' : '#535353');
    ctx.fillStyle = color;
    var wf = Math.floor(this.wingFrame / 8) % 2;
    var x = this.x, y = this.y;
    ctx.fillRect(x + 14, y + 10, 20, 12);
    ctx.fillRect(x + 30, y + 6, 14, 10);
    ctx.fillRect(x + 42, y + 8, 8, 4);
    ctx.fillStyle = dark ? '#1a1a1a' : '#f7f7f7';
    ctx.fillRect(x + 36, y + 7, 5, 5);
    ctx.fillStyle = '#333';
    ctx.fillRect(x + 38, y + 8, 3, 3);
    ctx.fillStyle = color;
    if (wf === 0) {
      ctx.fillRect(x, y, 16, 6);
      ctx.fillRect(x + 2, y - 6, 12, 8);
      ctx.fillRect(x + 28, y, 16, 6);
      ctx.fillRect(x + 30, y - 6, 12, 8);
    } else {
      ctx.fillRect(x, y + 14, 16, 6);
      ctx.fillRect(x + 2, y + 18, 12, 8);
      ctx.fillRect(x + 28, y + 14, 16, 6);
      ctx.fillRect(x + 30, y + 18, 12, 8);
    }
    ctx.fillRect(x + 8, y + 14, 10, 4);
    ctx.fillRect(x + 4, y + 16, 8, 4);
  };

  function Cloud(x, H) {
    this.x = x;
    this.y = 30 + Math.random() * (H * 0.35);
    this.w = 60 + Math.random() * 40;
    this.speed = 0.5 + Math.random() * 0.5;
  }

  Cloud.prototype.update = function(dt, speed) {
    this.x -= (speed + this.speed) * dt;
  };

  Cloud.prototype.draw = function(ctx, dark, night) {
    var alpha = night ? 0.3 : 0.6;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = dark ? (night ? '#555' : '#444') : (night ? '#aaa' : '#ccc');
    var x = this.x, y = this.y, w = this.w;
    ctx.beginPath();
    ctx.arc(x + w * 0.25, y + 10, w * 0.18, 0, Math.PI * 2);
    ctx.arc(x + w * 0.5, y + 5, w * 0.22, 0, Math.PI * 2);
    ctx.arc(x + w * 0.75, y + 10, w * 0.18, 0, Math.PI * 2);
    ctx.fillRect(x + w * 0.07, y + 10, w * 0.86, 12);
    ctx.fill();
    ctx.globalAlpha = 1;
  };

})();
`;

// Read the first part and append
let part1 = fs.readFileSync('C:\\Users\\BY\\.qclaw\\workspace\\dino-extension\\generate-full.js', 'utf8');
// Remove the last truncated part
part1 = part1.substring(0, part1.lastIndexOf('ctx.fillRect(x + 10, y + 22, 8, 6);'));
// Add ; before part2
part1 = part1.trim() + '\n';

fs.writeFileSync('C:\\Users\\BY\\.qclaw\\workspace\\dino-extension\\content.js', part1 + part2);
console.log('content.js created successfully!');
console.log('File size:', fs.statSync('C:\\Users\\BY\\.qclaw\\workspace\\dino-extension\\content.js').size, 'bytes');
