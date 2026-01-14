---
description: 创建新的签到适配器
---

为特定网站创建自定义签到适配器。

使用方法：/adapter "网站名称" "URL模式" "签到按钮选择器"

执行步骤：
1. 在 src/content/adapters/custom/ 目录创建新文件
2. 继承 BaseAdapter 类
3. 实现必要方法：
   - match(url: string): 匹配目标 URL
   - checkLogin(): 检查是否已登录
   - isCheckedIn(): 检查是否已签到
   - doCheckIn(): 执行签到操作
4. 在 registry.ts 中注册新适配器
5. 更新自定义适配器文档

示例适配器结构：
```typescript
import { BaseAdapter } from '../base'
import { querySelectorSafe } from '../../utils/dom'
import { simulateClick, sleep } from '../../utils/click'

export class MySiteAdapter extends BaseAdapter {
  name = '我的网站'

  match(url: string): boolean {
    return /https?:\/\/example\.com/.test(url)
  }

  async checkLogin(): boolean {
    return querySelectorSafe('.user-info') !== null
  }

  async isCheckedIn(): boolean {
    return querySelectorSafe('.checked-in') !== null
  }

  async doCheckIn(): Promise<CheckInResult> {
    const button = querySelectorSafe('#signin') as HTMLElement
    if (!button) throw new Error('未找到签到按钮')

    simulateClick(button)
    await sleep(2000)

    return { success: true, alreadyChecked: false, message: '签到完成' }
  }
}
```
