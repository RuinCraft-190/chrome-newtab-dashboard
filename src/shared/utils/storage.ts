import type { StorageData } from '@shared/types'
import { STORAGE_KEY } from '@shared/constants'

export class StorageHelper {
  async get(key: keyof StorageData): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.local.get(STORAGE_KEY[key.toUpperCase() as keyof typeof STORAGE_KEY], (result) => {
        resolve(result[STORAGE_KEY[key.toUpperCase() as keyof typeof STORAGE_KEY]])
      })
    })
  }

  async set(key: keyof StorageData, value: any): Promise<void> {
    return new Promise((resolve) => {
      const storageKey = STORAGE_KEY[key.toUpperCase() as keyof typeof STORAGE_KEY]
      chrome.storage.local.set({ [storageKey]: value }, () => resolve())
    })
  }

  async getAll(): Promise<StorageData> {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (result) => {
        resolve({
          weather: result.weather || { city: '北京', lastUpdate: 0, data: null },
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
          }
        })
      })
    })
  }
}

export default new StorageHelper()
