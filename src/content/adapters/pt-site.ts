import { BaseAdapter } from './base'
import { querySelectorSafe } from '../utils/dom'
import { simulateClick, sleep, randomDelay } from '../utils/click'
import type { CheckInResult } from '@shared/types'

export class PTSiteAdapter extends BaseAdapter {
  name = 'PT站通用适配器'

  match(url: string): boolean {
    const ptPatterns = [
      /https?:\/\/(tracker|pt|bits|hd|chd|hd-torrents|pass|torrent).*\.(com|org|net|me|io|co|site)/i,
      /https?:\/\/.*\.(tracker|pt|torrent)\./i
    ]
    return ptPatterns.some(pattern => pattern.test(url))
  }

  async checkLogin(): boolean {
    const loginIndicators = [
      '.username',
      '#user-info',
      '[class*="user"]',
      '[class*="member"]',
      '[id*="user"]'
    ]

    return loginIndicators.some(selector => {
      const element = querySelectorSafe(selector)
      return element !== null
    })
  }

  async isCheckedIn(): boolean {
    const checkedIndicators = [
      '.signedin',
      '.signed-in',
      '[class*="checked"]',
      '[class*="checked-in"]',
      'button[disabled][onclick*="signin"]',
      'a[href*="signin"][class*="done"]',
      '.attendance-done',
      '.checkin-done'
    ]

    return checkedIndicators.some(selector => {
      const element = querySelectorSafe(selector)
      return element !== null
    })
  }

  async doCheckIn(): Promise<CheckInResult> {
    const selectors = [
      'a[href*="signin"]',
      'a[href*="checkin"]',
      'a[href*="attendance"]',
      'button[onclick*="signin"]',
      'button[onclick*="checkin"]',
      '.signin-btn',
      '.checkin-btn',
      '#signin',
      '#checkin',
      'input[value*="签到"]',
      'input[type="submit"][value*="签到"]'
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
          message: `通过选择器 ${selector} 完成签到`
        }
      }
    }

    throw new Error('未找到签到按钮')
  }
}
