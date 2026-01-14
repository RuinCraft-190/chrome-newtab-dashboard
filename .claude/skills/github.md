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
