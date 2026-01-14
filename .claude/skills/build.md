---
description: 构建项目并处理可能出现的错误
---

请构建 Chrome 扩展项目并处理错误。

执行步骤：
1. 运行 `npm run build`
2. 如果出现错误：
   - 分析错误信息
   - 检查 tsconfig.json 配置
   - 检查 vite.config.ts 配置
   - 检查依赖是否正确安装
3. 如果提示缺少类型定义，创建必要的声明文件
4. 修复错误后重新构建

常见问题处理：
- `Cannot find module '@shared/...'`: 检查 vite.config.ts 中的 alias 配置
- `Property 'xxx' does not exist on type 'Window'`: 添加 Chrome 类型声明
- `error TS2307`: 检查模块路径是否正确
