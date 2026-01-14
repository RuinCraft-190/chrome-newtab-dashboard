---
description: 显示项目帮助信息
---

Chrome 新标签页仪表盘扩展 - 帮助文档

## 可用命令

| 命令 | 说明 |
|------|------|
| /dev | 启动开发服务器 |
| /build | 构建生产版本 |
| /adapter | 创建新的签到适配器 |
| /weather | 配置和风天气 API |
| /debug | 调试扩展 |
| /test | 测试签到功能 |
| /github | 推送到 GitHub |
| /icons | 创建扩展图标 |
| /publish | 发布到 Chrome Web Store |
| /lint | 代码检查和格式化 |

## 项目结构

```
chrome-newtab-dashboard/
├── public/           # 静态资源
├── src/
│   ├── background/   # Service Worker（后台服务）
│   ├── content/      # Content Scripts（页面注入脚本）
│   ├── newtab/       # 新标签页
│   ├── options/      # 设置页面
│   ├── popup/        # 弹出窗口
│   └── shared/       # 共享代码
└── .claude/skills/   # 项目命令
```

## 快速开始

1. 安装依赖：`npm install`
2. 配置 API：复制 `.env.example` 为 `.env` 并填入和风天气 API Key
3. 启动开发：`npm run dev`
4. 在 Chrome 中加载 `dist` 目录

## 常见问题

**Q: 天气不显示？**
A: 检查 API Key 是否正确配置

**Q: 签到不工作？**
A: 使用 `/test` 命令测试，检查选择器是否正确

**Q: 如何添加新网站？**
A: 使用 `/adapter` 命令创建新适配器

**Q: 构建失败？**
A: 使用 `/build` 命令查看详细错误信息

## 技术支持

- GitHub Issues: https://github.com/yourusername/chrome-newtab-dashboard/issues
- 文档: README.md
- 自定义适配器: src/content/adapters/custom/README.md
