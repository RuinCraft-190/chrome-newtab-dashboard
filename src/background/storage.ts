import type { SiteConfig, CheckInRecord, StorageData } from '@shared/types'
import { STORAGE_KEY } from '@shared/constants'

async function getStorageData(): Promise<StorageData> {
  return new Promise((resolve) => {
    chrome.storage.local.get(null, (result: any) => {
      resolve({
        weather: result.weather || { city: '北京', lastUpdate: 0, data: null },
        checkIn: result.checkIn || {
          sites: [],
          records: {},
          globalSettings: {
            defaultSchedule: '09:00',
            randomDelay: true
          }
        }
      })
    })
  })
}

async function setStorageData(data: Partial<StorageData>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(data, () => resolve())
  })
}

export async function getCheckInSites(): Promise<SiteConfig[]> {
  const data = await getStorageData()
  return data.checkIn.sites || []
}

export async function saveCheckInSites(sites: SiteConfig[]): Promise<void> {
  const data = await getStorageData()
  data.checkIn.sites = sites
  await setStorageData({ checkIn: data.checkIn })
}

export async function addCheckInSite(site: SiteConfig): Promise<void> {
  const sites = await getCheckInSites()
  sites.push(site)
  await saveCheckInSites(sites)
}

export async function removeCheckInSite(siteId: string): Promise<void> {
  const sites = await getCheckInSites()
  const filtered = sites.filter(s => s.id !== siteId)
  await saveCheckInSites(filtered)
}

export async function updateCheckInSite(siteId: string, updates: Partial<SiteConfig>): Promise<void> {
  const sites = await getCheckInSites()
  const index = sites.findIndex(s => s.id === siteId)

  if (index !== -1) {
    sites[index] = { ...sites[index], ...updates }
    await saveCheckInSites(sites)
  }
}

export async function getCheckInRecord(siteId: string): Promise<CheckInRecord | null> {
  const data = await getStorageData()
  return data.checkIn.records[siteId] || null
}

export async function getCheckInRecords(): Promise<Record<string, CheckInRecord>> {
  const data = await getStorageData()
  return data.checkIn.records || {}
}

export async function updateCheckInRecord(siteId: string, record: CheckInRecord): Promise<void> {
  const data = await getStorageData()
  data.checkIn.records[siteId] = record
  await setStorageData({ checkIn: data.checkIn })
}

export async function getGlobalSettings() {
  const data = await getStorageData()
  return data.checkIn.globalSettings
}

export async function updateGlobalSettings(settings: any): Promise<void> {
  const data = await getStorageData()
  data.checkIn.globalSettings = { ...data.checkIn.globalSettings, ...settings }
  await setStorageData({ checkIn: data.checkIn })
}
