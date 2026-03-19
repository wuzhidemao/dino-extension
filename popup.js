// popup.js
const sizeMap = {
  small:      { width: 500,  height: 200 },
  medium:     { width: 700,  height: 260 },
  large:      { width: 900,  height: 320 },
  fullscreen: { width: 0,    height: 0   }
};

let selectedSize = 'medium';

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 恢复设置
  chrome.storage.local.get(['dinoSize', 'dinoDark', 'dinoSound'], (data) => {
    if (data.dinoSize) {
      selectedSize = data.dinoSize;
      document.querySelectorAll('.size-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.size === selectedSize);
      });
    }
    if (data.dinoDark !== undefined) {
      document.getElementById('darkMode').checked = data.dinoDark;
    }
    if (data.dinoSound !== undefined) {
      document.getElementById('soundOn').checked = data.dinoSound;
    }
  });

  // 尺寸按钮
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedSize = btn.dataset.size;
      document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chrome.storage.local.set({ dinoSize: selectedSize });
    });
  });

  // 设置按钮
  document.getElementById('darkMode').addEventListener('change', (e) => {
    chrome.storage.local.set({ dinoDark: e.target.checked });
  });
  
  document.getElementById('soundOn').addEventListener('change', (e) => {
    chrome.storage.local.set({ dinoSound: e.target.checked });
  });

  // 启动按钮
  document.getElementById('btnLaunch').addEventListener('click', () => {
    const dark = document.getElementById('darkMode').checked;
    const sound = document.getElementById('soundOn').checked;
    const size = sizeMap[selectedSize];
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'launchDino',
          dark: dark,
          sound: sound,
          width: size.width,
          height: size.height,
          fullscreen: selectedSize === 'fullscreen'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('发送消息失败:', chrome.runtime.lastError);
          }
        });
      }
      window.close();
    });
  });

  // 关闭所有按钮
  document.getElementById('btnCloseAll').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'closeAllDino' });
      }
      window.close();
    });
  });
});
