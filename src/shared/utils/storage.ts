import type { StorageData } from '@shared/types'
import { STORAGE_KEY } from '@shared/constants'

export class StorageHelper {
  async get(key: keyof StorageData): Promise<any> {
    return new Promise((resolve) => {
      // 直接使用 key 作为存储键，不通过 STORAGE_KEY 映射
      chrome.storage.local.get(key, (result) => {
        resolve(result[key])
      })
    })
  }

  async set(key: keyof StorageData, value: any): Promise<void> {
    return new Promise((resolve) => {
      // 直接使用 key 作为存储键，不通过 STORAGE_KEY 映射
      chrome.storage.local.set({ [key]: value }, () => resolve())
    })
  }

  async getAll(): Promise<StorageData> {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (result) => {
        resolve({
          weather: result.weather || { city: '北京', lastUpdate: 0, data: null },
          weatherSettings: result.weatherSettings || { locationId: '101010100', cityName: '北京' },
          checkIn: result.checkin || {
            sites: [],
            records: {},
            globalSettings: {
              defaultSchedule: '09:00',
              randomDelay: true
            }
          },
          work: result.work || {
            monthlySalary: 10000,
            payday: 15,
            workStartHour: 9,
            workStartMinute: 0,
            workEndHour: 18,
            workEndMinute: 0,
            workdays: [1, 2, 3, 4, 5]
          },
          navigation: result.navigation || { items: [] }
        })
      })
    })
  }
}

export default new StorageHelper()
