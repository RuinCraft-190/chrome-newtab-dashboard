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

const weatherService = new QWeatherService()

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
    const now = Date.now()
    const oneHour = 60 * 60 * 1000

    if (weatherData && weatherData.data && (now - weatherData.lastUpdate) < oneHour) {
      weather.value = weatherData.data
      cityName.value = weatherData.city || '北京'
    } else {
      const city = weatherData?.city || '北京'
      const data = await weatherService.getWeatherByLocation(city)

      await storageHelper.set('weather', {
        city,
        lastUpdate: now,
        data
      })

      weather.value = data
      cityName.value = city
    }
  } catch (err: any) {
    error.value = err.message || '获取天气失败'
    console.error('Failed to load weather:', err)
  } finally {
    loading.value = false
  }
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
  font-weight: 600;
  color: #667eea;
}
</style>
