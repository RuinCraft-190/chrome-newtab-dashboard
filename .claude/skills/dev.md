---
description: 启动开发服务器并监听文件变化
---

启动 Vite 开发服务器用于 Chrome 扩展开发。

执行步骤：
1. 检查是否已安装依赖 (node_modules 是否存在)
2. 如果未安装，运行 `npm install`
3. 运行 `npm run dev` 启动开发服务器
4. 开发服务器会在 dist 目录生成构建文件
5. 在 Chrome 浏览器中：
   - 打开 chrome://extensions/
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目的 dist 目录

注意：
- 修改源代码后会自动重新构建
- 修改 manifest.json 或 background script 后需要在扩展管理页面点击刷新
- 修改 content script 后需要刷新目标网页
