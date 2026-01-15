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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { QWeatherService } from '@shared/api/weather'
import storageHelper from '@shared/utils/storage'
import type { WeatherData } from '@shared/types'

const weather = ref<WeatherData | null>(null)
const loading = ref(true)
const error = ref('')
const cityName = ref('')

const weatherService = new QWeatherService({ authType: 'jwt' })

// 天气缓存：2小时有效
const CACHE_DURATION = 2 * 60 * 60 * 1000 // 2小时
// 刷新限制：在缓存期最后10分钟内才允许刷新
const REFRESH_COOLDOWN = 10 * 60 * 1000 // 10分钟
let cachedData: { data: WeatherData; locationId: string; city: string; timestamp: number } | null = null

const weatherIconUrl = computed(() => {
  if (!weather.value) return ''
  return `https://icons.qweather.com/assets/icons/${weather.value.icon}.svg`
})

const formattedUpdateTime = computed(() => {
  if (!weather.value) return ''
  const date = new Date(weather.value.updateTime)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
})

// 检查是否可以刷新天气
function canRefreshWeather(): boolean {
  if (!cachedData) return true

  const now = Date.now()
  const elapsed = now - cachedData.timestamp
  const remaining = CACHE_DURATION - elapsed

  // 只有在缓存期剩余10分钟以内时才允许刷新
  return remaining <= REFRESH_COOLDOWN
}

// 获取距离可刷新的剩余时间（分钟）
function getRefreshCooldownMinutes(): number {
  if (!cachedData) return 0

  const now = Date.now()
  const elapsed = now - cachedData.timestamp
  const remaining = CACHE_DURATION - elapsed
  const cooldownRemaining = remaining - REFRESH_COOLDOWN

  return Math.max(0, Math.ceil(cooldownRemaining / 60000))
}

async function loadWeather(forceRefresh = false) {
  try {
    loading.value = true
    error.value = ''

    const now = Date.now()

    // 检查缓存是否有效（除非强制刷新）
    if (!forceRefresh && cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      console.log('使用缓存的天气数据')
      weather.value = cachedData.data
      cityName.value = cachedData.city
      loading.value = false
      return
    }

    // 从存储中获取用户设置的城市
    const settings = await storageHelper.get('weatherSettings')
    const locationId = settings?.locationId || '101010100' // 默认北京
    const defaultCityName = settings?.cityName || '北京'

    console.log('使用城市ID查询天气:', locationId)

    const data = await weatherService.getWeatherByLocation(locationId)
    cityName.value = defaultCityName

    // 更新缓存
    cachedData = {
      data,
      locationId,
      city: cityName.value,
      timestamp: now
    }

    weather.value = data
  } catch (err: any) {
    error.value = err.message || '获取天气失败'
    console.error('Failed to load weather:', err)
  } finally {
    loading.value = false
  }
}

// 刷新天气（带时间限制检查）
function refreshWeather() {
  if (!canRefreshWeather()) {
    const minutes = getRefreshCooldownMinutes()
    alert(`刷新过于频繁，请等待 ${minutes} 分钟后再试`)
    return
  }

  // 清除缓存并重新加载
  cachedData = null
  loadWeather(true)
}

onMounted(() => {
  loadWeather()

  // 监听存储变化，当天气设置更新时重新加载
  const storageListener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
    if (areaName === 'local' && changes.weatherSettings) {
      console.log('检测到天气设置变化，重新加载天气')
      // 清除缓存以强制重新获取
      cachedData = null
      loadWeather()
    }
  }

  chrome.storage.onChanged.addListener(storageListener)

  // 监听来自父组件的刷新事件
  const refreshHandler = () => {
    refreshWeather()
  }
  window.addEventListener('refresh-weather', refreshHandler)

  // 组件卸载时移除监听器
  onBeforeUnmount(() => {
    chrome.storage.onChanged.removeListener(storageListener)
    window.removeEventListener('refresh-weather', refreshHandler)
  })
})

// 暴露方法供父组件调用
defineExpose({
  refreshWeather,
  canRefreshWeather
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
