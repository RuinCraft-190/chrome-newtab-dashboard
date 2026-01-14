import { BaseAdapter } from '../base'
import { querySelectorSafe } from '../../utils/dom'
import { simulateClick, sleep, randomDelay } from '../../utils/click'
import type { CheckInResult } from '@shared/types'

export class ExampleAdapter extends BaseAdapter {
  name = '示例网站适配器'

  match(url: string): boolean {
    return /https?:\/\/example\.com\/.*/.test(url)
  }

  async checkLogin(): Promise<boolean> {
    const userElement = querySelectorSafe('.user-name, .avatar, [class*="user"]')
    return userElement !== null
  }

  async isCheckedIn(): Promise<boolean> {
    const indicators = [
      '.checked-in',
      '.signed-in',
      '[data-checked="true"]',
      'button.signin[disabled]'
    ]

    return indicators.some(selector => querySelectorSafe(selector) !== null)
  }

  async doCheckIn(): Promise<CheckInResult> {
    const selectors = [
      'button.signin',
      'a[href*="signin"]',
      '#check-in-btn',
      '.attendance-btn'
    ]

    for (const selector of selectors) {
      const button = querySelectorSafe(selector) as HTMLElement
      if (button) {
        await randomDelay(500, 1500)
        simulateClick(button)
        await sleep(2000)

        return {
          success: true,
          alreadyChecked: false,
          message: '签到完成'
        }
      }
    }

    throw new Error('未找到签到按钮')
  }
}
