import type { WeatherData } from '@shared/types'
import { QWEATHER_API_BASE } from '@shared/constants'

export class QWeatherService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_QWEATHER_API_KEY || ''
    this.baseUrl = QWEATHER_API_BASE
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  async getWeatherByLocation(location: string): Promise<WeatherData> {
    if (!this.apiKey) {
      throw new Error('请先配置和风天气 API Key')
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/weather/now?location=${encodeURIComponent(location)}&key=${this.apiKey}`
      )

      if (!response.ok) {
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

  async searchCity(keyword: string): Promise<any[]> {
    if (!this.apiKey) {
      throw new Error('请先配置和风天气 API Key')
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/city/lookup?location=${encodeURIComponent(keyword)}&key=${this.apiKey}`
      )

      if (!response.ok) {
        throw new Error(`City lookup failed: ${response.status}`)
      }

      const result = await response.json()

      if (result.code !== '200') {
        throw new Error(`City lookup error: ${result.code}`)
      }

      return result.location || []
    } catch (error) {
      console.error('Failed to search city:', error)
      throw error
    }
  }
}

export default new QWeatherService()
