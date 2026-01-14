import type { SiteAdapter, CheckInResult, AdapterConfig } from '@shared/types'

export abstract class BaseAdapter implements SiteAdapter {
  abstract name: string
  abstract match(url: string): boolean
  abstract checkLogin(): boolean | Promise<boolean>
  abstract isCheckedIn(): boolean | Promise<boolean>
  abstract doCheckIn(): Promise<CheckInResult>

  config?: AdapterConfig

  async execute(): Promise<CheckInResult> {
    try {
      if (!await this.checkLogin()) {
        throw new Error('未登录，请先登录')
      }

      if (await this.isCheckedIn()) {
        return {
          success: true,
          alreadyChecked: true,
          message: '已经签到过了'
        }
      }

      return await this.doCheckIn()
    } catch (error: any) {
      return {
        success: false,
        alreadyChecked: false,
        message: error.message || '签到失败'
      }
    }
  }
}
