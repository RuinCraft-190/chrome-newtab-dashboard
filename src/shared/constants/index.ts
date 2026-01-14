export const QWEATHER_API_BASE = 'https://kt487t53tq.re.qweatherapi.com/v7'

export const DEFAULT_CITY = '北京'

export const STORAGE_KEY = {
  WEATHER: 'weather',
  CHECKIN: 'checkin',
  WORK: 'work'
} as const

export const MESSAGE_TYPES = {
  CHECK_IN: 'CHECK_IN',
  GET_CHECKIN_STATUS: 'GET_CHECKIN_STATUS',
  CHECKIN_SUCCESS: 'CHECKIN_SUCCESS',
  CHECKIN_ERROR: 'CHECKIN_ERROR',
  GET_WEATHER: 'GET_WEATHER'
} as const

export const ALARM_NAME = {
  DAILY_CHECKIN: 'dailyCheckIn'
} as const
