// content.js - 完整小恐龙游戏 Edge 插件

(function() {
  'use strict';

  // 创建容器
  let container = document.getElementById('dino-overlay-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'dino-overlay-container';
    document.body.appendChild(container);
  }

  // ============================================================
  // 消息监听
  // ============================================================
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    try {
      if (msg.action === 'launchDino') {
        createDinoWindow(msg);
        sendResponse({ success: true });
      } else if (msg.action === 'closeAllDino') {
        document.querySelectorAll('.dino-window').forEach(w => w.remove());
        sendResponse({ success: true });
      }
    } catch (e) {
      console.error('Dino extension error:', e);
      sendResponse({ success: false, error: e.message });
    }
    return true;
  });

  // ============================================================
  // 创建游戏窗口
  // ============================================================
  function createDinoWindow(opts) {
    const isDark = opts.dark !== false;
    const soundOn = opts.sound !== false;
    const isFullscreen = opts.fullscreen;

    const win = document.createElement('div');
    win.className = 'dino-window ' + (isDark ? 'dark-mode' : 'light-mode');

    const W = isFullscreen ? window.innerWidth  : (opts.width  || 700);
    const H = isFullscreen ? window.innerHeight : (opts.height || 260);

    if (isFullscreen) {
      win.classList.add('dino-fullscreen');
    } else {
      win.style.width  = W + 'px';
      win.style.height = H + 'px';
      win.style.left   = Math.max(20, (window.innerWidth  - W) / 2) + 'px';
      win.style.top    = Math.max(20, (window.innerHeight - H) / 2) + 'px';
    }

    // ---- 标题栏 ----
    const titlebar = document.createElement('div');
    titlebar.className = 'dino-titlebar';

    const tbLeft = document.createElement('div');
    tbLeft.className = 'dino-titlebar-left';

    const dots = document.createElement('div');
    dots.className = 'dino-titlebar-dots';
    
    const dotRed = document.createElement('div');
    dotRed.className = 'dino-dot dino-dot-red';
    dotRed.title = '关闭';
    dotRed.addEventListener('click', () => win.remove());
    
    const dotYellow = document.createElement('div');
    dotYellow.className = 'dino-dot dino-dot-yellow';
    dotYellow.title = '最小化';
    dotYellow.addEventListener('click', () => {
      win.style.display = win.style.display === 'none' ? '' : 'none';
    });
    
    const dotGreen = document.createElement('div');
    dotGreen.className = 'dino-dot dino-dot-green';
    dotGreen.title = '切换全屏';
    
    dots.appendChild(dotRed);
    dots.appendChild(dotYellow);
    dots.appendChild(dotGreen);

    const title = document.createElement('span');
    title.className = 'dino-title';
    title.textContent = '小恐龙游戏';

    tbLeft.appendChild(dots);
    tbLeft.appendChild(title);

    const tbRight = document.createElement('div');
    tbRight.className = 'dino-titlebar-right';

    const scoreDisplay = document.createElement('span');
    scoreDisplay.className = 'dino-score-display';
    scoreDisplay.textContent = 'HI 00000  00000';

    // 音效按钮
    const btnSound = document.createElement('button');
    btnSound.className = 'dino-btn-icon';
    btnSound.title = '切换音效';
    let soundEnabled = soundOn;
    btnSound.textContent = soundEnabled ? '🔊' : '🔇';
    btnSound.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      btnSound.textContent = soundEnabled ? '🔊' : '🔇';
      if (gameInstance) gameInstance.soundEnabled = soundEnabled;
    });

    // 夜间模式按钮
    const btnTheme = document.createElement('button');
    btnTheme.className = 'dino-btn-icon';
    btnTheme.title = '切换主题';
    btnTheme.textContent = isDark ? '☀️' : '🌙';
    btnTheme.addEventListener('click', () => {
      win.classList.toggle('dark-mode');
      win.classList.toggle('light-mode');
      const nowDark = win.classList.contains('dark-mode');
      btnTheme.textContent = nowDark ? '☀️' : '🌙';
      if (gameInstance) {
        gameInstance.darkMode = nowDark;
      }
    });

    // 关闭按钮
    const btnClose = document.createElement('button');
    btnClose.className = 'dino-btn-icon';
    btnClose.title = '关闭';
    btnClose.textContent = '✕';
    btnClose.addEventListener('click', () => win.remove());

    tbRight.appendChild(scoreDisplay);
    tbRight.appendChild(btnSound);
    tbRight.appendChild(btnTheme);
    tbRight.appendChild(btnClose);

    titlebar.appendChild(tbLeft);
    titlebar.appendChild(tbRight);

    // ---- Canvas 区域 ----
    const canvasWrap = document.createElement('div');
    canvasWrap.className = 'dino-canvas-wrap';

    const canvas = document.createElement('canvas');
    canvas.tabIndex = 0;
    canvasWrap.appendChild(canvas);

    // ---- 状态栏 ----
    const statusBar = document.createElement('div');
    statusBar.className = 'dino-status-bar';
    statusBar.innerHTML = '<span>空格/↑ 跳跃 | ↓ 俯冲 | 拖拽移动</span><span class="dino-fps-display">FPS: --</span>';

    win.appendChild(titlebar);
    win.appendChild(canvasWrap);
    win.appendChild(statusBar);
    container.appendChild(win);

    // ---- 拖拽 ----
    makeDraggable(win, titlebar);

    // ---- 全屏按钮 ----
    dotGreen.addEventListener('click', () => {
      win.classList.toggle('dino-fullscreen');
      if (win.classList.contains('dino-fullscreen')) {
        win.style.width = ''; win.style.height = '';
        win.style.left = ''; win.style.top = '';
      } else {
        win.style.width  = W + 'px';
        win.style.height = H + 'px';
        win.style.left   = '20px';
        win.style.top    = '20px';
      }
      if (gameInstance) gameInstance.resize();
    });

    // ---- 启动游戏 ----
    const gameInstance = new DinoGame(canvas, canvasWrap, {
      dark: isDark,
      sound: soundEnabled,
      onScore: (score, hi) => {
        const s = String(score).padStart(5, '0');
        const h = String(hi).padStart(5, '0');
        scoreDisplay.textContent = `HI ${h}  ${s}`;
      },
      onFps: (fps) => {
        const el = statusBar.querySelector('.dino-fps-display');
        if (el) el.textContent = 'FPS: ' + fps;
      }
    });
    gameInstance.start();

    // 聚焦
    canvas.focus();
  }

  // ============================================================
  // 拖拽
  // ============================================================
  function makeDraggable(win, handle) {
    let ox = 0, oy = 0, dragging = false;
    
    handle.addEventListener('mousedown', (e) => {
      if (e.target.classList.contains('dino-dot') || 
          e.target.classList.contains('dino-btn-icon')) {
        return;
      }
      dragging = true;
      ox = e.clientX - win.offsetLeft;
      oy = e.clientY - win.offsetTop;
      e.preventDefault();
    });
    
    const onMouseMove = (e) => {
      if (!dragging) return;
      let nx = e.clientX - ox;
      let ny = e.clientY - oy;
      nx = Math.max(0, Math.min(window.innerWidth  - win.offsetWidth,  nx));
      ny = Math.max(0, Math.min(window.innerHeight - win.offsetHeight, ny));
      win.style.left = nx + 'px';
      win.style.top  = ny + 'px';
    };
    
    const onMouseUp = () => { dragging = false; };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  // ============================================================
  // =================== 小恐龙游戏引擎 =========================
  // ============================================================
  class DinoGame {
    constructor(canvas, wrap, opts) {
      this.canvas = canvas;
      this.wrap   = wrap;
      this.ctx    = canvas.getContext('2d');
      this.opts   = opts;
      this.darkMode     = opts.dark;
      this.soundEnabled = opts.sound;
      this.running      = true;

      // 游戏状态
      this.state    = 'WAITING'; // WAITING | RUNNING | GAMEOVER
      this.score    = 0;
      this.hiScore  = parseInt(localStorage.getItem('dino_hi') || '0');
      this.speed    = 6;
      this.baseSpeed= 6;
      this.frame    = 0;
      this.distance = 0;

      // 实体
      this.dino      = null;
      this.obstacles = [];
      this.clouds    = [];
      this.stars     = [];
      this.groundY   = 0;
      this.groundX   = 0;

      // 夜间切换
      this.nightMode    = false;
      this.nightTimer   = 0;
      this.nightDuration= 500;

      // FPS
      this.lastTime  = 0;
      this.fpsTimer  = 0;
      this.fpsCount  = 0;
      this.fps       = 60;

      // 音效
      this.audioCtx  = null;
      
      // 键盘
      this.keyHandler = null;
      this.keyUpHandler = null;

      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      const rect = this.wrap.getBoundingClientRect();
      this.W = Math.max(rect.width, 400) || 700;
      this.H = Math.max(rect.height, 150) || 260;
      this.canvas.width  = this.W;
      this.canvas.height = this.H;
      this.groundY = this.H - 40;
      if (this.dino) {
        this.dino.y = this.groundY - this.dino.h;
        this.dino.groundY = this.groundY;
      }
    }

    start() {
      this.initEntities();
      this.bindKeys();
      this.bindTouch();
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }

    initEntities() {
      this.dino = new Dino(this.groundY);
      this.obstacles = [];
      this.clouds = [];
      this.stars = [];
      this.groundX = 0;
      
      // 初始云朵
      for (let i = 0; i < 3; i++) {
        this.clouds.push(new Cloud(this.W * (0.3 + i * 0.35), this.H));
      }
      // 初始星星
      for (let i = 0; i < 20; i++) {
        this.stars.push({
          x: Math.random() * this.W,
          y: Math.random() * this.groundY * 0.7,
          r: Math.random() * 1.5 + 0.5,
          alpha: Math.random()
        });
      }
    }

    bindKeys() {
      this.keyHandler = (e) => {
        if (['Space','ArrowUp','ArrowDown'].includes(e.code)) {
          e.preventDefault();
          e.stopPropagation();
        }
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          this.handleJump();
        }
        if (e.code === 'ArrowDown') {
          if (this.state === 'RUNNING' && this.dino) {
            this.dino.duck(true);
          }
        }
      };
      
      this.keyUpHandler = (e) => {
        if (e.code === 'ArrowDown' && this.dino) {
          this.dino.duck(false);
        }
      };
      
      document.addEventListener('keydown', this.keyHandler, true);
      document.addEventListener('keyup', this.keyUpHandler, true);
    }

    bindTouch() {
      this._clickHandler = () => this.handleJump();
      this.canvas.addEventListener('click', this._clickHandler);
      this.canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleJump();
      }, { passive: false });
    }

    handleJump() {
      if (this.state === 'WAITING' || this.state === 'GAMEOVER') {
        this.resetGame();
        this.state = 'RUNNING';
        this.playSound('start');
      } else if (this.state === 'RUNNING') {
        if (this.dino && this.dino.jump()) {
          this.playSound('jump');
        }
      }
    }

    resetGame() {
      this.score    = 0;
      this.speed    = this.baseSpeed;
      this.frame    = 0;
      this.distance = 0;
      this.nightMode  = false;
      this.nightTimer = 0;
      this._lastMilestone = -1;
      this.initEntities();
    }

    loop(timestamp) {
      if (!this.running) return;
      
      const dt = Math.min((timestamp - this.lastTime) / 16.67, 3);
      this.lastTime = timestamp;

      // FPS
      this.fpsCount++;
      this.fpsTimer += timestamp - (this._prevTs || timestamp);
      this._prevTs = timestamp;
      if (this.fpsTimer >= 1000) {
        this.fps = this.fpsCount;
        this.fpsCount = 0;
        this.fpsTimer = 0;
        if (this.opts.onFps) this.opts.onFps(this.fps);
      }

      this.update(dt);
      this.draw();
      
      requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
      if (this.state !== 'RUNNING') return;

      this.frame++;
      this.distance += this.speed * dt;
      this.score = Math.floor(this.distance / 10);
      
      if (this.score > this.hiScore) {
        this.hiScore = this.score;
        localStorage.setItem('dino_hi', String(this.hiScore));
      }
      
      if (this.opts.onScore) this.opts.onScore(this.score, this.hiScore);

      // 加速
      this.speed = this.baseSpeed + this.score * 0.004;
      if (this.speed > 18) this.speed = 18;

      // 夜间模式切换
      this.nightTimer++;
      if (this.nightTimer >= this.nightDuration) {
        this.nightMode = !this.nightMode;
        this.nightTimer = 0;
      }

      // 恐龙
      if (this.dino) this.dino.update(dt, this.speed);

      // 障碍物生成
      const spawnRate = Math.max(40, 90 - Math.floor(this.score / 50));
      if (this.frame % spawnRate === 0) {
        this.spawnObstacle();
      }
      
      this.obstacles = this.obstacles.filter(o => o.x + o.w > -50);
      this.obstacles.forEach(o => o.update(dt, this.speed));

      // 碰撞检测
      if (this.dino) {
        for (const obs of this.obstacles) {
          if (this.checkCollision(this.dino, obs)) {
            this.state = 'GAMEOVER';
            this.playSound('die');
            this.dino.die();
            return;
          }
        }
      }

      // 云朵
      this.clouds.forEach(c => c.update(dt, this.speed * 0.3));
      if (this.clouds.length < 4 && Math.random() < 0.005) {
        this.clouds.push(new Cloud(this.W + 50, this.H));
      }
      this.clouds = this.clouds.filter(c => c.x > -200);

      // 地面
      this.groundX -= this.speed * dt;
      if (this.groundX < -this.W) this.groundX += this.W;

      // 里程碑音效
      if (this.score > 0 && this.score % 100 === 0 && this._lastMilestone !== this.score) {
        this._lastMilestone = this.score;
        this.playSound('score');
      }
    }

    spawnObstacle() {
      const r = Math.random();
      if (r < 0.15 && this.score > 200) {
        this.obstacles.push(new Pterodactyl(this.W + 50, this.groundY));
      } else {
        this.obstacles.push(new Cactus(this.W + 50, this.groundY));
      }
    }

    checkCollision(dino, obs) {
      const dp = dino.getHitbox();
      const op = obs.getHitbox();
      return dp.x < op.x + op.w &&
             dp.x + dp.w > op.x &&
             dp.y < op.y + op.h &&
             dp.y + dp.h > op.y;
    }

    draw() {
      const ctx = this.ctx;
      const W = this.W, H = this.H;

      // 背景
      let bgColor;
      if (this.darkMode) {
        bgColor = this.nightMode ? '#111' : '#1a1a1a';
      } else {
        bgColor = this.nightMode ? '#1a1a2e' : '#f7f7f7';
      }
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, W, H);

      // 星星（夜间）
      if (this.nightMode) {
        ctx.fillStyle = this.darkMode ? '#fff' : '#aaa';
        for (const s of this.stars) {
          s.alpha += (Math.random() - 0.5) * 0.05;
          s.alpha = Math.max(0.1, Math.min(1, s.alpha));
          ctx.globalAlpha = s.alpha;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // 云朵
      for (const c of this.clouds) {
        c.draw(ctx, this.darkMode, this.nightMode);
      }

      // 地面
      this.drawGround(ctx, W, H);

      // 障碍物
      for (const o of this.obstacles) {
        o.draw(ctx, this.darkMode, this.nightMode);
      }

      // 恐龙
      if (this.dino) {
        this.dino.draw(ctx, this.darkMode, this.nightMode, this.frame);
      }

      // 等待界面
      if (this.state === 'WAITING') {
        this.drawMessage(ctx, W, H, '按 空格 / 点击 开始游戏', '🦕');
      }

      // 游戏结束
      if (this.state === 'GAMEOVER') {
        this.drawGameOver(ctx, W, H);
      }
    }

    drawGround(ctx, W, H) {
      let color;
      if (this.darkMode) {
        color = this.nightMode ? '#555' : '#444';
      } else {
        color = this.nightMode ? '#888' : '#535353';
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, this.groundY + 2);
      ctx.lineTo(W, this.groundY + 2);
      ctx.stroke();

      // 地面纹理
      ctx.fillStyle = color;
      const gx = ((this.groundX % 60) + 60) % 60;
      for (let x = gx - 60; x < W + 60; x += 60) {
        ctx.fillRect(x,      this.groundY + 5, 8, 2);
        ctx.fillRect(x + 20, this.groundY + 8, 5, 2);
        ctx.fillRect(x + 40, this.groundY + 5, 10, 2);
        ctx.fillRect(x + 10, this.groundY + 12, 6, 2);
        ctx.fillRect(x + 35, this.groundY + 14, 8, 2);
      }
    }

    drawMessage(ctx, W, H, text, emoji) {
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = this.darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
      const bw = 320, bh = 70;
      const bx = (W - bw) / 2, by = (H - bh) / 2 - 10;
      
      // 手动画圆角矩形
      ctx.beginPath();
      ctx.moveTo(bx + 12, by);
      ctx.lineTo(bx + bw - 12, by);
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + 12);
      ctx.lineTo(bx + bw, by + bh - 12);
      ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - 12, by + bh);
      ctx.lineTo(bx + 12, by + bh);
      ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - 12);
      ctx.lineTo(bx, by + 12);
      ctx.quadraticCurveTo(bx, by, bx + 12, by);
      ctx.closePath();
      ctx.fill();
      
      ctx.globalAlpha = 1;

      ctx.textAlign = 'center';
      ctx.font = 'bold 28px Arial';
      ctx.fillStyle = this.darkMode ? '#fff' : '#333';
      ctx.fillText(emoji, W / 2, by + 35);

      ctx.font = 'bold 14px Arial';
      ctx.fillStyle = this.darkMode ? '#ccc' : '#555';
      ctx.fillText(text, W / 2, by + 58);
      ctx.restore();
    }

    drawGameOver(ctx, W, H) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = this.darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)';
      const bw = 340, bh = 100;
      const bx = (W - bw) / 2, by = (H - bh) / 2 - 10;
      
      // 手动画圆角矩形
      ctx.beginPath();
      ctx.moveTo(bx + 14, by);
      ctx.lineTo(bx + bw - 14, by);
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + 14);
      ctx.lineTo(bx + bw, by + bh - 14);
      ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - 14, by + bh);
      ctx.lineTo(bx + 14, by + bh);
      ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - 14);
      ctx.lineTo(bx, by + 14);
      ctx.quadraticCurveTo(bx, by, bx + 14, by);
      ctx.closePath();
      ctx.fill();
      
      ctx.globalAlpha = 1;

      ctx.textAlign = 'center';
      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = '#e94560';
      ctx.fillText('GAME OVER', W / 2, by + 32);

      ctx.font = '13px Arial';
      ctx.fillStyle = this.darkMode ? '#aaa' : '#666';
      ctx.fillText('得分: ' + this.score + '   最高: ' + this.hiScore, W / 2, by + 56);

      ctx.font = 'bold 12px Arial';
      ctx.fillStyle = this.darkMode ? '#888' : '#999';
      ctx.fillText('按 空格 / 点击 重新开始', W / 2, by + 82);
      ctx.restore();
    }

    // ---- 音效 ----
    getAudioCtx() {
      if (!this.audioCtx) {
        try {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {}
      }
      return this.audioCtx;
    }

    playSound(type) {
      if (!this.soundEnabled) return;
      const ac = this.getAudioCtx();
      if (!ac) return;
      try {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        const now = ac.currentTime;
        
        if (type === 'jump') {
          osc.type = 'square';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
        } else if (type === 'die') {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.3);
        } else if (type === 'score') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, now);
          osc.frequency.setValueAtTime(1100, now + 0.05);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          osc.start(now);
          osc.stop(now + 0.15);
        } else if (type === 'start') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(330, now);
          osc.frequency.setValueAtTime(440, now + 0.08);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
        }
      } catch(e) {}
    }
  }

  // ============================================================
  // 恐龙实体
  // ============================================================
  class Dino {
    constructor(groundY) {
      this.w = 44;
      this.h = 48;
      this.x = 80;
      this.groundY = groundY;
      this.y = groundY - this.h;
      this.vy = 0;
      this.gravity = 0.8;
      this.jumpForce = -14;
      this.jumping = false;
      this.ducking = false;
      this.dead = false;
      this.legFrame = 0;
      this.duckW = 58;
      this.duckH = 30;
    }

    jump() {
      if (!this.jumping && !this.ducking) {
        this.vy = this.jumpForce;
        this.jumping = true;
        return true;
      }
      return false;
    }

    duck(on) {
      if (!this.jumping) {
        this.ducking = on;
        if (on) {
          this.h = this.duckH;
          this.w = this.duckW;
        } else {
          this.h = 48;
          this.w = 44;
        }
        this.y = this.groundY - this.h;
      }
    }

    die() { this.dead = true; }

    update(dt, speed) {
      if (this.jumping) {
        this.vy += this.gravity * dt;
        this.y  += this.vy * dt;
        if (this.y >= this.groundY - this.h) {
          this.y = this.groundY - this.h;
          this.vy = 0;
          this.jumping = false;
        }
      }
      if (!this.dead) this.legFrame++;
    }

    getHitbox() {
      return { x: this.x + 6, y: this.y + 4, w: this.w - 12, h: this.h - 8 };
    }

    draw(ctx, dark, night, frame) {
      let color;
      if (dark) {
        color = night ? '#aaa' : '#ccc';
      } else {
        color = night ? '#888' : '#535353';
      }
      const eyeColor = dark ? '#1a1a1a' : '#f7f7f7';

      ctx.save();
      ctx.fillStyle = color;

      if (this.ducking) {
        this.drawDucking(ctx, color, eyeColor, frame);
      } else {
        this.drawStanding(ctx, color, eyeColor, frame);
      }

      // 死亡时画X眼
      if (this.dead) {
        ctx.strokeStyle = dark ? '#ff4444' : '#cc0000';
        ctx.lineWidth = 2;
        const ex = this.x + 30, ey = this.y + 10;
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
    }

    drawStanding(ctx, color, eyeColor, frame) {
      const x = this.x, y = this.y;
      ctx.fillStyle = color;
      
      // 身体
      ctx.fillRect(x + 8,  y + 8,  28, 24);
      // 头
      ctx.fillRect(x + 16, y,      24, 20);
      // 嘴
      ctx.fillRect(x + 36, y + 10, 8,  4);
      // 眼睛
      ctx.fillStyle = eyeColor;
      ctx.fillRect(x + 30, y + 4,  8, 8);
      ctx.fillStyle = '#333';
      ctx.fillRect(x + 33, y + 6,  4, 4);
      ctx.fillStyle = color;
      // 尾巴
      ctx.fillRect(x,      y + 20, 10, 6);
      ctx.fillRect(x - 4,  y + 24, 8,  4);
      // 腿
      const lf = Math.floor(frame / 6) % 2;
      if (lf === 0) {
        ctx.fillRect(x + 12, y + 32, 8, 16);
        ctx.fillRect(x + 24, y + 32, 8, 12);
        ctx.fillRect(x + 24, y + 44, 12, 4);
      } else {
        ctx.fillRect(x + 12, y + 32, 8, 12);
        ctx.fillRect(x + 12, y + 44, 12, 4);
        ctx.fillRect(x + 24, y + 32, 8, 16);
      }
      // 手臂
      ctx.fillRect(x + 28, y + 18, 10, 6);
    }

    drawDucking(ctx, color, eyeColor, frame) {
      const x = this.x, y = this.y;
      ctx.fillStyle = color;
      
      // 身体扁平
      ctx.fillRect(x + 4,  y + 4,  50, 18);
      // 头低
      ctx.fillRect(x + 30, y,      24, 16);
      ctx.fillRect(x + 50, y + 6,  8,  4);
      ctx.fillStyle = eyeColor;
      ctx.fillRect(x + 44, y + 2,  8, 8);
      ctx.fillStyle = '#333';
      ctx.fillRect(x + 47, y + 4,  4, 4);
      ctx.fillStyle = color;
      // 尾巴
      ctx.fillRect(x,      y + 10, 8,  6);
      // 腿
      const lf = Math.floor(frame / 5) % 2;
      if (lf === 0) {
        ctx.fillRect(x + 10, y + 22, 8, 8);
        ctx.fillRect(x + 28, y + 22, 8, 6);
        ctx.fillRect(x + 28, y + 28, 10, 3);
      } else {
        ctx.fillRect(x + 10, y + 22, 8, 6);
        ctx.fillRect(x + 10, y + 28, 10, 3);
        ctx.fillRect(x + 28, y + 22, 8, 8);
      }
    }
  }

  // ============================================================
  // 仙人掌
  // ============================================================
  class Cactus {
    constructor(x, groundY) {
      this.groundY = groundY;
      const types = [
        { w: 20, h: 50, arms: 1 },
        { w: 24, h: 60, arms: 2 },
        { w: 16, h: 40, arms: 0 },
        { w: 44, h: 50, arms: 1, double: true },
      ];
      const t = types[Math.floor(Math.random() * types.length)];
      this.w = t.w;
      this.h = t.h;
      this.arms = t.arms;
      this.double = t.double || false;
      this.x = x;
      this.y = groundY - this.h;
    }

    update(dt, speed) { this.x -= speed * dt; }

    getHitbox() {
      return { x: this.x + 4, y: this.y + 4, w: this.w - 8, h: this.h - 4 };
    }

    draw(ctx, dark, night) {
      let color;
      if (dark) {
        color = night ? '#5a8a5a' : '#4a7a4a';
      } else {
        color = night ? '#2a5a2a' : '#535353';
      }
      ctx.fillStyle = color;
      this._drawSingle(ctx, this.x, this.y, this.w, this.h, this.arms);
      if (this.double) {
        this._drawSingle(ctx, this.x + this.w + 4, this.y + 10, this.w * 0.7, this.h * 0.8, 1);
      }
    }

    _drawSingle(ctx, x, y, w, h, arms) {
      ctx.fillStyle = ctx.fillStyle;
      // 主干
      ctx.fillRect(x + w * 0.3, y, w * 0.4, h);
      // 顶部圆
      ctx.beginPath();
      ctx.arc(x + w * 0.5, y + 2, w * 0.2, 0, Math.PI * 2);
      ctx.fill();
      // 手臂
      if (arms >= 1) {
        ctx.fillRect(x, y + h * 0.3, w * 0.35, w * 0.3);
        ctx.fillRect(x, y + h * 0.15, w * 0.3, w * 0.3);
        ctx.beginPath();
        ctx.arc(x + w * 0.15, y + h * 0.15, w * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
      if (arms >= 2) {
        ctx.fillRect(x + w * 0.65, y + h * 0.4, w * 0.35, w * 0.3);
        ctx.fillRect(x + w * 0.7,  y + h * 0.25, w * 0.3, w * 0.3);
        ctx.beginPath();
        ctx.arc(x + w * 0.85, y + h * 0.25, w * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ============================================================
  // 翼龙
  // ============================================================
  class Pterodactyl {
    constructor(x, groundY) {
      this.w = 46;
      this.h = 30;
      this.x = x;
      const heights = [groundY - 80, groundY - 110, groundY - 140];
      this.y = heights[Math.floor(Math.random() * heights.length)];
      this.wingFrame = 0;
    }

    update(dt, speed) {
      this.x -= speed * dt;
      this.wingFrame++;
    }

    getHitbox() {
      return { x: this.x + 4, y: this.y + 4, w: this.w - 8, h: this.h - 8 };
    }

    draw(ctx, dark, night) {
      let color;
      if (dark) {
        color = night ? '#aaa' : '#bbb';
      } else {
        color = night ? '#666' : '#535353';
      }
      ctx.fillStyle = color;

      const wf = Math.floor(this.wingFrame / 8) % 2;
      const x = this.x, y = this.y;

      // 身体
      ctx.fillRect(x + 14, y + 10, 20, 12);
      // 头
      ctx.fillRect(x + 30, y + 6,  14, 10);
      // 嘴
      ctx.fillRect(x + 42, y + 8,  8,  4);
      // 眼
      ctx.fillStyle = dark ? '#1a1a1a' : '#f7f7f7';
      ctx.fillRect(x + 36, y + 7,  5, 5);
      ctx.fillStyle = '#333';
      ctx.fillRect(x + 38, y + 8,  3, 3);
      ctx.fillStyle = color;
      // 翅膀
      if (wf === 0) {
        ctx.fillRect(x,      y,      16, 6);
        ctx.fillRect(x + 2,  y - 6,  12, 8);
        ctx.fillRect(x + 28, y,      16, 6);
        ctx.fillRect(x + 30, y - 6,  12, 8);
      } else {
        ctx.fillRect(x,      y + 14, 16, 6);
        ctx.fillRect(x + 2,  y + 18, 12, 8);
        ctx.fillRect(x + 28, y + 14, 16, 6);
        ctx.fillRect(x + 30, y + 18, 12, 8);
      }
      // 尾巴
      ctx.fillRect(x + 8,  y + 14, 10, 4);
      ctx.fillRect(x + 4,  y + 16, 8,  4);
    }
  }

  // ============================================================
  // 云朵
  // ============================================================
  class Cloud {
    constructor(x, H) {
      this.x = x;
      this.y = 30 + Math.random() * (H * 0.35);
      this.w = 60 + Math.random() * 40;
      this.speed = 0.5 + Math.random() * 0.5;
    }

    update(dt, speed) {
      this.x -= (speed + this.speed) * dt;
    }

    draw(ctx, dark, night) {
      const alpha = night ? 0.3 : 0.6;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = dark
        ? (night ? '#555' : '#444')
        : (night ? '#aaa' : '#ccc');
      const x = this.x, y = this.y, w = this.w;
      ctx.beginPath();
      ctx.arc(x + w * 0.25, y + 10, w * 0.18, 0, Math.PI * 2);
      ctx.arc(x + w * 0.5,  y + 5,  w * 0.22, 0, Math.PI * 2);
      ctx.arc(x + w * 0.75, y + 10, w * 0.18, 0, Math.PI * 2);
      ctx.fillRect(x + w * 0.07, y + 10, w * 0.86, 12);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

})();
