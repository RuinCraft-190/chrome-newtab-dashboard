
# Chrome NewTab Dashboard - 项目约定

## 必须遵循的规则

在执行任何操作前，必须先检查 `.claude/skills/` 中是否有相关的规范文件。

### 操作映射表

| 用户操作 | 必须先读取的 Skill 文件 |
|---------|----------------------|
| `npm run build` 或构建相关 | `.claude/skills/build.md` |
| `npm run dev` 或开发服务器 | `.claude/skills/dev.md` |
| Git 提交、推送相关 | `.claude/skills/github.md` |
| 发布、打包相关 | `.claude/skills/publish.md` |
| 代码检查、格式化 | `.claude/skills/lint.md` |
| 调试相关 | `.claude/skills/debug.md` |
| 测试相关 | `.claude/skills/test.md` |
| 天气功能相关 | `.claude/skills/weather.md` |
| 适配器相关 | `.claude/skills/adapter.md` |
| 图标相关 | `.claude/skills/icons.md` |

### 执行流程

1. 用户发起操作
2. **先读取对应的 skill 文件**
3. 按照 skill 文件中的规范执行
4. 如有不明确的地方，询问用户

### 项目结构约定

- 打包文件输出位置：`dist/` 目录内（不是项目根目录）
- Git 提交必须遵循 Conventional Commits 规范
- 提交信息中**禁止**包含 `Co-Authored-By: Claude`

### 自动触发规则

以下场景自动触发 skill 检查：
- 用户执行 `npm run build` → 自动应用 `build.md` 规范
- 用户提到 "git commit" 或 "git push" → 自动应用 `github.md` 规范
- 用户提到 "发布" 或 "打包" → 自动应用 `publish.md` 规范
- 用户提到 "lint" 或 "格式化" → 自动应用 `lint.md` 规范
