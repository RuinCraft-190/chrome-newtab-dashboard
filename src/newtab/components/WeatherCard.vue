<template>
  <div class="card">
    <div class="card-header">
      <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2">
        <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        <circle cx="12" cy="12" r="4" />
      </svg>
      <h2 class="card-title">天气</h2>
    </div>

    <div v-if="loading" class="loading">
      加载中...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else-if="weather" class="weather-content">
      <div class="weather-main">
        <div class="temperature">
          <span class="temp-value">{{ weather.temp }}</span>
          <span class="temp-unit">°C</span>
        </div>
        <div class="condition">
          <img :src="weatherIconUrl" :alt="weather.condition" class="weather-icon" />
          <span>{{ weather.condition }}</span>
        </div>
      </div>

      <div class="weather-details">
        <div class="detail-item">
          <span class="detail-label">体感</span>
          <span class="detail-value">{{ weather.feelsLike }}°C</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">湿度</span>
          <span class="detail-value">{{ weather.humidity }}%</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">风速</span>
          <span class="detail-value">{{ weather.windSpeed }} km/h {{ weather.windDir }}</span>
        </div>
      </div>

      <div class="weather-footer">
        <span class="city-name">{{ cityName }}</span>
        <span class="update-time">{{ formattedUpdateTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { QWeatherService } from '@shared/api/weather'
import storageHelper from '@shared/utils/storage'
import type { WeatherData } from '@shared/types'

const weather = ref<WeatherData | null>(null)
const loading = ref(true)
const error = ref('')
const cityName = ref('')

const weatherService = new QWeatherService({ authType: 'jwt' })

const weatherIconUrl = computed(() => {
  if (!weather.value) return ''
  return `https://icons.qweather.com/assets/icons/${weather.value.icon}.svg`
})

const formattedUpdateTime = computed(() => {
  if (!weather.value) return ''
  const date = new Date(weather.value.updateTime)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
})

async function loadWeather() {
  try {
    loading.value = true
    error.value = ''

    const weatherData = await storageHelper.get('weather')
    const locationData = await storageHelper.get('location')
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    const fiveHours = 5 * oneHour

    // 优先使用缓存的位置（5小时有效）
    let locationId = weatherData?.locationId
    let cityDisplayName = weatherData?.city || '北京'

    // 如果没有缓存的位置或超过5小时，尝试获取新位置
    if (!locationId || !locationData || (now - locationData.lastUpdate) > fiveHours) {
      try {
        const position = await getCurrentPosition(fiveHours)
        const { latitude, longitude } = position.coords

        // 使用和风天气的城市查询 API 通过经纬度获取城市ID
        // 和风天气 GeoAPI 支持经纬度查询
        const locationStr = `${longitude.toFixed(2)},${latitude.toFixed(2)}`
        const cities = await weatherService.searchCity(locationStr)

        if (cities && cities.length > 0) {
          locationId = cities[0].id
          cityDisplayName = cities[0].name

          // 缓存位置信息
          await storageHelper.set('location', {
            locationId,
            city: cityDisplayName,
            latitude,
            longitude,
            lastUpdate: now
          })

          console.log('定位成功:', cityDisplayName, locationId)
        }
      } catch (locError) {
        console.log('定位失败，使用默认城市:', locError)
      }
    }

    // 检查天气缓存（1小时有效）
    if (weatherData && weatherData.data && (now - weatherData.lastUpdate) < oneHour) {
      weather.value = weatherData.data
      cityName.value = cityDisplayName
    } else {
      // 使用城市ID获取天气
      const location = locationId || '101010100' // 默认北京
      const data = await weatherService.getWeatherByLocation(location)

      // 保存天气数据
      await storageHelper.set('weather', {
        city: cityDisplayName,
        locationId: location,
        lastUpdate: now,
        data
      })

      weather.value = data
      cityName.value = cityDisplayName
    }
  } catch (err: any) {
    error.value = err.message || '获取天气失败'
    console.error('Failed to load weather:', err)
  } finally {
    loading.value = false
  }
}

function getCurrentPosition(maxAge: number): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持定位'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: maxAge * 1000
      }
    )
  })
}

onMounted(() => {
  loadWeather()
})
</script>

<style scoped>
.weather-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.weather-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.temperature {
  display: flex;
  align-items: flex-start;
}

.temp-value {
  font-size: 3rem;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
}

.temp-unit {
  font-size: 1.5rem;
  color: #666;
  margin-left: 4px;
}

.condition {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.weather-icon {
  width: 64px;
  height: 64px;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.detail-label {
  font-size: 0.875rem;
  color: #666;
}

.detail-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
}

.weather-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: #666;
}

.city-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #667eea;
}
</style>
