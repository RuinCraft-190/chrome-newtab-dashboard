---
description: 代码检查和格式化
---

运行 ESLint 和 Prettier 进行代码检查和格式化。

检查代码：
```bash
npm run lint
```

自动修复：
```bash
npm run lint:fix
```

格式化代码：
```bash
npm run format
```

常见问题处理：

1. 缺少分号：
   - ESLint 会自动添加或根据配置决定

2. 未使用的变量：
   - 删除未使用的导入和变量
   - 或在变量名前加 `_` 表示有意不使用

3. 类型错误：
   - 确保所有类型都正确导入
   - 检查 shared/types/index.ts

4. Vue 模板错误：
   - 检查 v-model 绑定
   - 检查事件处理器
   - 确保所有组件正确导入

添加新的 ESLint 规则：
编辑 .eslintrc.js（如果需要创建）：
```javascript
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/typescript/recommended'
  ],
  rules: {
    // 自定义规则
    'vue/multi-word-component-names': 'off'
  }
}
```
