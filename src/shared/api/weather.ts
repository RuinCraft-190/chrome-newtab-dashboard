import type { WeatherData } from '@shared/types'
import { QWEATHER_API_BASE, MESSAGE_TYPES } from '@shared/constants'

export type AuthType = 'apikey' | 'jwt'

export class QWeatherService {
  private apiKey: string
  private baseUrl: string
  private authType: AuthType
  private cachedToken: { token: string; expiresAt: number } | null = null

  constructor(config?: { apiKey?: string; authType?: AuthType }) {
    this.apiKey = config?.apiKey || import.meta.env.VITE_QWEATHER_API_KEY || ''
    this.baseUrl = QWEATHER_API_BASE
    this.authType = config?.authType || (this.apiKey ? 'apikey' : 'jwt')
  }

  /**
   * 获取认证头
   */
  private async getAuthHeader(): Promise<Record<string, string>> {
    console.log('[QWeatherService] authType:', this.authType)

    if (this.authType === 'jwt') {
      // 检查缓存的 token 是否有效
      if (this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
        console.log('[QWeatherService] Using cached token:', this.cachedToken.token.substring(0, 50) + '...')
        return { Authorization: this.cachedToken.token }
      }

      // 从 background 获取 JWT token
      console.log('[QWeatherService] Fetching token from background...')
      const token = await this.getJWTFromBackground()
      this.cachedToken = {
        token,
        expiresAt: Date.now() + 30 * 60 * 1000 // 30分钟后过期（提前5分钟刷新）
      }
      console.log('[QWeatherService] Got token:', token.substring(0, 50) + '...')
      return { Authorization: token }
    } else {
      return { 'X-QW-Api-Key': this.apiKey }
    }
  }

  /**
   * 从 background service worker 获取 JWT token
   */
  private async getJWTFromBackground(): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: MESSAGE_TYPES.GET_WEATHER },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
            return
          }

          if (response?.success) {
            resolve(response.token)
          } else {
            reject(new Error(response?.error || '获取 JWT token 失败'))
          }
        }
      )
    })
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
    this.authType = 'apikey'
  }

  setAuthType(authType: AuthType) {
    this.authType = authType
  }

  async getWeatherByLocation(location: string): Promise<WeatherData> {
    const authHeader = await this.getAuthHeader()

    console.log('[QWeatherService] authHeader:', authHeader)

    if (!authHeader.Authorization && !authHeader['X-QW-Api-Key']) {
      throw new Error('请先配置和风天气 API Key 或 JWT')
    }

    try {
      const url = new URL(`${this.baseUrl}/weather/now`)
      url.searchParams.set('location', location)

      console.log('[QWeatherService] Fetching:', url.toString())

      const response = await fetch(url.toString(), {
        headers: authHeader
      })

      if (!response.ok) {
        console.error('[QWeatherService] Response status:', response.status)
        console.error('[QWeatherService] Response headers:', [...response.headers.entries()])
        throw new Error(`Weather API request failed: ${response.status}`)
      }

      const result = await response.json()

      if (result.code !== '200') {
        throw new Error(`Weather API error: ${result.code}`)
      }

      const now = result.now
      return {
        temp: parseInt(now.temp),
        feelsLike: parseInt(now.feelsLike),
        condition: now.text,
        icon: now.icon,
        humidity: parseInt(now.humidity),
        windSpeed: parseInt(now.windSpeed),
        windDir: now.windDir,
        pressure: parseInt(now.pressure),
        vis: parseInt(now.vis),
        updateTime: result.updateTime
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error)
      throw error
    }
  }

  /**
   * 获取天气预报
   */
  async getForecast(location: string, days: number = 3): Promise<any> {
    const authHeader = await this.getAuthHeader()

    if (!authHeader.Authorization && !authHeader['X-QW-Api-Key']) {
      throw new Error('请先配置和风天气 API Key 或 JWT')
    }

    try {
      const url = new URL(`${this.baseUrl}/weather/${days}d`)
      url.searchParams.set('location', location)

      const response = await fetch(url.toString(), {
        headers: authHeader
      })

      if (!response.ok) {
        throw new Error(`Forecast API request failed: ${response.status}`)
      }

      const result = await response.json()

      if (result.code !== '200') {
        throw new Error(`Forecast API error: ${result.code}`)
      }

      return result.daily
    } catch (error) {
      console.error('Failed to fetch forecast:', error)
      throw error
    }
  }

  /**
   * 获取空气质量
   */
  async getAirQuality(location: string): Promise<any> {
    const authHeader = await this.getAuthHeader()

    if (!authHeader.Authorization && !authHeader['X-QW-Api-Key']) {
      throw new Error('请先配置和风天气 API Key 或 JWT')
    }

    try {
      const url = new URL(`${this.baseUrl}/air/now`)
      url.searchParams.set('location', location)

      const response = await fetch(url.toString(), {
        headers: authHeader
      })

      if (!response.ok) {
        throw new Error(`Air quality API request failed: ${response.status}`)
      }

      const result = await response.json()

      if (result.code !== '200') {
        throw new Error(`Air quality API error: ${result.code}`)
      }

      return result.now
    } catch (error) {
      console.error('Failed to fetch air quality:', error)
      throw error
    }
  }

  async searchCity(keyword: string): Promise<Array<{id: string, name: string}>> {
    const authHeader = await this.getAuthHeader()

    if (!authHeader.Authorization && !authHeader['X-QW-Api-Key']) {
      throw new Error('请先配置和风天气 API Key 或 JWT')
    }

    try {
      const url = new URL(`${this.baseUrl}/city/lookup`)
      url.searchParams.set('location', keyword)

      const response = await fetch(url.toString(), {
        headers: authHeader
      })

      if (!response.ok) {
        throw new Error(`City lookup failed: ${response.status}`)
      }

      const result = await response.json()

      if (result.code !== '200') {
        throw new Error(`City lookup error: ${result.code}`)
      }

      return (result.location || []).map((loc: any) => ({
        id: loc.id,
        name: loc.name
      }))
    } catch (error) {
      console.error('Failed to search city:', error)
      throw error
    }
  }
}

export default new QWeatherService()
