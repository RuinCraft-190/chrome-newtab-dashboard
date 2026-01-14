import adapterRegistry from './adapters/registry'
import { MESSAGE_TYPES } from '@shared/constants'

console.log('Content script loaded')

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === MESSAGE_TYPES.CHECK_IN) {
    handleCheckIn(message)
      .then(result => sendResponse({ success: true, ...result }))
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

async function handleCheckIn(message: any) {
  const currentUrl = window.location.href

  const adapter = adapterRegistry.match(currentUrl)
  if (!adapter) {
    throw new Error('No adapter found for this site')
  }

  console.log(`Executing check-in with adapter: ${adapter.name}`)

  const result = await adapter.execute()

  if (result.success) {
    chrome.runtime.sendMessage({
      action: MESSAGE_TYPES.CHECKIN_SUCCESS,
      siteUrl: currentUrl,
      result
    })
  }

  return result
}

async function handleGetStatus() {
  const currentUrl = window.location.href
  const adapter = adapterRegistry.match(currentUrl)

  if (!adapter) {
    return {
      hasAdapter: false,
      canCheckIn: false
    }
  }

  const isLoggedIn = await adapter.checkLogin()
  const isCheckedIn = await adapter.isCheckedIn()

  return {
    hasAdapter: true,
    canCheckIn: true,
    adapterName: adapter.name,
    isLoggedIn,
    isCheckedIn
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'RELOAD_ADAPTERS') {
    adapterRegistry.reloadUserAdapters().then(() => {
      sendResponse({ success: true })
    })
    return true
  }
})
