// 天气相关类型
export interface WeatherData {
  temp: number
  feelsLike: number
  condition: string
  icon: string
  humidity: number
  windSpeed: number
  windDir: string
  pressure: number
  vis: number
  updateTime: string
}

export interface WeatherStorage {
  city: string
  cityId?: string
  lastUpdate: number
  data: WeatherData | null
}

// 签到相关类型
export interface CheckInResult {
  success: boolean
  alreadyChecked: boolean
  message?: string
  data?: any
}

export interface CheckInRecord {
  siteName: string
  siteUrl: string
  lastCheckIn: number
  streak: number
  successCount: number
  failCount: number
  lastError?: string
}

export interface SiteConfig {
  id: string
  name: string
  url: string
  enabled: boolean
  adapterType: 'pt' | 'generic' | 'custom'
  adapterConfig?: AdapterConfig
  schedule?: string
}

export interface AdapterConfig {
  urlPattern?: string
  selectors?: {
    loginButton?: string
    checkInButton?: string
    checkedIndicator?: string
  }
  waitTimes?: {
    afterPageLoad: number
    afterClick: number
  }
}

// 适配器接口
export interface SiteAdapter {
  name: string
  match(url: string): boolean
  checkLogin(): boolean | Promise<boolean>
  isCheckedIn(): boolean | Promise<boolean>
  doCheckIn(): Promise<CheckInResult>
  config?: AdapterConfig
}

// 存储数据类型
export interface StorageData {
  weather: WeatherStorage
  checkIn: {
    sites: SiteConfig[]
    records: Record<string, CheckInRecord>
    globalSettings: {
      defaultSchedule: string
      randomDelay: boolean
    }
  }
}
