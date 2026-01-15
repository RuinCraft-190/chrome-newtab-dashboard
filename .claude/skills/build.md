---
description: 构建项目并处理可能出现的错误
---

请构建 Chrome 扩展项目并处理错误。

执行步骤：
1. 运行 `npm run build`
2. 构建成功后会自动在 `dist/` 目录内生成 `chrome-newtab-dashboard.zip`
3. 如果出现错误：
   - 分析错误信息
   - 检查 tsconfig.json 配置
   - 检查 vite.config.ts 配置
   - 检查依赖是否正确安装
4. 如果提示缺少类型定义，创建必要的声明文件
5. 修复错误后重新构建

**重要约定：**
- 打包文件必须输出到 `dist/chrome-newtab-dashboard.zip`
- 不要将 zip 文件输出到项目根目录

常见问题处理：
- `Cannot find module '@shared/...'`: 检查 vite.config.ts 中的 alias 配置
- `Property 'xxx' does not exist on type 'Window'`: 添加 Chrome 类型声明
- `error TS2307`: 检查模块路径是否正确
