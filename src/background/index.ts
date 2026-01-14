import { ALARM_NAME, MESSAGE_TYPES } from '@shared/constants'
import { setupAlarms } from './alarms'
import { getCheckInSites, updateCheckInRecord, getCheckInRecord } from './storage'
import { getQWeatherToken } from './weather'

console.log('Background Service Worker loaded')

setupAlarms()

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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

  if (message.action === MESSAGE_TYPES.GET_WEATHER) {
    handleGetWeatherToken()
      .then(result => sendResponse({ success: true, token: result }))
      .catch(error => sendResponse({ success: false, error: error.message }))
    return true
  }
})

/**
 * @param {Object} message
 * @param {string} message.siteUrl
 * @param {Object} message.result
 * @param {boolean} message.result.success
 * @param {boolean} [message.result.alreadyChecked]
 * @param {string} [message.result.message]
 */
async function handleCheckInSuccess(message: any) {
  const { siteUrl, result } = message

  const sites = await getCheckInSites()
  const site = sites.find(s => siteUrl.includes(s.url))

  if (!site) {
    console.error('Site not found for URL:', siteUrl)
    return
  }

  const existingRecord = await getCheckInRecord(site.id)

  /** @type {Object} */
  const record = {
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
  const records: Record<string, any> = {}

  for (const site of sites) {
    const record = await getCheckInRecord(site.id)
    if (record) {
      records[site.id] = record
    }
  }

  return { sites, records }
}

/**
 * @returns {Promise<string>}
 */
async function handleGetWeatherToken() {
  // 从 chrome.storage 中读取配置
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['qweatherApiId', 'qweatherPrivateKey'], (result) => {
      const { qweatherApiId, qweatherPrivateKey } = result

      if (!qweatherApiId || !qweatherPrivateKey) {
        reject(new Error('请先配置和风天气 API'))
        return
      }

      getQWeatherToken(qweatherApiId, qweatherPrivateKey)
        .then(resolve)
        .catch(reject)
    })
  })
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
