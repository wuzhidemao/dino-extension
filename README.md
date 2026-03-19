# 🦕 Dino Game - Edge 浏览器插件

在任意网页插入完整的谷歌小恐龙游戏！

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🦕 完整游戏 | 跳跃、俯冲、仙人掌、翼龙全部原版元素 |
| 🌙 夜间模式 | 游戏内自动切换昼夜，支持手动切换明暗主题 |
| 🔊 音效 | 跳跃、得分、死亡音效，可开关 |
| 📏 多尺寸 | 小/中/大/全屏四种窗口尺寸可选 |
| 🖱️ 拖拽移动 | 拖动标题栏任意放置游戏窗口 |
| 📐 自由缩放 | 拖动边角调整窗口大小 |
| 💾 最高分记录 | 自动保存本地存储，跨页面持久 |
| ⌨️ 键盘控制 | 空格/↑ 跳跃，↓ 俯冲 |
| 👆 触屏支持 | 点击/触摸屏幕跳跃 |
| 📊 FPS显示 | 实时帧率监控 |
| 🎯 任意网页 | 在所有网页都能启动游戏 |

## 📸 截图

![Dino Game](https://raw.githubusercontent.com/wuzhidemao/dino-extension/refs/heads/main/%E6%88%AA%E5%9B%BE.jpg))

## 🚀 安装方法

### 方法一：从源码安装（推荐开发者）

1. 克隆本仓库：
   ```bash
   git clone https://github.com/wuzhidemao/dino-game-extension.git
   ```

2. 打开 Edge 浏览器，地址栏输入 `edge://extensions/`

3. 开启左下角 **「开发人员模式」**

4. 点击 **「加载解压缩的扩展」**

5. 选择克隆下来的 `dino-game-extension` 文件夹

### 方法二：打包安装

1. 下载 release 中的 `.zip` 文件

2. 解压到任意目录

3. 打开 `edge://extensions/`

4. 开启「开发人员模式」

5. 点击「加载解压缩的扩展」

6. 选择解压后的文件夹

## 🎮 操作说明

### 启动游戏

1. 点击浏览器工具栏的恐龙图标 🦕
2. 在弹出面板中选择窗口大小和主题
3. 点击「在当前页面启动游戏」

### 游戏控制

| 按键 | 功能 |
|------|------|
| `空格` / `↑` | 跳跃 |
| `↓` | 俯冲（躲避高处的翼龙） |
| 点击 / 触摸 | 跳跃 |

### 窗口操作

- **移动**：拖动标题栏
- **缩放**：拖动窗口边角
- **全屏**：点击标题栏绿色圆点
- **关闭**：点击红色圆点或按 `Esc`
- **切换主题**：点击 ☀️/🌙 按钮
- **开关音效**：点击 🔊/🔇 按钮

## 📁 项目结构

```
dino-game-extension/
├── manifest.json      # 插件配置文件
├── popup.html        # 弹窗界面
├── popup.js          # 弹窗逻辑
├── content.js        # 游戏核心引擎
├── content.css       # 游戏样式
├── icons/           # 图标资源
│   ├── icon16.svg
│   ├── icon48.svg
│   └── icon128.svg
└── README.md        # 本文件
```

## 🔧 技术栈

- Vanilla JavaScript（无依赖）
- HTML5 Canvas 渲染
- Web Audio API 音效
- Chrome Extension Manifest V3

## 📋 更新日志

### v1.0.0 (2026-03-19)
- 🎉 首次发布
- 完整的小恐龙游戏引擎
- 夜间模式、音效、多尺寸窗口
- 拖拽、缩放、全屏功能

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 自由使用、修改和分发
