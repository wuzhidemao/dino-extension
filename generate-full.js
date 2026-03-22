// content.js - 完整小恐龙游戏 Edge 插件（兼容性修复版 v1.0.3）
// 完整文件

(function() {
  'use strict';

  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.warn('Dino extension: chrome.runtime not available');
    return;
  }

  var container = null;
  var shadowRoot = null;

  function ensureContainer() {
    if (container && shadowRoot) return true;
    
    if (!document.body) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ensureContainer);
        return false;
      }
      if (!document.body) {
        var body = document.createElement('body');
        document.documentElement.appendChild(body);
      }
    }

    container = document.getElementById('dino-overlay-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'dino-overlay-container';
      container.style.cssText = 'position:fixed!important;top:0!important;left:0!important;width:0!important;height:0!important;z-index:2147483647!important;pointer-events:none!important;';
      document.body.appendChild(container);
      
      try {
        shadowRoot = container.attachShadow({ mode: 'open' });
        var style = document.createElement('style');
        style.textContent = getInlineCSS();
        shadowRoot.appendChild(style);
      } catch (e) {
        console.warn('Dino extension: Shadow DOM not available, using fallback');
        shadowRoot = container;
        injectFallbackCSS();
      }
    }
    return true;
  }

  function getInlineCSS() {
    return '*{box-sizing:border-box!important;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',Roboto,Arial,sans-serif!important;margin:0;padding:0}.dino-window{position:fixed!important;z-index:2147483647!important;border-radius:12px!important;overflow:hidden!important;box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(255,255,255,0.1)!important;pointer-events:all!important;display:flex!important;flex-direction:column!important;min-width:400px!important;min-height:180px!important;animation:dinoWindowIn .25s cubic-bezier(.34,1.56,.64,1)!important}.dino-window.dark-mode{background:#1a1a1a!important}.dino-window.light-mode{background:#f7f7f7!important}@keyframes dinoWindowIn{from{transform:scale(.8) translateY(20px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}.dino-titlebar{display:flex!important;align-items:center!important;justify-content:space-between!important;padding:8px 12px!important;cursor:move!important;user-select:none!important;flex-shrink:0!important}.dino-window.dark-mode .dino-titlebar{background:#2a2a2a!important;border-bottom:1px solid #3a3a3a!important}.dino-window.light-mode .dino-titlebar{background:#e8e8e8!important;border-bottom:1px solid #ccc!important}.dino-titlebar-left{display:flex!important;align-items:center!important;gap:8px!important}.dino-titlebar-dots{display:flex!important;gap:5px!important}.dino-dot{width:12px!important;height:12px!important;border-radius:50%!important;cursor:pointer!important;transition:opacity .2s!important;flex-shrink:0!important}.dino-dot:hover{opacity:.7!important}.dino-dot-red{background:#ff5f57!important}.dino-dot-yellow{background:#febc2e!important}.dino-dot-green{background:#28c840!important}.dino-title{font-size:12px!important;font-weight:600!important;white-space:nowrap!important}.dino-window.dark-mode .dino-title{color:#ccc!important}.dino-window.light-mode .dino-title{color:#555!important}.dino-titlebar-right{display:flex!important;align-items:center!important;gap:8px!important}.dino-btn-icon{width:24px!important;height:24px!important;border:none!important;border-radius:6px!important;cursor:pointer!important;font-size:13px!important;display:flex!important;align-items:center!important;justify-content:center!important;transition:all .15s!important;background:transparent!important;padding:0!important;line-height:1!important}.dino-window.dark-mode .dino-btn-icon{color:#aaa!important}.dino-window.dark-mode .dino-btn-icon:hover{background:rgba(255,255,255,.1)!important;color:#fff!important}.dino-window.light-mode .dino-btn-icon{color:#666!important}.dino-window.light-mode .dino-btn-icon:hover{background:rgba(0,0,0,.1)!important;color:#000!important}.dino-score-display{font-size:11px!important;font-weight:700!important;letter-spacing:1px!important;padding:2px 8px!important;border-radius:4px!important;font-family:\'Courier New\',monospace!important;white-space:nowrap!important}.dino-window.dark-mode .dino-score-display{color:#888!important;background:rgba(255,255,255,.05)!important}.dino-window.light-mode .dino-score-display{color:#555!important;background:rgba(0,0,0,.05)!important}.dino-canvas-wrap{flex:1!important;overflow:hidden!important;position:relative!important;display:flex!important;align-items:center!important;justify-content:center!important;min-height:0!important}.dino-window.dark-mode .dino-canvas-wrap{background:#1a1a1a!important}.dino-window.light-mode .dino-canvas-wrap{background:#f7f7f7!important}.dino-canvas-wrap canvas{display:block!important;image-rendering:pixelated!important;outline:none!important;max-width:100%!important;max-height:100%!important}.dino-fullscreen{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;border-radius:0!important}.dino-status-bar{display:flex!important;align-items:center!important;justify-content:space-between!important;padding:4px 12px!important;font-size:10px!important;flex-shrink:0!important}.dino-window.dark-mode .dino-status-bar{background:#222!important;border-top:1px solid #333!important;color:#666!important}.dino-window.light-mode .dino-status-bar{background:#e0e0e0!important;border-top:1px solid #ccc!important;color:#888!important}.dino-fps-display{font-family:\'Courier New\',monospace!important}';
  }

  function injectFallbackCSS() {
    var styleId = 'dino-extension-fallback-css';
    if (document.getElementById(styleId)) return;
    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = getInlineCSS();
    if (document.head) document.head.appendChild(style);
  }

  chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    try {
      if (msg.action === 'launchDino') {
        setTimeout(function() {
          if (ensureContainer()) {
            createDinoWindow(msg);
          }
        }, 50);
        sendResponse({ success: true });
      } else if (msg.action === 'closeAllDino') {
        if (shadowRoot) {
          shadowRoot.querySelectorAll('.dino-window').forEach(function(w) { w.remove(); });
        }
        sendResponse({ success: true });
      }
    } catch (e) {
      console.error('Dino extension error:', e);
      sendResponse({ success: false, error: e.message });
    }
    return true;
  });

  function createDinoWindow(opts) {
    var isDark = opts.dark !== false;
    var soundOn = opts.sound !== false;
    var isFullscreen = opts.fullscreen;

    var win = document.createElement('div');
    win.className = 'dino-window ' + (isDark ? 'dark-mode' : 'light-mode');

    var W = isFullscreen ? window.innerWidth : (opts.width || 700);
    var H = isFullscreen ? window.innerHeight : (opts.height || 260);

    if (isFullscreen) {
      win.classList.add('dino-fullscreen');
    } else {
      var left = Math.max(20, Math.floor((window.innerWidth - W) / 2));
      var top = Math.max(20, Math.floor((window.innerHeight - H) / 2));
      
      win.style.position = 'fixed';
      win.style.left = left + 'px';
      win.style.top = top + 'px';
      win.style.width = W + 'px';
      win.style.height = H + 'px';
    }

    var titlebar = document.createElement('div');
    titlebar.className = 'dino-titlebar';

    var tbLeft = document.createElement('div');
    tbLeft.className = 'dino-titlebar-left';

    var dots = document.createElement('div');
    dots.className = 'dino-titlebar-dots';
    
    var dotRed = document.createElement('div');
    dotRed.className = 'dino-dot dino-dot-red';
    dotRed.title = '关闭';
    dotRed.addEventListener('click', function() { win.remove(); });
    
    var dotYellow = document.createElement('div');
    dotYellow.className = 'dino-dot dino-dot-yellow';
    dotYellow.title = '最小化';
    dotYellow.addEventListener('click', function() {
      win.style.display = win.style.display === 'none' ? '' : 'none';
    });
    
    var dotGreen = document.createElement('div');
    dotGreen.className = 'dino-dot dino-dot-green';
    dotGreen.title = '切换全屏';
    
    dots.appendChild(dotRed);
    dots.appendChild(dotYellow);
    dots.appendChild(dotGreen);

    var title = document.createElement('span');
    title.className = 'dino-title';
    title.textContent = '🦕 小恐龙游戏';

    tbLeft.appendChild(dots);
    tbLeft.appendChild(title);

    var tbRight = document.createElement('div');
    tbRight.className = 'dino-titlebar-right';

    var scoreDisplay = document.createElement('span');
    scoreDisplay.className = 'dino-score-display';
    scoreDisplay.textContent = 'HI 00000  00000';

    var btnSound = document.createElement('button');
    btnSound.className = 'dino-btn-icon';
    btnSound.title = '切换音效';
    var soundEnabled = soundOn;
    btnSound.textContent = soundEnabled ? '🔊' : '🔇';
    btnSound.addEventListener('click', function() {
      soundEnabled = !soundEnabled;
      btnSound.textContent = soundEnabled ? '🔊' : '🔇';
      if (gameInstance) gameInstance.soundEnabled = soundEnabled;
    });

    var btnTheme = document.createElement('button');
    btnTheme.className = 'dino-btn-icon';
    btnTheme.title = '切换主题';
    btnTheme.textContent = isDark ? '☀️' : '🌙';
    btnTheme.addEventListener('click', function() {
      win.classList.toggle('dark-mode');
      win.classList.toggle('light-mode');
      var nowDark = win.classList.contains('dark-mode');
      btnTheme.textContent = nowDark ? '☀️' : '🌙';
      if (gameInstance) gameInstance.darkMode = nowDark;
    });

    var btnClose = document.createElement('button');
    btnClose.className = 'dino-btn-icon';
    btnClose.title = '关闭';
    btnClose.textContent = '✕';
    btnClose.addEventListener('click', function() { win.remove(); });

    tbRight.appendChild(scoreDisplay);
    tbRight.appendChild(btnSound);
    tbRight.appendChild(btnTheme);
    tbRight.appendChild(btnClose);

    titlebar.appendChild(tbLeft);
    titlebar.appendChild(tbRight);

    var canvasWrap = document.createElement('div');
    canvasWrap.className = 'dino-canvas-wrap';

    var canvas = document.createElement('canvas');
    canvas.tabIndex = 0;
    canvasWrap.appendChild(canvas);

    var statusBar = document.createElement('div');
    statusBar.className = 'dino-status-bar';
    statusBar.innerHTML = '<span>空格/↑ 跳跃 | ↓ 俯冲 | 拖拽移动</span><span class="dino-fps-display">FPS: --</span>';

    win.appendChild(titlebar);
    win.appendChild(canvasWrap);
    win.appendChild(statusBar);
    
    if (shadowRoot) {
      shadowRoot.appendChild(win);
    }

    makeDraggable(win, titlebar);

    dotGreen.addEventListener('click', function() {
      win.classList.toggle('dino-fullscreen');
      if (win.classList.contains('dino-fullscreen')) {
        win.style.left = '0';
        win.style.top = '0';
        win.style.width = '100vw';
        win.style.height = '100vh';
      } else {
        win.style.left = '20px';
        win.style.top = '20px';
        win.style.width = W + 'px';
        win.style.height = H + 'px';
      }
      if (gameInstance) gameInstance.resize();
    });

    var gameInstance = null;
    
    requestAnimationFrame(function() {
      gameInstance = new DinoGame(canvas, canvasWrap, {
        dark: isDark,
        sound: soundEnabled,
        onScore: function(score, hi) {
          var s = String(score).padStart(5, '0');
          var h = String(hi).padStart(5, '0');
          scoreDisplay.textContent = 'HI ' + h + '  ' + s;
        },
        onFps: function(fps) {
          var el = statusBar.querySelector('.dino-fps-display');
          if (el) el.textContent = 'FPS: ' + fps;
        }
      });
      gameInstance.start();
      canvas.focus();
    });
  }

  function makeDraggable(win, handle) {
    var isDragging = false;
    var startX = 0;
    var startY = 0;
    var startLeft = 0;
    var startTop = 0;
    
    handle.addEventListener('mousedown', function(e) {
      if (e.target.classList.contains('dino-dot') || e.target.classList.contains('dino-btn-icon')) {
        return;
      }
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = win.offsetLeft;
      startTop = win.offsetTop;
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      var newLeft = startLeft + dx;
      var newTop = startTop + dy;
      var maxLeft = window.innerWidth - win.offsetWidth;
      var maxTop = window.innerHeight - win.offsetHeight;
      newLeft = Math.max(0, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));
      win.style.left = newLeft + 'px';
      win.style.top = newTop + 'px';
    });
    
    document.addEventListener('mouseup', function() {
      isDragging = false;
    });
  }

  function DinoGame(canvas, wrap, opts) {
    this.canvas = canvas;
    this.wrap = wrap;
    this.ctx = canvas.getContext('2d');
    this.opts = opts;
    this.darkMode = opts.dark;
    this.soundEnabled = opts.sound;
    this.running = true;
    this.state = 'WAITING';
    this.score = 0;
    this.hiScore = 0;
    try { this.hiScore = parseInt(localStorage.getItem('dino_hi') || '0'); } catch(e) {}
    this.speed = 6;
    this.baseSpeed = 6;
    this.frame = 0;
    this.distance = 0;
    this.dino = null;
    this.obstacles = [];
    this.clouds = [];
    this.stars = [];
    this.groundY = 0;
    this.groundX = 0;
    this.nightMode = false;
    this.nightTimer = 0;
    this.nightDuration = 500;
    this.lastTime = 0;
    this.fpsTimer = 0;
    this.fpsCount = 0;
    this.fps = 60;
    this.audioCtx = null;
    this._lastMilestone = -1;
    this._prevTs = 0;
    var self = this;
    this.resize();
    window.addEventListener('resize', function() { self.resize(); });
  }

  DinoGame.prototype.resize = function() {
    var rect = this.wrap.getBoundingClientRect();
    this.W = Math.max(rect.width, 400) || 700;
    this.H = Math.max(rect.height, 150) || 260;
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.groundY = this.H - 40;
    if (this.dino) {
      this.dino.y = this.groundY - this.dino.h;
      this.dino.groundY = this.groundY;
    }
  };

  DinoGame.prototype.start = function() {
    this.initEntities();
    this.bindKeys();
    this.bindTouch();
    this.lastTime = performance.now();
    var self = this;
    requestAnimationFrame(function(t) { self.loop(t); });
  };

  DinoGame.prototype.initEntities = function() {
    this.dino = new Dino(this.groundY);
    this.obstacles = [];
    this.clouds = [];
    this.stars = [];
    this.groundX = 0;
    for (var i = 0; i < 3; i++) {
      this.clouds.push(new Cloud(this.W * (0.3 + i * 0.35), this.H));
    }
    for (var j = 0; j < 20; j++) {
      this.stars.push({ x: Math.random() * this.W, y: Math.random() * this.groundY * 0.7, r: Math.random() * 1.5 + 0.5, alpha: Math.random() });
    }
  };

  DinoGame.prototype.bindKeys = function() {
    var self = this;
    this.keyHandler = function(e) {
      if (['Space','ArrowUp','ArrowDown'].indexOf(e.code) !== -1) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        self.handleJump();
      }
      if (e.code === 'ArrowDown' && self.state === 'RUNNING' && self.dino) {
        self.dino.duck(true);
      }
    };
    this.keyUpHandler = function(e) {
      if (e.code === 'ArrowDown' && self.dino) {
        self.dino.duck(false);
      }
    };
    document.addEventListener('keydown', this.keyHandler, true);
    document.addEventListener('keyup', this.keyUpHandler, true);
  };

  DinoGame.prototype.bindTouch = function() {
    var self = this;
    this.canvas.addEventListener('click', function() { self.handleJump(); });
    this.canvas.addEventListener('touchstart', function(e) {
      e.preventDefault();
      self.handleJump();
    }, { passive: false });
  };

  DinoGame.prototype.handleJump = function() {
    if (this.state === 'WAITING' || this.state === 'GAMEOVER') {
      this.resetGame();
      this.state = 'RUNNING';
      this.playSound('start');
    } else if (this.state === 'RUNNING' && this.dino && this.dino.jump()) {
      this.playSound('jump');
    }
  };

  DinoGame.prototype.resetGame = function() {
    this.score = 0;
    this.speed = this.baseSpeed;
    this.frame = 0;
    this.distance = 0;
    this.nightMode = false;
    this.nightTimer = 0;
    this._lastMilestone = -1;
    this.initEntities();
  };

  DinoGame.prototype.loop = function(timestamp) {
    if (!this.running) return;
    var dt = Math.min((timestamp - this.lastTime) / 16.67, 3);
    this.lastTime = timestamp;
    this.fpsCount++;
    this.fpsTimer += timestamp - this._prevTs;
    this._prevTs = timestamp;
    if (this.fpsTimer >= 1000) {
      this.fps = this.fpsCount;
      this.fpsCount = 0;
      this.fpsTimer = 0;
      if (this.opts.onFps) this.opts.onFps(this.fps);
    }
    this.update(dt);
    this.draw();
    var self = this;
    requestAnimationFrame(function(t) { self.loop(t); });
  };

  DinoGame.prototype.update = function(dt) {
    if (this.state !== 'RUNNING') return;
    this.frame++;
    this.distance += this.speed * dt;
    this.score = Math.floor(this.distance / 10);
    if (this.score > this.hiScore) {
      this.hiScore = this.score;
      try { localStorage.setItem('dino_hi', String(this.hiScore)); } catch(e) {}
    }
    if (this.opts.onScore) this.opts.onScore(this.score, this.hiScore);
    this.speed = this.baseSpeed + this.score * 0.004;
    if (this.speed > 18) this.speed = 18;
    this.nightTimer++;
    if (this.nightTimer >= this.nightDuration) {
      this.nightMode = !this.nightMode;
      this.nightTimer = 0;
    }
    if (this.dino) this.dino.update(dt);
    var spawnRate = Math.max(40, 90 - Math.floor(this.score / 50));
    if (this.frame % spawnRate === 0) this.spawnObstacle();
    this.obstacles = this.obstacles.filter(function(o) { return o.x + o.w > -50; });
    for (var i = 0; i < this.obstacles.length; i++) {
      this.obstacles[i].update(dt, this.speed);
    }
    if (this.dino) {
      for (var j = 0; j < this.obstacles.length; j++) {
        if (this.checkCollision(this.dino, this.obstacles[j])) {
          this.state = 'GAMEOVER';
          this.playSound('die');
          this.dino.die();
          return;
        }
      }
    }
    for (var k = 0; k < this.clouds.length; k++) {
      this.clouds[k].update(dt, this.speed * 0.3);
    }
    if (this.clouds.length < 4 && Math.random() < 0.005) {
      this.clouds.push(new Cloud(this.W + 50, this.H));
    }
    this.clouds = this.clouds.filter(function(c) { return c.x > -200; });
    this.groundX -= this.speed * dt;
    if (this.groundX < -this.W) this.groundX += this.W;
    if (this.score > 0 && this.score % 100 === 0 && this._lastMilestone !== this.score) {
      this._lastMilestone = this.score;
      this.playSound('score');
    }
  };

  DinoGame.prototype.spawnObstacle = function() {
    var r = Math.random();
    if (r < 0.15 && this.score > 200) {
      this.obstacles.push(new Pterodactyl(this.W + 50, this.groundY));
    } else {
      this.obstacles.push(new Cactus(this.W + 50, this.groundY));
    }
  };

  DinoGame.prototype.checkCollision = function(dino, obs) {
    var dp = dino.getHitbox();
    var op = obs.getHitbox();
    return dp.x < op.x + op.w && dp.x + dp.w > op.x && dp.y < op.y + op.h && dp.y + dp.h > op.y;
  };

  DinoGame.prototype.draw = function() {
    var ctx = this.ctx;
    var W = this.W, H = this.H;
    var bgColor = this.darkMode ? (this.nightMode ? '#111' : '#1a1a1a') : (this.nightMode ? '#1a1a2e' : '#f7f7f7');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);
    if (this.nightMode) {
      ctx.fillStyle = this.darkMode ? '#fff' : '#aaa';
      for (var si = 0; si < this.stars.length; si++) {
        var s = this.stars[si];
        s.alpha += (Math.random() - 0.5) * 0.05;
        s.alpha = Math.max(0.1, Math.min(1, s.alpha));
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    for (var ci = 0; ci < this.clouds.length; ci++) {
      this.clouds[ci].draw(ctx, this.darkMode, this.nightMode);
    }
    this.drawGround(ctx, W, H);
    for (var oi = 0; oi < this.obstacles.length; oi++) {
      this.obstacles[oi].draw(ctx, this.darkMode, this.nightMode);
    }
    if (this.dino) {
      this.dino.draw(ctx, this.darkMode, this.nightMode, this.frame);
    }
    if (this.state === 'WAITING') {
      this.drawMessage(ctx, W, H, '按 空格 / 点击 开始游戏', '🦕');
    }
    if (this.state === 'GAMEOVER') {
      this.drawGameOver(ctx, W, H);
    }
  };

  DinoGame.prototype.drawGround = function(ctx, W, H) {
    var color = this.darkMode ? (this.nightMode ? '#555' : '#444') : (this.nightMode ? '#888' : '#535353');
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY + 2);
    ctx.lineTo(W, this.groundY + 2);
    ctx.stroke();
    ctx.fillStyle = color;
    var gx = ((this.groundX % 60) + 60) % 60;
    for (var x = gx - 60; x < W + 60; x += 60) {
      ctx.fillRect(x, this.groundY + 5, 8, 2);
      ctx.fillRect(x + 20, this.groundY + 8, 5, 2);
      ctx.fillRect(x + 40, this.groundY + 5, 10, 2);
      ctx.fillRect(x + 10, this.groundY + 12, 6, 2);
      ctx.fillRect(x + 35, this.groundY + 14, 8, 2);
    }
  };

  DinoGame.prototype.drawMessage = function(ctx, W, H, text, emoji) {
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = this.darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';
    var bw = 320, bh = 70;
    var bx = (W - bw) / 2, by = (H - bh) / 2 - 10;
    this.roundRect(ctx, bx, by, bw, bh, 12);
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
  };

  DinoGame.prototype.drawGameOver = function(ctx, W, H) {
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = this.darkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)';
    var bw = 340, bh = 100;
    var bx = (W - bw) / 2, by = (H - bh) / 2 - 10;
    this.roundRect(ctx, bx, by, bw, bh, 14);
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
  };

  DinoGame.prototype.roundRect = function(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  DinoGame.prototype.getAudioCtx = function() {
    if (!this.audioCtx) {
      try { this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    return this.audioCtx;
  };

  DinoGame.prototype.playSound = function(type) {
    if (!this.soundEnabled) return;
    var ac = this.getAudioCtx();
    if (!ac) return;
    try {
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      osc.connect(gain);
      gain.connect(ac.destination);
      var now = ac.currentTime;
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
  };

  function Dino(groundY) {
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

  Dino.prototype.jump = function() {
    if (!this.jumping && !this.ducking) {
      this.vy = this.jumpForce;
      this.jumping = true;
      return true;
    }
    return false;
  };

  Dino.prototype.duck = function(on) {
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
  };

  Dino.prototype.die = function() { this.dead = true; };

  Dino.prototype.update = function(dt) {
    if (this.jumping) {
      this.vy += this.gravity * dt;
      this.y += this.vy * dt;
      if (this.y >= this.groundY - this.h) {
        this.y = this.groundY - this.h;
        this.vy = 0;
        this.jumping = false;
      }
    }
    if (!this.dead) this.legFrame++;
  };

  Dino.prototype.getHitbox = function() {
    return { x: this.x + 6, y: this.y + 4, w: this.w - 12, h: this.h - 8 };
  };

  Dino.prototype.draw = function(ctx, dark, night, frame) {
    var color = dark ? (night ? '#aaa' : '#ccc') : (night ? '#888' : '#535353');
    var eyeColor = dark ? '#1a1a1a' : '#f7f7f7';
    ctx.save();
    ctx.fillStyle = color;
    if (this.ducking) {
      var x = this.x, y = this.y;
      ctx.fillRect(x + 4, y + 4, 50, 18);
      ctx.fillRect(x + 30, y, 24, 16);
      ctx.fillRect(x + 50, y + 6, 8, 4);
      ctx.fillStyle = eyeColor;
      ctx.fillRect(x + 44, y + 2, 8, 8);
      ctx.fillStyle = '#333';
      ctx.fillRect(x + 47, y + 4, 4, 4);
      ctx.fillStyle = color;
      ctx.fillRect(x, y + 10, 8, 6);
      var lf = Math.floor(frame / 5) % 2;
      if (lf === 0) {
        ctx.fillRect(x + 10, y + 22, 8, 8);
        ctx.fillRect(x + 28, y + 22, 8, 6);
        ctx.fillRect(x + 28, y + 28, 10, 3);
      } else {
        ctx.fillRect(x