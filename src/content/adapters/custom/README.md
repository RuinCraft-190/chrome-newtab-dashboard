# 自定义适配器开发指南

如果你想为特定网站开发自定义签到适配器，可以参考本指南。

## 创建自定义适配器

1. 在 `src/content/adapters/custom/` 目录下创建新文件，例如 `mysite.ts`

2. 继承 `BaseAdapter` 类并实现必要的方法：

```typescript
import { BaseAdapter } from '../base'
import { querySelectorSafe } from '../../utils/dom'
import { simulateClick, sleep } from '../../utils/click'
import type { CheckInResult } from '@shared/types'

export class MySiteAdapter extends BaseAdapter {
  name = '我的网站适配器'

  // 匹配 URL
  match(url: string): boolean {
    return /https?:\/\/example\.com\/.*/.test(url)
  }

  // 检查是否已登录
  async checkLogin(): boolean {
    const logoutButton = querySelectorSafe('.logout-button')
    return logoutButton !== null
  }

  // 检查是否已签到
  async isCheckedIn(): boolean {
    const checkedIndicator = querySelectorSafe('.checked-in')
    return checkedIndicator !== null
  }

  // 执行签到
  async doCheckIn(): Promise<CheckInResult> {
    const button = querySelectorSafe('#signin-button') as HTMLElement

    if (!button) {
      throw new Error('未找到签到按钮')
    }

    simulateClick(button)
    await sleep(2000)

    return {
      success: true,
      alreadyChecked: false,
      message: '签到完成'
    }
  }
}
```

3. 在 `src/content/adapters/registry.ts` 中注册你的适配器：

```typescript
import { MySiteAdapter } from './custom/mysite'

private registerBuiltInAdapters() {
  this.adapters.push(new PTSiteAdapter())
  this.adapters.push(new MySiteAdapter()) // 添加你的适配器
}
```

## 调试技巧

1. 打开目标网站
2. 按 F12 打开开发者工具
3. 在 Console 中查看 Content Script 的日志
4. 使用 DOM 检查器找到签到按钮的选择器

## 最佳实践

- 使用 `querySelectorSafe` 而不是直接 `querySelector`
- 使用 `simulateClick` 模拟真实点击
- 添加适当的延迟避免被检测
- 处理各种异常情况
