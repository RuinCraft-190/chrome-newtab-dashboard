<template>
  <div class="card">
    <div class="card-header">
      <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
      <h2 class="card-title">工作统计</h2>
    </div>

    <div v-if="!isConfigured" class="empty-state">
      <div class="empty-state-icon">💼</div>
      <p>还没有配置工作信息</p>
      <button class="button button-primary" @click="openSettings">
        去设置
      </button>
    </div>

    <div v-else class="work-content" :class="`work-content--${cardSize || '1x1'}`">
      <!-- 1x1 精简模式：只显示倒计时 -->
      <template v-if="!cardSize || cardSize === '1x1'">
        <div class="work-main work-main--compact">
          <div class="countdown-section countdown-section--compact">
            <div class="countdown-label">距离下班</div>
            <div class="countdown-time">{{ timeUntilOffWork }}</div>
          </div>
        </div>
      </template>

      <!-- 2x1/1x2 标准模式：倒计时+今日已赚 -->
      <template v-else-if="cardSize === '2x1' || cardSize === '1x2'">
        <div class="work-main">
          <div class="countdown-section">
            <div class="countdown-label">距离下班</div>
            <div class="countdown-time">{{ timeUntilOffWork }}</div>
          </div>
          <div class="earnings-section">
            <div class="earnings-label">今日已赚</div>
            <div class="earnings-value">¥{{ earnedToday.toFixed(2) }}</div>
          </div>
        </div>
        <div class="work-footer work-footer--standard">
          <div class="work-schedule">
            {{ formatTime(settings.workStartHour, settings.workStartMinute) }} - {{ formatTime(settings.workEndHour, settings.workEndMinute) }}
          </div>
        </div>
      </template>

      <!-- 2x2 完整模式：所有信息 -->
      <template v-else-if="cardSize === '2x2'">
        <div class="work-main work-main--large">
          <div class="countdown-section countdown-section--large">
            <div class="countdown-label">距离下班</div>
            <div class="countdown-time countdown-time--large">{{ timeUntilOffWork }}</div>
          </div>
          <div class="earnings-section earnings-section--large">
            <div class="earnings-label">今日已赚</div>
            <div class="earnings-value earnings-value--large">¥{{ earnedToday.toFixed(2) }}</div>
          </div>
        </div>

        <div class="work-details work-details--full">
          <div class="detail-item">
            <span class="detail-label">月薪</span>
            <span class="detail-value">¥{{ settings.monthlySalary.toLocaleString() }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">距离发薪</span>
            <span class="detail-value">{{ daysUntilPayday }} 天</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">距离休息</span>
            <span class="detail-value">{{ daysUntilWeekend }} 天</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">工作日</span>
            <span class="detail-value">{{ settings.workdays.length }} 天/周</span>
          </div>
        </div>

        <div class="work-footer">
          <div class="work-schedule">
            工作时间: {{ formatTime(settings.workStartHour, settings.workStartMinute) }} -
            {{ formatTime(settings.workEndHour, settings.workEndMinute) }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import storageHelper from '@shared/utils/storage'
import type { WorkSettings, CardSize } from '@shared/types'

// 接收卡片尺寸
const props = defineProps<{
  cardSize?: CardSize
}>()

const settings = ref<WorkSettings>({
  monthlySalary: 10000,
  payday: 15,
  workStartHour: 9,
  workStartMinute: 0,
  workEndHour: 18,
  workEndMinute: 0,
  workdays: [1, 2, 3, 4, 5] // 周一到周五
})

const timeUntilOffWork = ref('00:00:00')
const earnedToday = ref(0)
const daysUntilPayday = ref(0)
const daysUntilWeekend = ref(0)
const isConfigured = ref(false)

let timer: number

function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

function calculateWorkStats() {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const currentSecond = now.getSeconds()
  const currentDay = now.getDay()

  // 检查是否是工作日
  const isWorkday = settings.value.workdays.includes(currentDay)

  // 计算距离下班时间
  const workEndSeconds = settings.value.workEndHour * 3600 + settings.value.workEndMinute * 60
  const currentSeconds = currentHour * 3600 + currentMinute * 60 + currentSecond

  if (!isWorkday) {
    timeUntilOffWork.value = '休息日'
    earnedToday.value = 0
  } else if (currentSeconds >= workEndSeconds) {
    timeUntilOffWork.value = '已下班'
    earnedToday.value = calculateDailySalary()
  } else {
    const diffSeconds = workEndSeconds - currentSeconds
    const hours = Math.floor(diffSeconds / 3600)
    const minutes = Math.floor((diffSeconds % 3600) / 60)
    const seconds = diffSeconds % 60
    timeUntilOffWork.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    earnedToday.value = calculateEarnedSoFar(currentSeconds)
  }

  // 计算今日日薪
  const dailySalary = calculateDailySalary()
  earnedToday.value = Math.min(earnedToday.value, dailySalary)

  // 计算距离发薪日
  const today = now.getDate()
  const currentMonth = now.getMonth()
  if (today < settings.value.payday) {
    daysUntilPayday.value = settings.value.payday - today
  } else {
    // 计算下个月的发薪日
    const daysInMonth = new Date(now.getFullYear(), currentMonth + 1, 0).getDate()
    daysUntilPayday.value = daysInMonth - today + settings.value.payday
  }

  // 计算距离休息日（非工作日）
  const allDays = [0, 1, 2, 3, 4, 5, 6] // 周日到周六
  const nonWorkdays = allDays.filter(day => !settings.value.workdays.includes(day))

  if (nonWorkdays.length === 0) {
    // 如果没有休息日（每天都工作），显示为0
    daysUntilWeekend.value = 0
  } else {
    // 找到下一个休息日
    let foundNextRestDay = false
    for (let i = 1; i <= 7; i++) {
      const nextDay = (currentDay + i) % 7
      if (nonWorkdays.includes(nextDay)) {
        daysUntilWeekend.value = i
        foundNextRestDay = true
        break
      }
    }
    if (!foundNextRestDay) {
      daysUntilWeekend.value = 0
    }
  }
}

function calculateDailySalary(): number {
  const workDaysPerMonth = settings.value.workdays.length * 4 // 简化计算，假设每月4周
  return settings.value.monthlySalary / workDaysPerMonth
}

function calculateEarnedSoFar(currentSeconds: number): number {
  const workStartSeconds = settings.value.workStartHour * 3600 + settings.value.workStartMinute * 60
  const workEndSeconds = settings.value.workEndHour * 3600 + settings.value.workEndMinute * 60

  if (currentSeconds < workStartSeconds) {
    return 0
  }

  const totalWorkSeconds = workEndSeconds - workStartSeconds
  const workedSeconds = currentSeconds - workStartSeconds
  const dailySalary = calculateDailySalary()

  return (workedSeconds / totalWorkSeconds) * dailySalary
}

async function loadSettings() {
  try {
    const data = await storageHelper.get('work')
    if (data) {
      // 处理 workdays - 可能是数组或类数组对象
      let savedWorkdays = settings.value.workdays
      if (data.workdays) {
        if (Array.isArray(data.workdays)) {
          savedWorkdays = data.workdays
        } else if (typeof data.workdays === 'object') {
          // 处理类数组对象 {0: 1, 1: 2, ...} 转换为数组
          savedWorkdays = Object.values(data.workdays).filter((v): v is number => typeof v === 'number')
        }
      }
      settings.value = {
        ...settings.value,
        ...data,
        workdays: savedWorkdays
      }
    }
    // 检查是否已配置（月薪大于0表示已配置）
    isConfigured.value = settings.value.monthlySalary > 0
  } catch (err) {
    console.error('Failed to load work settings:', err)
  }
}

function openSettings() {
  chrome.runtime.openOptionsPage()
}

onMounted(async () => {
  await loadSettings()
  calculateWorkStats()
  timer = setInterval(calculateWorkStats, 1000) as unknown as number
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.work-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  flex: 1;
}

/* ============ 1x1 精简模式 ============ */
.work-main--compact {
  display: flex;
  place-items: center;
  flex: 1;
}

.countdown-section--compact {
  width: 100%;
  max-width: 200px;
}

/* ============ 2x2 完整模式 ============ */
.work-main--large {
  gap: 20px;
}

.countdown-section--large,
.earnings-section--large {
  padding: 24px;
}

.countdown-time--large,
.earnings-value--large {
  font-size: 2.5rem;
}

.work-details--full {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

/* ============ 通用样式 ============ */
.work-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.countdown-section,
.earnings-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.countdown-label,
.earnings-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 8px;
}

.countdown-time {
  font-size: 1.75rem;
  font-weight: 700;
  font-family: 'Consolas', 'Monaco', monospace;
}

.earnings-value {
  font-size: 1.75rem;
  font-weight: 700;
  font-family: 'Consolas', 'Monaco', monospace;
}

.work-details {
  display: grid;
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
  font-size: 1.25rem;
  font-weight: 600;
  color: #667eea;
  font-family: 'Consolas', 'Monaco', monospace;
}

.work-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.875rem;
  color: #666;
}

.work-footer--standard {
  margin-top: auto;
}

.work-schedule {
  font-weight: 500;
  font-family: 'Consolas', 'Monaco', monospace;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.empty-state-icon {
  font-size: 3rem;
}

.empty-state p {
  color: #666;
  margin: 0;
}

.button {
  padding: 8px 16px;
  font-size: 0.875rem;
}
</style>
