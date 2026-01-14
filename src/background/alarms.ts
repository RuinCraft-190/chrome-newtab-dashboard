import { ALARM_NAME, MESSAGE_TYPES } from '@shared/constants'
import type { SiteConfig } from '@shared/types'
import { getCheckInSites } from './storage'

export function setupAlarms() {
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAME.DAILY_CHECKIN) {
      await performDailyCheckIn()
    }
  })
}

async function performDailyCheckIn() {
  console.log('Starting daily check-in...')

  try {
    const sites = await getCheckInSites()
    const enabledSites = sites.filter((s: SiteConfig) => s.enabled)

    console.log(`Found ${enabledSites.length} sites to check in`)

    for (const site of enabledSites) {
      await performSiteCheckIn(site)
    }

    console.log('Daily check-in completed')
  } catch (error) {
    console.error('Error during daily check-in:', error)
  }
}

async function performSiteCheckIn(site: SiteConfig) {
  try {
    const randomDelay = Math.floor(Math.random() * 30 * 60 * 1000)

    setTimeout(async () => {
      const tab = await chrome.tabs.create({ url: site.url })

      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener)

          setTimeout(() => {
            chrome.tabs.sendMessage(tabId, {
              action: MESSAGE_TYPES.CHECK_IN,
              siteId: site.id
            })
          }, 2000)
        }
      })
    }, randomDelay)
  } catch (error) {
    console.error(`Error checking in ${site.name}:`, error)
  }
}
