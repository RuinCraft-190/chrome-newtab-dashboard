import { ALARM_NAME, MESSAGE_TYPES } from '@shared/constants'
import type { SiteConfig, CheckInRecord } from '@shared/types'
import { setupAlarms } from './alarms'
import { getCheckInSites, updateCheckInRecord, getCheckInRecord } from './storage'

console.log('Background Service Worker loaded')

setupAlarms()

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === MESSAGE_TYPES.CHECKIN_SUCCESS) {
    handleCheckInSuccess(message)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }))
    return true
  }

  if (message.action === MESSAGE_TYPES.GET_CHECKIN_STATUS) {
    handleGetStatus()
      .then(result => sendResponse({ success: true, ...result }))
      .catch(error => sendResponse({ success: false, error: error.message }))
    return true
  }
})

async function handleCheckInSuccess(message: any) {
  const { siteUrl, result } = message

  const sites = await getCheckInSites()
  const site = sites.find(s => siteUrl.includes(s.url))

  if (!site) {
    console.error('Site not found for URL:', siteUrl)
    return
  }

  const existingRecord = await getCheckInRecord(site.id)

  const record: CheckInRecord = {
    siteName: site.name,
    siteUrl: site.url,
    lastCheckIn: Date.now(),
    streak: result.alreadyChecked ? (existingRecord?.streak || 0) : (existingRecord?.streak || 0) + 1,
    successCount: (existingRecord?.successCount || 0) + (result.success ? 1 : 0),
    failCount: existingRecord?.failCount || 0,
    lastError: result.success ? undefined : result.message
  }

  await updateCheckInRecord(site.id, record)

  console.log(`Check-in recorded for ${site.name}:`, record)
}

async function handleGetStatus() {
  const sites = await getCheckInSites()
  const records: Record<string, CheckInRecord> = {}

  for (const site of sites) {
    const record = await getCheckInRecord(site.id)
    if (record) {
      records[site.id] = record
    }
  }

  return { sites, records }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated')

  chrome.alarms.create(ALARM_NAME.DAILY_CHECKIN, {
    periodInMinutes: 1440
  })
})

chrome.runtime.onStartup.addListener(() => {
  console.log('Browser started, extension loaded')
})
