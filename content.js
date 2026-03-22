// Edge Dino Game v2.2 - Fixed All Issues
(function(){
  console.log('[Dino] Extension loaded v2.2');
  
  var container = null;
  var shadow = null;
  var gameWindow = null;
  
  function init() {
    try {
      container = document.createElement('div');
      container.id = 'dino-container';
      container.style.cssText = 'position:fixed!important;z-index:2147483647!important;pointer-events:none!important;left:-9999px!important;top:-9999px!important';
      document.body.appendChild(container);
      
      try {
        shadow = container.attachShadow({mode: 'open'});
      } catch(e) {
        shadow = container;
      }
      
      var style = document.createElement('style');
      style.textContent = getStyles();
      shadow.appendChild(style);
      
      chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if(request.action === 'launchDino') {
          launchGame(request);
          sendResponse({success: true});
        } else if(request.action === 'closeAllDino') {
          closeGame();
          sendResponse({success: true});
        }
        return true;
      });
    } catch(e) {
      console.error('[Dino] Init error:', e);
    }
  }
  
  function getStyles() {
    return [
      '.dino-win{position:fixed!important;z-index:2147483647!important;border-radius:12px!important;overflow:hidden!important;box-shadow:0 20px 60px rgba(0,0,0,.5)!important;pointer-events:all!important;display:flex!important;flex-direction:column!important;min-width:400px!important;min-height:180px!important;background:#1a1a1a!important;font-family:Segoe UI,Arial,sans-serif!important}',
      '.dino-titlebar{display:flex!important;align-items:center!important;justify-content:space-between!important;padding:8px 12px!important;cursor:move!important;background:#2a2a2a!important;user-select:none!important}',
      '.dino-tb{display:flex!important;align-items:center!important;gap:8px!important}',
      '.dino-dots{display:flex!important;gap:5px!important}',
      '.dino-dot{width:12px!important;height:12px!important;border-radius:50%!important;cursor:pointer!important;transition:opacity 0.2s!important}',
      '.dino-dot:hover{opacity:0.7!important}',
      '.dino-dot.red{background:#ff5f57!important}',
      '.dino-dot.yellow{background:#febc2e!important}',
      '.dino-dot.green{background:#28c840!important}',
      '.dino-title{font-size:12px!important;font-weight:600!important;color:#ccc!important;margin-left:8px!important}',
      '.dino-btn{width:24px!important;height:24px!important;border:none!important;border-radius:6px!important;cursor:pointer!important;font-size:13px!important;background:transparent!important;color:#aaa!important;display:flex!important;align-items:center!important;justify-content:center!important}',
      '.dino-score{font-size:11px!important;font-weight:700!important;padding:2px 8px!important;border-radius:4px!important;font-family:Courier New,monospace!important;color:#888!important}',
      '.dino-wrap{flex:1!important;overflow:hidden!important;display:flex!important;align-items:center!important;justify-content:center!important;background:#1a1a1a!important;min-height:0!important;position:relative!important}',
      '.dino-wrap canvas{display:block!important}',
      '.dino-bar{display:flex!important;align-items:center!important;justify-content:space-between!important;padding:4px 12px!important;font-size:10px!important;background:#222!important;color:#666!important}',
      '.dino-fullscreen{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;border-radius:0!important}'
    ].join('');
  }
  
  function launchGame(opts) {
    closeGame();
    
    var W = opts.width || 700;
    var H = opts.height || 260;
    var fullscreen = opts.fullscreen;
    var soundOn = opts.sound !== false;
    
    gameWindow = document.createElement('div');
    gameWindow.className = 'dino-win';
    
    if(fullscreen) {
      gameWindow.classList.add('dino-fullscreen');
    } else {
      var l = Math.max(20, Math.floor((window.innerWidth - W) / 2));
      var t = Math.max(20, Math.floor((window.innerHeight - H) / 2));
      gameWindow.style.cssText = 'left:' + l + 'px!important;top:' + t + 'px!important;width:' + W + 'px!important;height:' + H + 'px!important;';
    }
    
    // 标题栏
    var tb = document.createElement('div');
    tb.className = 'dino-titlebar';
    
    var tbl = document.createElement('div');
    tbl.className = 'dino-tb';
    
    var dots = document.createElement('div');
    dots.className = 'dino-dots';
    
    var dr = document.createElement('div');
    dr.className = 'dino-dot red';
    dr.title = '关闭';
    dr.onclick = function(e) { e.stopPropagation(); closeGame(); };
    
    var dy = document.createElement('div');
    dy.className = 'dino-dot yellow';
    dy.title = '最小化';
    dy.onclick = function(e) { 
      e.stopPropagation(); 
      gameWindow.style.display = gameWindow.style.display === 'none' ? '' : 'none'; 
    };
    
    var dg = document.createElement('div');
    dg.className = 'dino-dot green';
    dg.title = '全屏';
    dg.onclick = function(e) {
      e.stopPropagation();
      gameWindow.classList.toggle('dino-fullscreen');
      if(gameWindow.classList.contains('dino-fullscreen')) {
        gameWindow.style.cssText = '';
      } else {
        gameWindow.style.cssText = 'left:' + l + 'px!important;top:' + t + 'px!important;width:' + W + 'px!important;height:' + H + 'px!important;';
      }
      if(window._dinoGame) window._dinoGame.resize();
    };
    
    dots.appendChild(dr);
    dots.appendChild(dy);
    dots.appendChild(dg);
    
    var title = document.createElement('span');
    title.className = 'dino-title';
    title.textContent = '🦕 Dino Game';
    
    tbl.appendChild(dots);
    tbl.appendChild(title);
    
    var tbr = document.createElement('div');
    tbr.className = 'dino-tb';
    
    var scoreEl = document.createElement('span');
    scoreEl.className = 'dino-score';
    scoreEl.textContent = 'HI 00000  00000';
    
    var btnSound = document.createElement('button');
    btnSound.className = 'dino-btn';
    btnSound.textContent = soundOn ? '🔊' : '🔇';
    btnSound.title = '音效开关';
    btnSound.onclick = function(e) { 
      e.stopPropagation();
      soundOn = !soundOn;
      btnSound.textContent = soundOn ? '🔊' : '🔇';
      if(window._dinoGame) window._dinoGame.sound = soundOn;
    };
    
    var btnClose = document.createElement('button');
    btnClose.className = 'dino-btn';
    btnClose.textContent = '✕';
    btnClose.title = '关闭';
    btnClose.onclick = function(e) { e.stopPropagation(); closeGame(); };
    
    tbr.appendChild(scoreEl);
    tbr.appendChild(btnSound);
    tbr.appendChild(btnClose);
    tb.appendChild(tbl);
    tb.appendChild(tbr);
    
    // 游戏区域
    var wrap = document.createElement('div');
    wrap.className = 'dino-wrap';
    var canvas = document.createElement('canvas');
    canvas.tabIndex = 0;
    wrap.appendChild(canvas);
    
    // 状态栏
    var bar = document.createElement('div');
    bar.className = 'dino-bar';
    bar.innerHTML = '<span>空格/↑跳跃 | ↓俯冲 | 拖拽移动</span><span id="fps-display">FPS: --</span>';
    
    gameWindow.appendChild(tb);
    gameWindow.appendChild(wrap);
    gameWindow.appendChild(bar);
    
    shadow.appendChild(gameWindow);
    
    // 拖拽功能
    var dragging = false, dx, dy, startX, startY;
    tb.addEventListener('mousedown', function(e) {
      if(e.target.classList.contains('dino-dot') || e.target.tagName === 'BUTTON' || e.target.tagName === 'SPAN') return;
      dragging = true;
      dx = e.clientX - gameWindow.offsetLeft;
      dy = e.clientY - gameWindow.offsetTop;
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
      if(!dragging || gameWindow.classList.contains('dino-fullscreen')) return;
      var newX = e.clientX - dx;
      var newY = e.clientY - dy;
      newX = Math.max(0, Math.min(window.innerWidth - gameWindow.offsetWidth, newX));
      newY = Math.max(0, Math.min(window.innerHeight - gameWindow.offsetHeight, newY));
      gameWindow.style.left = newX + 'px';
      gameWindow.style.top = newY + 'px';
    });
    
    document.addEventListener('mouseup', function() { dragging = false; });
    
    // 启动游戏
    window._dinoGame = new DinoGame(canvas, wrap, scoreEl, bar, {sound: soundOn});
    window._dinoGame.start();
    canvas.focus();
  }
  
  function closeGame() {
    if(window._dinoGame) {
      window._dinoGame.stop();
      delete window._dinoGame;
    }
    var wins = shadow.querySelectorAll('.dino-win');
    wins.forEach(function(w) { w.remove(); });
    gameWindow = null;
  }
  
  // 游戏类
  function DinoGame(canvas, wrap, scoreEl, bar, opts) {
    this.canvas = canvas;
    this.wrap = wrap;
    this.ctx = canvas.getContext('2d');
    this.scoreEl = scoreEl;
    this.bar = bar;
    this.sound = opts.sound;
    this.running = false;
    this.state = 'WAITING';
    this.score = 0;
    this.hi = 0;
    try { this.hi = parseInt(localStorage.getItem('dino_hi') || '0'); } catch(e) {}
    this.speed = 6;
    this.frame = 0;
    this.dino = null;
    this.obstacles = [];
    this.groundX = 0;
    this.night = false;
    this.fps = 0;
    this.fpsFrames = 0;
    this.fpsTime = 0;
    this.ac = null;
    
    this.resize();
  }
  
  DinoGame.prototype.resize = function() {
    var rect = this.wrap.getBoundingClientRect();
    this.W = Math.max(rect.width, 400);
    this.H = Math.max(rect.height, 150);
    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.groundY = this.H - 40;
  };
  
  DinoGame.prototype.start = function() {
    this.running = true;
    this.dino = new Dino(this.groundY);
    this.obstacles = [];
    this.frame = 0;
    this.score = 0;
    this.speed = 6;
    this.night = false;
    this.state = 'WAITING';
    this.bindEvents();
    this.lastTime = performance.now();
    this.loop();
  };
  
  DinoGame.prototype.stop = function() {
    this.running = false;
    document.removeEventListener('keydown', this.keyHandler);
    document.removeEventListener('keyup', this.keyUpHandler);
  };
  
  DinoGame.prototype.bindEvents = function() {
    var self = this;
    this.keyHandler = function(e) {
      if(['Space', 'ArrowUp', 'ArrowDown'].indexOf(e.code) !== -1) e.preventDefault();
      if(e.code === 'Space' || e.code === 'ArrowUp') self.jump();
      if(e.code === 'ArrowDown' && self.state === 'RUNNING') self.dino.duck(true);
    };
    this.keyUpHandler = function(e) {
      if(e.code === 'ArrowDown') self.dino.duck(false);
    };
    document.addEventListener('keydown', this.keyHandler);
    document.addEventListener('keyup', this.keyUpHandler);
    this.canvas.addEventListener('click', function() { self.jump(); });
    this.canvas.addEventListener('touchstart', function(e) { e.preventDefault(); self.jump(); }, {passive: false});
  };
  
  DinoGame.prototype.jump = function() {
    if(this.state === 'WAITING' || this.state === 'GAMEOVER') {
      this.state = 'RUNNING';
      this.dino.reset(this.groundY);
      this.obstacles = [];
      this.score = 0;
      this.speed = 6;
      this.playSound('start');
    } else if(this.state === 'RUNNING' && this.dino.jump()) {
      this.playSound('jump');
    }
  };
  
  DinoGame.prototype.loop = function() {
    if(!this.running) return;
    
    var now = performance.now();
    var dt = Math.min((now - this.lastTime) / 16.67, 3);
    this.lastTime = now;
    
    // FPS计算
    this.fpsFrames++;
    this.fpsTime += now - (this._prevTime || now);
    this._prevTime = now;
    if(this.fpsTime >= 1000) {
      this.fps = this.fpsFrames;
      this.fpsFrames = 0;
      this.fpsTime = 0;
      var fpsEl = document.getElementById('fps-display');
      if(fpsEl) fpsEl.textContent = 'FPS: ' + this.fps;
    }
    
    this.update(dt);
    this.draw();
    
    var self = this;
    requestAnimationFrame(function() { self.loop(); });
  };
  
  DinoGame.prototype.update = function(dt) {
    if(this.state !== 'RUNNING') return;
    
    this.frame++;
    this.score = Math.floor(this.frame * this.speed / 60);
    
    if(this.score > this.hi) {
      this.hi = this.score;
      try { localStorage.setItem('dino_hi', this.hi); } catch(e) {}
    }
    this.scoreEl.textContent = 'HI ' + String(this.hi).padStart(5, '0') + '  ' + String(this.score).padStart(5, '0');
    
    this.speed = Math.min(18, 6 + this.score * 0.003);
    
    // 夜间模式
    if(this.frame % 500 === 0) this.night = !this.night;
    
    // 恐龙
    this.dino.update(dt);
    
    // 障碍物
    var spawnRate = Math.max(40, 90 - Math.floor(this.score / 50));
    if(this.frame % spawnRate === 0) {
      if(Math.random() < 0.15 && this.score > 200) {
        this.obstacles.push(new Ptero(this.W + 50, this.groundY));
      } else {
        this.obstacles.push(new Cactus(this.W + 50, this.groundY));
      }
    }
    
    for(var i = this.obstacles.length - 1; i >= 0; i--) {
      this.obstacles[i].update(dt, this.speed);
      if(this.obstacles[i].x < -100) {
        this.obstacles.splice(i, 1);
      } else if(this.checkCollision(this.dino, this.obstacles[i])) {
        this.state = 'GAMEOVER';
        this.playSound('die');
        this.dino.dead = true;
      }
    }
    
    // 地面
    this.groundX -= this.speed * dt;
    if(this.groundX < -60) this.groundX += 60;
    
    // 里程碑音效
    if(this.score > 0 && this.score % 100 === 0 && this.frame % spawnRate === 0) {
      this.playSound('score');
    }
  };
  
  DinoGame.prototype.checkCollision = function(d, o) {
    var db = d.getHitbox();
    var ob = o.getHitbox();
    return db.x < ob.x + ob.w && db.x + db.w > ob.x && db.y < ob.y + ob.h && db.y + db.h > ob.y;
  };
  
  DinoGame.prototype.draw = function() {
    var ctx = this.ctx;
    var W = this.W;
    var H = this.H;
    
    // 背景
    ctx.fillStyle = this.night ? '#111' : '#1a1a1a';
    ctx.fillRect(0, 0, W, H);
    
    // 地面
    ctx.strokeStyle = this.night ? '#555' : '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY + 2);
    ctx.lineTo(W, this.groundY + 2);
    ctx.stroke();
    
    ctx.fillStyle = this.night ? '#555' : '#444';
    var gx = ((this.groundX % 60) + 60) % 60;
    for(var x = gx - 60; x < W + 60; x += 60) {
      ctx.fillRect(x, this.groundY + 5, 8, 2);
      ctx.fillRect(x + 20, this.groundY + 8, 5, 2);
      ctx.fillRect(x + 40, this.groundY + 5, 10, 2);
      ctx.fillRect(x + 10, this.groundY + 12, 6, 2);
      ctx.fillRect(x + 35, this.groundY + 14, 8, 2);
    }
    
    // 障碍物
    for(var i = 0; i < this.obstacles.length; i++) {
      this.obstacles[i].draw(ctx, this.night);
    }
    
    // 恐龙
    this.dino.draw(ctx, this.night, this.frame);
    
    // 状态文字
    if(this.state === 'WAITING') {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(W/2 - 130, H/2 - 35, 260, 70);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🦕 准备好啦!', W/2, H/2 - 5);
      ctx.font = '14px Arial';
      ctx.fillText('按 空格 或 点击 开始', W/2, H/2 + 20);
    }
    
    if(this.state === 'GAMEOVER') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(W/2 - 120, H/2 - 50, 240, 100);
      ctx.fillStyle = '#e94560';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W/2, H/2 - 15);
      ctx.fillStyle = '#fff';
      ctx.font = '16px Arial';
      ctx.fillText('得分: ' + this.score + '  最高: ' + this.hi, W/2, H/2 + 15);
      ctx.font = '12px Arial';
      ctx.fillStyle = '#aaa';
      ctx.fillText('按 空格 或 点击 重新开始', W/2, H/2 + 40);
    }
  };
  
  DinoGame.prototype.playSound = function(type) {
    if(!this.sound) return;
    if(!this.ac) {
      try { this.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return; }
    }
    try {
      var o = this.ac.createOscillator();
      var g = this.ac.createGain();
      o.connect(g);
      g.connect(this.ac.destination);
      var n = this.ac.currentTime;
      
      switch(type) {
        case 'jump':
          o.type = 'square';
          o.frequency.setValueAtTime(440, n);
          o.frequency.exponentialRampToValueAtTime(880, n + 0.1);
          g.gain.setValueAtTime(0.1, n);
          g.gain.exponentialRampToValueAtTime(0.001, n + 0.15);
          o.start(n);
          o.stop(n + 0.15);
          break;
        case 'die':
          o.type = 'sawtooth';
          o.frequency.setValueAtTime(400, n);
          o.frequency.exponentialRampToValueAtTime(100, n + 0.4);
          g.gain.setValueAtTime(0.15, n);
          g.gain.exponentialRampToValueAtTime(0.001, n + 0.4);
          o.start(n);
          o.stop(n + 0.4);
          break;
        case 'score':
          o.type = 'sine';
          o.frequency.setValueAtTime(660, n);
          o.frequency.setValueAtTime(880, n + 0.1);
          g.gain.setValueAtTime(0.08, n);
          g.gain.exponentialRampToValueAtTime(0.001, n + 0.2);
          o.start(n);
          o.stop(n + 0.2);
          break;
        case 'start':
          o.type = 'sine';
          o.frequency.setValueAtTime(262, n);
          o.frequency.setValueAtTime(330, n + 0.08);
          o.frequency.setValueAtTime(392, n + 0.16);
          g.gain.setValueAtTime(0.1, n);
          g.gain.exponentialRampToValueAtTime(0.001, n + 0.25);
          o.start(n);
          o.stop(n + 0.25);
          break;
      }
    } catch(e) {}
  };
  
  // 恐龙类
  function Dino(groundY) {
    this.w = 44;
    this.h = 48;
    this.x = 80;
    this.groundY = groundY;
    this.y = groundY - this.h;
    this.vy = 0;
    this.jumping = false;
    this.ducking = false;
    this.dead = false;
    this.legFrame = 0;
    this.duckW = 58;
    this.duckH = 30;
  }
  
  Dino.prototype.reset = function(groundY) {
    this.groundY = groundY;
    this.y = groundY - this.h;
    this.vy = 0;
    this.jumping = false;
    this.ducking = false;
    this.dead = false;
  };
  
  Dino.prototype.jump = function() {
    if(!this.jumping && !this.ducking) {
      this.vy = -14;
      this.jumping = true;
      return true;
    }
    return false;
  };
  
  Dino.prototype.duck = function(on) {
    if(!this.jumping) {
      this.ducking = on;
      if(on) {
        this.h = this.duckH;
        this.w = this.duckW;
      } else {
        this.h = 48;
        this.w = 44;
      }
      this.y = this.groundY - this.h;
    }
  };
  
  Dino.prototype.update = function(dt) {
    if(this.jumping) {
      this.vy += 0.8 * dt;
      this.y += this.vy * dt;
      if(this.y >= this.groundY - this.h) {
        this.y = this.groundY - this.h;
        this.vy = 0;
        this.jumping = false;
      }
    }
    if(!this.dead) this.legFrame++;
  };
  
  Dino.prototype.getHitbox = function() {
    return {x: this.x + 5, y: this.y + 5, w: this.w - 10, h: this.h - 5};
  };
  
  Dino.prototype.draw = function(ctx, night, frame) {
    var bodyColor = night ? '#aaa' : '#535353';
    var eyeColor = '#fff';
    
    ctx.fillStyle = bodyColor;
    
    if(this.ducking) {
      // 蹲下形态 - 更圆润
      // 身体
      ctx.beginPath();
      ctx.ellipse(this.x + 25, this.y + 15, 25, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      // 头
      ctx.beginPath();
      ctx.ellipse(this.x + 45, this.y + 8, 12, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      // 嘴
      ctx.fillRect(this.x + 55, this.y + 10, 8, 4);
      // 眼睛
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(this.x + 48, this.y + 6, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(this.x + 49, this.y + 6, 2, 0, Math.PI * 2);
      ctx.fill();
      // 腿
      ctx.fillStyle = bodyColor;
      var legOffset = Math.floor(frame / 4) % 2 === 0 ? 0 : 4;
      ctx.fillRect(this.x + 15, this.y + 24 + legOffset, 6, 8 - legOffset);
      ctx.fillRect(this.x + 30, this.y + 24 + (legOffset ? 0 : 4), 6, 8 - (legOffset ? 0 : 4));
    } else {
      // 站立形态
      // 身体
      ctx.fillRect(this.x + 5, this.y + 20, 30, 20);
      // 头
      ctx.fillRect(this.x + 15, this.y, 25, 22);
      // 嘴
      ctx.fillRect(this.x + 38, this.y + 12, 10, 6);
      // 眼睛
      ctx.fillStyle = eyeColor;
      ctx.beginPath();
      ctx.arc(this.x + 30, this.y + 8, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(this.x + 31, this.y + 8, 2.5, 0, Math.PI * 2);
      ctx.fill();
      // 手臂
      ctx.fillStyle = bodyColor;
      ctx.fillRect(this.x + 32, this.y + 24, 8, 4);
      // 腿
      var legOffset = Math.floor(frame / 6) % 2 === 0;
      if(legOffset) {
        ctx.fillRect(this.x + 10, this.y + 40, 8, 12);
        ctx.fillRect(this.x + 25, this.y + 40, 8, 8);
      } else {
        ctx.fillRect(this.x + 10, this.y + 40, 8, 8);
        ctx.fillRect(this.x + 25, this.y + 40, 8, 12);
      }
      // 尾巴
      ctx.fillRect(this.x, this.y + 22, 8, 6);
      ctx.fillRect(this.x - 4, this.y + 18, 8, 8);
    }
    
    // 死亡效果
    if(this.dead) {
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(this.x + 25, this.y + 5);
      ctx.lineTo(this.x + 35, this.y + 15);
      ctx.moveTo(this.x + 35, this.y + 5);
      ctx.lineTo(this.x + 25, this.y + 15);
      ctx.stroke();
    }
  };
  
  // 仙人掌类
  function Cactus(x, groundY) {
    var types = [
      {w: 18, h: 45, arms: 1},
      {w: 22, h: 55, arms: 2},
      {w: 16, h: 35, arms: 0}
    ];
    var t = types[Math.floor(Math.random() * types.length)];
    this.w = t.w;
    this.h = t.h;
    this.arms = t.arms;
    this.x = x;
    this.y = groundY - this.h;
  }
  
  Cactus.prototype.update = function(dt, speed) {
    this.x -= speed * dt;
  };
  
  Cactus.prototype.getHitbox = function() {
    return {x: this.x + 2, y: this.y + 2, w: this.w - 4, h: this.h - 2};
  };
  
  Cactus.prototype.draw = function(ctx, night) {
    var color = night ? '#4a8a4a' : '#535353';
    ctx.fillStyle = color;
    
    // 主干
    ctx.fillRect(this.x + this.w * 0.3, this.y, this.w * 0.4, this.h);
    
    // 头顶圆形
    ctx.beginPath();
    ctx.arc(this.x + this.w * 0.5, this.y + 3, this.w * 0.2, 0, Math.PI * 2);
    ctx.fill();
    
    // 手臂
    if(this.arms >= 1) {
      ctx.fillRect(this.x, this.y + this.h * 0.3, this.w * 0.35, this.h * 0.25);
      ctx.fillRect(this.x, this.y + this.h * 0.15, this.w * 0.3, this.h * 0.2);
      ctx.beginPath();
      ctx.arc(this.x + this.w * 0.15, this.y + this.h * 0.15, this.w * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
    if(this.arms >= 2) {
      ctx.fillRect(this.x + this.w * 0.65, this.y + this.h * 0.4, this.w * 0.35, this.h * 0.25);
      ctx.fillRect(this.x + this.w * 0.7, this.y + this.h * 0.25, this.w * 0.3, this.h * 0.2);
      ctx.beginPath();
      ctx.arc(this.x + this.w * 0.85, this.y + this.h * 0.25, this.w * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  };
  
  // 翼龙类
  function Ptero(x, groundY) {
    this.w = 46;
    this.h = 30;
    this.x = x;
    var heights = [groundY - 80, groundY - 110, groundY - 140];
    this.y = heights[Math.floor(Math.random() * heights.length)];
    this.wingFrame = 0;
  }
  
  Ptero.prototype.update = function(dt, speed) {
    this.x -= speed * dt;
    this.wingFrame++;
  };
  
  Ptero.prototype.getHitbox = function() {
    return {x: this.x + 4, y: this.y + 4, w: this.w - 8, h: this.h - 8};
  };
  
  Ptero.prototype.draw = function(ctx, night) {
    var color = night ? '#888' : '#535353';
    ctx.fillStyle = color;
    
    var wf = Math.floor(this.wingFrame / 8) % 2;
    
    // 身体
    ctx.beginPath();
    ctx.ellipse(this.x + 23, this.y + 15, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 头
    ctx.beginPath();
    ctx.ellipse(this.x + 40, this.y + 12, 10, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // 嘴
    ctx.beginPath();
    ctx.moveTo(this.x + 48, this.y + 10);
    ctx.lineTo(this.x + 58, this.y + 14);
    ctx.lineTo(this.x + 48, this.y + 16);
    ctx.fill();
    
    // 眼睛
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(this.x + 42, this.y + 10, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.x + 43, this.y + 10, 1.5, 0, Math.PI * 2);
    ctx.fill();
    
    // 翅膀
    ctx.fillStyle = color;
    if(wf === 0) {
      ctx.beginPath();
      ctx.moveTo(this.x + 10, this.y + 12);
      ctx.lineTo(this.x - 5, this.y - 5);
      ctx.lineTo(this.x + 20, this.y + 8);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(this.x + 25, this.y + 12);
      ctx.lineTo(this.x + 10, this.y - 5);
      ctx.lineTo(this.x + 30, this.y + 8);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.moveTo(this.x + 10, this.y + 18);
      ctx.lineTo(this.x - 5, this.y + 30);
      ctx.lineTo(this.x + 20, this.y + 22);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(this.x + 25, this.y + 18);
      ctx.lineTo(this.x + 10, this.y + 30);
      ctx.lineTo(this.x + 30, this.y + 22);
      ctx.fill();
    }
  };
  
  // 启动
  if(document.body) {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})();
