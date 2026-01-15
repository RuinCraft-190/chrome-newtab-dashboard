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
  locationId?: string
  lastUpdate: number
  data: WeatherData | null
}

export interface LocationData {
  locationId: string
  city: string
  latitude: number
  longitude: number
  lastUpdate: number
}

export interface CityInfo {
  id: string
  name: string
  adm1?: string
  adm2?: string
  country?: string
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

// 工作相关类型
export interface WorkSettings {
  monthlySalary: number          // 月薪（人民币）
  payday: number                 // 发薪日（1-31）
  workStartHour: number          // 上班时间（小时）
  workStartMinute: number        // 上班时间（分钟）
  workEndHour: number            // 下班时间（小时）
  workEndMinute: number          // 下班时间（分钟）
  workdays: number[]             // 工作日（0-6，0=周日，6=周六）
}

export interface WorkStats {
  timeUntilOffWork: string       // 距离下班时间
  earnedToday: number            // 今天已赚金额
  daysUntilPayday: number        // 距离发薪日天数
  daysUntilWeekend: number       // 距离休息日天数
}

// 天气设置类型
export interface WeatherSettings {
  locationId: string
  cityName: string
}

// 网页导航相关类型
export interface NavigationItem {
  id: string
  name: string
  url: string
  icon?: string
  createdAt: number
}

export interface NavigationStorage {
  items: NavigationItem[]
}

// 存储数据类型
export interface StorageData {
  weather: WeatherStorage
  weatherSettings: WeatherSettings
  checkIn: {
    sites: SiteConfig[]
    records: Record<string, CheckInRecord>
    globalSettings: {
      defaultSchedule: string
      randomDelay: boolean
    }
  }
  work: WorkSettings
  navigation: NavigationStorage
}
