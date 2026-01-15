---
description: 将项目推送到 GitHub
---

将项目推送到 GitHub 仓库。

执行步骤：
1. 确保项目已初始化 Git 仓库
2. 在 GitHub 创建新仓库（如果还没有）
3. 添加远程仓库：
   ```bash
   git remote add origin https://github.com/username/chrome-newtab-dashboard.git
   ```
4. 推送代码：
   ```bash
   git push -u origin master
   ```

完整发布流程：
1. 确保代码已提交
2. 创建 .gitignore（已创建）
3. 创建 LICENSE（已创建 MIT）
4. 创建 README.md（已创建）
5. 推送到 GitHub

GitHub 仓库设置建议：
- 描述: Vue3 + TypeScript Chrome 新标签页仪表盘扩展
- 标签: chrome-extension, vue, typescript, newtab, weather, checkin
- 许可证: MIT

README.md 应包含：
- 项目简介
- 功能特性
- 安装步骤
- 使用说明
- 技术栈
- 贡献指南
- 许可证信息

## Git 提交规范

**重要：每次提交到 GitHub 时必须遵循以下规则：**

### 提交前
1. 先同步最新代码：
   ```bash
   git pull origin main
   ```

### 提交时
1. 提交信息格式（不含 Co-Authored-By）：
   ```bash
   git commit -m "类型: 简短描述

   详细说明（可选）"
   ```

2. 提交类型（使用 Conventional Commits 规范）：
   - `feat:` 新功能
   - `fix:` 修复问题
   - `docs:` 文档更新
   - `style:` 代码格式调整
   - `refactor:` 代码重构
   - `perf:` 性能优化
   - `test:` 测试相关
   - `chore:` 构建/工具更新

3. **禁止**在提交信息中包含 `Co-Authored-By: Claude` 或类似的署名

### 提交后
1. 推送到远程：
   ```bash
   git push origin main
   ```

### 示例
```bash
# 正确的提交流程
git pull origin main
git add .
git commit -m "feat: 添加城市搜索功能"
git push origin main
```
