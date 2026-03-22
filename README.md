# 🦕 Dino Game - Edge 浏览器插件

在任意网页插入完整的谷歌小恐龙游戏！

![Version](https://img.shields.io/badge/version-1.0.2-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> 🎮 工作累了？随时在任意网页来一局经典的小恐龙跑酷游戏！

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🦕 **完整游戏** | 跳跃、俯冲、仙人掌、翼龙全部原版元素 |
| 🌙 **夜间模式** | 游戏内自动切换昼夜，支持手动切换明暗主题 |
| 🔊 **音效** | 跳跃、得分、死亡音效，可开关 |
| 📏 **多尺寸** | 小/中/大/全屏四种窗口尺寸可选 |
| 🖱️ **拖拽移动** | 拖动标题栏任意放置游戏窗口 |
| 📐 **自由缩放** | 拖动边角调整窗口大小 |
| 💾 **最高分记录** | 自动保存本地存储，跨页面持久 |
| ⌨️ **键盘控制** | 空格/↑ 跳跃，↓ 俯冲 |
| 👆 **触屏支持** | 点击/触摸屏幕跳跃 |
| 📊 **FPS显示** | 实时帧率监控 |
| 🎯 **任意网页** | 在所有网页都能启动游戏 |
| 🔒 **样式隔离** | Shadow DOM 隔离，不与页面样式冲突 |

## 📸 截图

![Dino Game](https://raw.githubusercontent.com/wuzhidemao/dino-extension/refs/heads/main/%E6%88%AA%E5%9B%BE.jpg)

## 🚀 安装方法

### 方法一：从 Release 安装（推荐）

1. 访问 [Releases 页面](https://github.com/wuzhidemao/dino-extension/releases) 下载最新版本
2. 解压下载的 ZIP 文件
3. 打开 Edge 浏览器，地址栏输入 `edge://extensions/`
4. 开启左下角 **「开发人员模式」**
5. 点击 **「加载解压缩的扩展」**
6. 选择解压后的文件夹

### 方法二：从源码安装

```bash
# 克隆仓库
git clone https://github.com/wuzhidemao/dino-extension.git

# 进入目录
cd dino-extension

# 然后按照方法一第 3-6 步操作
```

## 🎮 使用指南

### 启动游戏

1. 点击浏览器工具栏的 🦕 图标
2. 在弹出面板中选择：
   - **窗口大小**：小 / 中 / 大 / 全屏
   - **主题**：亮色 / 暗色
   - **音效**：开启 / 关闭
3. 点击「▶ 在当前页面启动游戏」

### 游戏控制

| 按键 | 功能 |
|------|------|
| `空格` / `↑` | 跳跃 |
| `↓` | 俯冲（躲避高处的翼龙） |
| 点击 / 触摸 | 跳跃 |

### 窗口操作

| 操作 | 说明 |
|------|------|
| 🔴 红色圆点 | 关闭窗口 |
| 🟡 黄色圆点 | 最小化窗口 |
| 🟢 绿色圆点 | 切换全屏 |
| 拖拽标题栏 | 移动窗口位置 |
| 拖拽边角 | 调整窗口大小 |
| ☀️/🌙 按钮 | 切换亮/暗主题 |
| 🔊/🔇 按钮 | 开关音效 |

## 📁 项目结构

```
dino-extension/
├── manifest.json          # 插件配置文件
├── popup.html             # 弹窗界面
├── popup.js               # 弹窗逻辑
├── content.js             # 游戏核心引擎（含内联CSS）
├── content.css            # 游戏样式（备用）
├── make-icons.js          # 图标生成脚本
├── icons/                 # 图标资源
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md              # 本文件
```

## 🔧 技术栈

- **Vanilla JavaScript** - 无依赖，原生 JS 实现
- **HTML5 Canvas** - 2D 渲染
- **Web Audio API** - 音效合成
- **Shadow DOM** - 样式隔离
- **Chrome Extension Manifest V3** - 扩展框架

## 🛠️ 开发说明

### 本地开发

1. 克隆仓库到本地
2. 在 Edge 中加载 `edge://extensions/` → 「加载解压缩的扩展」
3. 修改代码后，在扩展页面点击刷新按钮即可生效

### 构建图标

```bash
node make-icons.js
```

### 文件说明

- `content.js` - 核心游戏引擎，包含所有游戏逻辑和样式
- `popup.js` - 弹窗控制逻辑，处理用户设置
- `manifest.json` - 扩展配置，定义权限和入口

## 📋 更新日志

### v1.0.2 (2026-03-22)
- 🐛 修复图标加载问题（SVG → PNG）
- 📦 添加图标生成脚本 `make-icons.js`
- 📝 完善 README 文档

### v1.0.1 (2026-03-19)
- 🔒 使用 Shadow DOM 实现样式隔离
- 🛡️ 内联 CSS 绕过 CSP 限制
- 📜 添加 `host_permissions` 确保所有页面可用
- ⚠️ 增强 localStorage 容错处理

### v1.0.0 (2026-03-19)
- 🎉 首次发布
- 完整的小恐龙游戏引擎
- 夜间模式、音效、多尺寸窗口
- 拖拽、缩放、全屏功能

## ❓ 常见问题

### Q: 为什么某些网站无法使用？

**A:** 极少数网站可能因以下原因无法运行：
- 高级 CSP（内容安全策略）完全禁止内联脚本
- 网站对浏览器扩展做了检测和阻止
- 特殊渲染模式的页面（如 PDF 查看器）

**解决方法：** 尝试刷新页面或更换网站使用。

### Q: 游戏卡顿怎么办？

**A:** 
- 尝试缩小游戏窗口尺寸
- 关闭其他占用资源的标签页
- 检查浏览器是否有其他扩展冲突

### Q: 最高分没有保存？

**A:** 
- 确保浏览器允许扩展访问 localStorage
- 某些隐私模式下可能无法保存
- 尝试重新安装扩展

### Q: 如何卸载？

**A:**
1. 打开 `edge://extensions/`
2. 找到「Dino Game」插件
3. 点击「移除」

### Q: 支持其他浏览器吗？

**A:** 目前主要针对 Edge 优化，但基于 Manifest V3 开发，理论上支持 Chrome 等 Chromium 内核浏览器。

## 🗺️ 路线图

- [ ] 添加更多障碍物类型
- [ ] 支持自定义游戏速度
- [ ] 添加成就系统
- [ ] 支持导入/导出最高分
- [ ] 添加多人对战模式（考虑中）

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 提交 Issue
- 描述问题时请提供浏览器版本和复现步骤
- 如果是样式问题，请提供截图

### 提交 PR
1. Fork 本仓库
2. 创建你的分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

MIT License - 自由使用、修改和分发

详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 灵感来源于 Chrome 离线时的小恐龙游戏
- 感谢所有测试和反馈的用户

---

Made with ❤️ by [眠](https://github.com/wuzhidemao)

如果这个项目帮到了你，请给个 ⭐ Star 支持一下！
