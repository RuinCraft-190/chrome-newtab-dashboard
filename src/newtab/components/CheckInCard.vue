<template>
  <div class="card">
    <div class="card-header">
      <svg class="card-icon" viewBox="0 0 24 24" fill="none" stroke="#667eea" stroke-width="2">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
      <h2 class="card-title">签到状态</h2>
    </div>

    <div v-if="loading" class="loading">
      加载中...
    </div>

    <div v-else-if="sites.length === 0" class="empty-state">
      <div class="empty-state-icon">📋</div>
      <p>还没有配置签到网站</p>
      <button class="button button-primary" @click="openSettings">
        去添加
      </button>
    </div>

    <div v-else class="checkin-list">
      <div
        v-for="site in enabledSites"
        :key="site.id"
        class="checkin-item"
        :class="{ 'checkin-success': site.lastSuccess, 'checkin-pending': !site.lastSuccess }"
      >
        <div class="checkin-info">
          <div class="checkin-name">{{ site.name }}</div>
          <div class="checkin-status">
            <span v-if="site.lastSuccess" class="status-badge success">
              已签到
            </span>
            <span v-else class="status-badge pending">
              未签到
            </span>
          </div>
        </div>
        <div class="checkin-meta">
          <div v-if="site.streak > 0" class="checkin-streak">
            🔥 连续 {{ site.streak }} 天
          </div>
          <div class="checkin-time">
            {{ formatLastCheckIn(site.lastCheckIn) }}
          </div>
        </div>
      </div>

      <div v-if="hasDisabledSites" class="checkin-footer">
        <button class="button button-secondary" @click="openSettings">
          管理网站
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import storageHelper from '@shared/utils/storage'
import type { SiteConfig, CheckInRecord } from '@shared/types'

interface SiteWithStatus extends SiteConfig {
  lastSuccess?: boolean
  streak?: number
  lastCheckIn?: number
}

const sites = ref<SiteWithStatus[]>([])
const loading = ref(true)

const enabledSites = computed(() => sites.value.filter(s => s.enabled))
const hasDisabledSites = computed(() => sites.value.some(s => !s.enabled))

function formatLastCheckIn(timestamp?: number): string {
  if (!timestamp) return '从未签到'

  const now = Date.now()
  const diff = now - timestamp
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days} 天前`
  } else if (hours > 0) {
    return `${hours} 小时前`
  } else {
    const minutes = Math.floor(diff / (1000 * 60))
    return `${minutes} 分钟前`
  }
}

function openSettings() {
  chrome.runtime.openOptionsPage()
}

async function loadCheckInStatus() {
  try {
    loading.value = true

    const checkInData = await storageHelper.get('checkIn')
    const siteConfigs = checkInData?.sites || []
    const records = checkInData?.records || {}

    const today = new Date().toDateString()

    sites.value = siteConfigs.map((config: SiteConfig) => {
      const record = records[config.id] as CheckInRecord | undefined
      const lastCheckInDate = record?.lastCheckIn
        ? new Date(record.lastCheckIn).toDateString()
        : null

      return {
        ...config,
        lastSuccess: lastCheckInDate === today,
        streak: record?.streak || 0,
        lastCheckIn: record?.lastCheckIn
      }
    })
  } catch (err) {
    console.error('Failed to load check-in status:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCheckInStatus()
})
</script>

<style scoped>
.checkin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkin-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: #f7fafc;
  transition: background-color 0.2s;
}

.checkin-item:hover {
  background: #edf2f7;
}

.checkin-info {
  flex: 1;
}

.checkin-name {
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.checkin-status {
  display: flex;
  gap: 8px;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.success {
  background: #c6f6d5;
  color: #22543d;
}

.status-badge.pending {
  background: #fed7d7;
  color: #742a2a;
}

.checkin-meta {
  text-align: right;
}

.checkin-streak {
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 600;
  margin-bottom: 4px;
}

.checkin-time {
  font-size: 0.75rem;
  color: #666;
}

.checkin-footer {
  margin-top: 8px;
  display: flex;
  justify-content: center;
}

.button {
  padding: 8px 16px;
  font-size: 0.875rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.empty-state p {
  color: #666;
  margin: 0;
}
</style>
