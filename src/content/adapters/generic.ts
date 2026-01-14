import { BaseAdapter } from './base'
import { querySelectorSafe } from '../utils/dom'
import { simulateClick, sleep, randomDelay } from '../utils/click'
import type { CheckInResult, AdapterConfig } from '@shared/types'

export class GenericAdapter extends BaseAdapter {
  name = '通用按钮适配器'

  constructor(public config: AdapterConfig) {
    super()
  }

  match(url: string): boolean {
    if (!this.config.urlPattern) {
      return false
    }
    try {
      const pattern = new RegExp(this.config.urlPattern, 'i')
      return pattern.test(url)
    } catch {
      return false
    }
  }

  async checkLogin(): Promise<boolean> {
    if (this.config.selectors?.loginButton) {
      const loginButton = querySelectorSafe(this.config.selectors.loginButton)
      return loginButton === null
    }
    return true
  }

  async isCheckedIn(): Promise<boolean> {
    if (this.config.selectors?.checkedIndicator) {
      const indicator = querySelectorSafe(this.config.selectors.checkedIndicator)
      return indicator !== null
    }
    return false
  }

  async doCheckIn(): Promise<CheckInResult> {
    const selector = this.config.selectors?.checkInButton

    if (!selector) {
      throw new Error('未配置签到按钮选择器')
    }

    const button = querySelectorSafe(selector) as HTMLElement
    if (!button) {
      throw new Error(`未找到签到按钮: ${selector}`)
    }

    const afterClickDelay = this.config.waitTimes?.afterClick || 2000
    await randomDelay(500, 1500)
    simulateClick(button)
    await sleep(afterClickDelay)

    return {
      success: true,
      alreadyChecked: false,
      message: '签到完成'
    }
  }
}
