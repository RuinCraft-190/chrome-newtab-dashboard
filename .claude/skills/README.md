# Chrome 新标签页仪表盘 - Skills

本项目包含专属的命令技能（Skills），用于快速执行常见开发任务。

> **重要**: Claude Code 会自动遵循 `.claude/PROJECT_CONTEXT.md` 中定义的规范，在执行相关操作前会自动读取对应的 skill 文件。

## 可用命令

| 命令 | 描述 |
|------|------|
| `/dev` | 启动开发服务器 |
| `/build` | 构建项目并处理错误 |
| `/adapter` | 创建新的签到适配器 |
| `/weather` | 配置和风天气 API |
| `/debug` | 调试 Chrome 扩展 |
| `/test` | 测试签到功能 |
| `/github` | 推送到 GitHub |
| `/icons` | 创建扩展图标 |
| `/publish` | 发布到 Chrome Web Store |
| `/lint` | 代码检查和格式化 |
| `/help` | 显示帮助信息 |

## 使用方法

在 Claude Code 中直接输入命令，例如：
- `/dev` - 启动开发模式
- `/adapter "我的网站" "https://example.com" "#signin"` - 创建适配器
- `/test` - 测试签到功能

## 文件说明

| 文件 | 用途 |
|------|------|
| [build.md](build.md) | 构建项目并修复错误 |
| [dev.md](dev.md) | 启动开发服务器 |
| [adapter.md](adapter.md) | 创建签到适配器 |
| [weather.md](weather.md) | 配置天气 API |
| [debug.md](debug.md) | 调试指南 |
| [test.md](test.md) | 测试签到功能 |
| [github.md](github.md) | 推送到 GitHub |
| [icons.md](icons.md) | 创建图标 |
| [publish.md](publish.md) | 发布到商店 |
| [lint.md](lint.md) | 代码检查 |
| [help.md](help.md) | 帮助文档 |

## 扩展命令

要添加新命令，在 `.claude/skills/` 目录下创建新的 `.md` 文件，文件格式：

```markdown
---
description: 命令的简短描述
---

命令的详细执行步骤和说明...
```
