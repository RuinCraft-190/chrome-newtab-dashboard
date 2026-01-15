<template>
  <div class="options-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <header class="page-header">
      <div class="header-icon">⚙️</div>
      <h1>扩展设置</h1>
      <p>配置天气和签到功能</p>
    </header>

    <nav class="tabs-nav">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span class="tab-indicator"></span>
      </button>
    </nav>

    <main class="tab-content">
      <!-- 天气设置 -->
      <section v-if="activeTab === 'weather'" class="tab-panel">
        <div class="panel-section">
          <div class="section-title">
            <span class="section-icon">🏙️</span>
            <h2>城市设置</h2>
          </div>
          <div class="form-group">
            <label>搜索城市</label>
            <div class="input-wrapper">
              <input
                v-model="citySearchQuery"
                type="text"
                placeholder="输入城市名称搜索，如：宁波"
                @input="onCitySearchInput"
                @focus="showCityResults = true"
              />
              <span class="input-icon">🔍</span>
            </div>
            <small>输入城市名称进行搜索，从结果中选择</small>
          </div>

          <!-- 搜索结果列表 -->
          <div v-if="showCityResults && citySearchResults.length > 0" class="city-search-results">
            <div
              v-for="city in citySearchResults"
              :key="city.id"
              class="city-result-item"
              @click="selectCity(city)"
            >
              <div class="city-info">
                <span class="city-name">{{ city.name }}</span>
                <span class="city-details">{{ city.adm1 }} {{ city.adm2 }}</span>
              </div>
              <span class="city-select-icon">✓</span>
            </div>
          </div>

          <!-- 已选择的城市 -->
          <div v-if="selectedCity" class="selected-city-display">
            <div class="selected-city-info">
              <span class="selected-city-icon">📍</span>
              <div class="selected-city-details">
                <span class="selected-city-name">{{ selectedCity.cityName }}</span>
                <span class="selected-city-id">ID: {{ selectedCity.locationId }}</span>
              </div>
            </div>
            <button class="button-icon" @click="clearCity" title="清除">✕</button>
          </div>

          <!-- 无搜索结果 -->
          <div v-if="showCityResults && citySearchQuery && citySearchResults.length === 0 && !citySearching" class="no-results">
            未找到相关城市
          </div>

          <!-- 搜索中 -->
          <div v-if="citySearching" class="searching">
            搜索中...
          </div>
        </div>
      </section>

      <!-- 签到设置 -->
      <section v-if="activeTab === 'checkin'" class="tab-panel">
        <div class="panel-section">
          <div class="section-header">
            <div class="section-title">
              <span class="section-icon">📋</span>
              <h2>签到网站</h2>
            </div>
            <button class="button button-primary" @click="showAddSiteModal = true">
              <span class="btn-icon">➕</span>
              添加网站
            </button>
          </div>

          <div v-if="sites.length === 0" class="empty-state">
            <div class="empty-state-icon">📋</div>
            <p>还没有配置签到网站</p>
            <p class="empty-state-hint">点击上方按钮添加你的第一个签到网站</p>
          </div>

          <div v-else class="sites-list">
            <div
              v-for="site in sites"
              :key="site.id"
              class="site-item"
              :class="{ disabled: !site.enabled }"
            >
              <div class="site-info">
                <div class="site-icon">🌐</div>
                <div class="site-details">
                  <input
                    v-model="site.name"
                    type="text"
                    class="site-name-input"
                    @blur="updateSite(site.id, { name: site.name })"
                  />
                  <input
                    v-model="site.url"
                    type="text"
                    class="site-url-input"
                    @blur="updateSite(site.id, { url: site.url })"
                  />
                </div>
              </div>
              <div class="site-actions">
                <label class="toggle-switch" :class="{ active: site.enabled }">
                  <input
                    type="checkbox"
                    :checked="site.enabled"
                    @change="toggleSite(site.id)"
                  />
                  <span class="toggle-slider"></span>
                  <span class="toggle-label">{{ site.enabled ? '已启用' : '已禁用' }}</span>
                </label>
                <button class="button-icon delete" @click="confirmDeleteSite(site)" title="删除">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-title">
            <span class="section-icon">⚙️</span>
            <h2>全局设置</h2>
          </div>
          <div class="form-group">
            <label>默认签到时间</label>
            <div class="input-wrapper">
              <input
                v-model="globalSettings.defaultSchedule"
                type="time"
                @blur="saveGlobalSettings"
              />
              <span class="input-icon">🕐</span>
            </div>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="globalSettings.randomDelay"
                @change="saveGlobalSettings"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">
                <span class="checkbox-title">使用随机延迟</span>
                <span class="checkbox-desc">0-30分钟，避免检测</span>
              </span>
            </label>
          </div>
        </div>
      </section>

      <!-- 工作设置 -->
      <section v-if="activeTab === 'work'" class="tab-panel">
        <div class="panel-section">
          <div class="section-title">
            <span class="section-icon">💰</span>
            <h2>薪资信息</h2>
          </div>
          <div class="form-group">
            <label>月薪（人民币）</label>
            <div class="input-wrapper">
              <input
                v-model.number="workSettings.monthlySalary"
                type="number"
                min="0"
                step="100"
                @blur="saveWorkSettings"
              />
              <span class="input-icon">💵</span>
            </div>
          </div>
          <div class="form-group">
            <label>发薪日</label>
            <div class="input-wrapper">
              <input
                v-model.number="workSettings.payday"
                type="number"
                min="1"
                max="31"
                @blur="saveWorkSettings"
              />
              <span class="input-icon">📅</span>
            </div>
            <small>每月的发薪日期（1-31）</small>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-title">
            <span class="section-icon">🕐</span>
            <h2>工作时间</h2>
          </div>
          <div class="form-group">
            <label>上班时间</label>
            <div class="time-input-group">
              <input
                v-model.number="workSettings.workStartHour"
                type="number"
                min="0"
                max="23"
                @blur="saveWorkSettings"
              />
              <span>时</span>
              <input
                v-model.number="workSettings.workStartMinute"
                type="number"
                min="0"
                max="59"
                @blur="saveWorkSettings"
              />
              <span>分</span>
              <span class="input-icon">🌅</span>
            </div>
          </div>
          <div class="form-group">
            <label>下班时间</label>
            <div class="time-input-group">
              <input
                v-model.number="workSettings.workEndHour"
                type="number"
                min="0"
                max="23"
                @blur="saveWorkSettings"
              />
              <span>时</span>
              <input
                v-model.number="workSettings.workEndMinute"
                type="number"
                min="0"
                max="59"
                @blur="saveWorkSettings"
              />
              <span>分</span>
              <span class="input-icon">🌇</span>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="section-title">
            <span class="section-icon">📅</span>
            <h2>工作日</h2>
          </div>
          <div class="workdays-selector">
            <label
              v-for="day in weekDays"
              :key="day.value"
              :class="['workday-checkbox', { checked: workSettings.workdays.includes(day.value) }]"
            >
              <input
                type="checkbox"
                :checked="workSettings.workdays.includes(day.value)"
                @change="toggleWorkday(day.value)"
              />
              <span class="workday-label">{{ day.label }}</span>
            </label>
          </div>
          <small>选择你的工作日（用于计算休息日）</small>
        </div>
      </section>
    </main>

    <div v-if="showAddSiteModal" class="modal-overlay" @click.self="showAddSiteModal = false">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">
            <span class="modal-icon">➕</span>
            <h3>添加签到网站</h3>
          </div>
          <button class="button-icon" @click="showAddSiteModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>网站名称</label>
            <div class="input-wrapper">
              <input v-model="newSite.name" type="text" placeholder="例如: 我的PT站" />
              <span class="input-icon">📝</span>
            </div>
          </div>
          <div class="form-group">
            <label>网站URL</label>
            <div class="input-wrapper">
              <input v-model="newSite.url" type="text" placeholder="https://example.com" />
              <span class="input-icon">🔗</span>
            </div>
          </div>
          <div class="form-group">
            <label>适配器类型</label>
            <div class="select-wrapper">
              <select v-model="newSite.adapterType">
                <option value="pt">PT站通用适配器</option>
                <option value="generic">通用按钮适配器</option>
              </select>
              <span class="select-icon">⚙️</span>
            </div>
          </div>
          <div v-if="newSite.adapterType === 'generic'" class="form-group">
            <label>签到按钮选择器</label>
            <div class="input-wrapper">
              <input
                v-model="newSite.checkInButton"
                type="text"
                placeholder="例如: #signin-btn"
              />
              <span class="input-icon">🎯</span>
            </div>
            <small>使用浏览器开发者工具查找按钮的选择器</small>
          </div>
        </div>
        <div class="modal-footer">
          <button class="button button-secondary" @click="showAddSiteModal = false">
            取消
          </button>
          <button class="button button-primary" @click="addSite">
            <span class="btn-icon">✓</span>
            添加
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { SiteConfig } from '@shared/types'
import {
  addCheckInSite,
  removeCheckInSite,
  updateCheckInSite,
  getGlobalSettings as fetchGlobalSettings,
  updateGlobalSettings
} from '@background/storage'
import { QWeatherService } from '@shared/api/weather'

// 标签页配置
const tabs = ref([
  { id: 'weather', label: '天气设置', icon: '🌤️' },
  { id: 'checkin', label: '签到设置', icon: '📋' },
  { id: 'work', label: '工作设置', icon: '💼' }
])
const activeTab = ref('weather')

// 天气配置 - 城市搜索
const citySearchQuery = ref('')
const citySearchResults = ref<Array<{id: string, name: string, adm1?: string, adm2?: string}>>([])
const citySearching = ref(false)
const showCityResults = ref(false)
const selectedCity = ref<{locationId: string, cityName: string} | null>(null)
let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null

const weatherService = new QWeatherService({ authType: 'jwt' })

// 签到配置
const sites = ref<SiteConfig[]>([])
const globalSettings = ref({
  defaultSchedule: '09:00',
  randomDelay: true
})

// 工作配置
const workSettings = ref({
  monthlySalary: 10000,
  payday: 15,
  workStartHour: 9,
  workStartMinute: 0,
  workEndHour: 18,
  workEndMinute: 0,
  workdays: [1, 2, 3, 4, 5]
})

const showAddSiteModal = ref(false)
const newSite = ref({
  name: '',
  url: '',
  adapterType: 'pt' as 'pt' | 'generic',
  checkInButton: ''
})

const weekDays = [
  { value: 0, label: '周日' },
  { value: 1, label: '周一' },
  { value: 2, label: '周二' },
  { value: 3, label: '周三' },
  { value: 4, label: '周四' },
  { value: 5, label: '周五' },
  { value: 6, label: '周六' }
]

async function loadData() {
  const result = await chrome.storage.local.get(['weatherSettings', 'checkin', 'work'])

  // 加载天气设置
  if (result.weatherSettings) {
    selectedCity.value = {
      locationId: result.weatherSettings.locationId,
      cityName: result.weatherSettings.cityName
    }
    citySearchQuery.value = result.weatherSettings.cityName || ''
  }

  // 加载签到配置
  if (result.checkin?.sites) {
    sites.value = result.checkin.sites
  }

  // 加载工作配置
  if (result.work) {
    console.log('Loaded work settings from storage:', result.work)
    console.log('workdays from storage:', result.work.workdays, 'isArray:', Array.isArray(result.work.workdays))
    // 处理 workdays - 可能是数组或类数组对象
    let savedWorkdays = workSettings.value.workdays
    if (result.work.workdays) {
      if (Array.isArray(result.work.workdays)) {
        savedWorkdays = result.work.workdays
      } else if (typeof result.work.workdays === 'object') {
        // 处理类数组对象 {0: 1, 1: 2, ...} 转换为数组
        savedWorkdays = Object.values(result.work.workdays).filter((v): v is number => typeof v === 'number')
      }
    }
    console.log('savedWorkdays:', savedWorkdays)
    workSettings.value = {
      monthlySalary: result.work.monthlySalary ?? workSettings.value.monthlySalary,
      payday: result.work.payday ?? workSettings.value.payday,
      workStartHour: result.work.workStartHour ?? workSettings.value.workStartHour,
      workStartMinute: result.work.workStartMinute ?? workSettings.value.workStartMinute,
      workEndHour: result.work.workEndHour ?? workSettings.value.workEndHour,
      workEndMinute: result.work.workEndMinute ?? workSettings.value.workEndMinute,
      workdays: savedWorkdays
    }
    console.log('Merged work settings:', workSettings.value)
  }

  const settings = await fetchGlobalSettings()
  globalSettings.value = settings
}

// 城市搜索功能
async function onCitySearchInput() {
  // 清除之前的防抖定时器
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  const query = citySearchQuery.value.trim()

  // 如果查询为空，清空结果
  if (!query) {
    citySearchResults.value = []
    showCityResults.value = false
    return
  }

  // 防抖处理，避免频繁请求
  searchDebounceTimer = setTimeout(async () => {
    try {
      citySearching.value = true
      const results = await weatherService.searchCity(query)
      citySearchResults.value = results.slice(0, 10) // 只显示前10个结果
      showCityResults.value = true
    } catch (error) {
      console.error('City search failed:', error)
      citySearchResults.value = []
    } finally {
      citySearching.value = false
    }
  }, 500) // 500ms 防抖延迟
}

async function selectCity(city: {id: string, name: string, adm1?: string, adm2?: string}) {
  selectedCity.value = {
    locationId: city.id,
    cityName: city.name
  }

  // 保存到存储
  await chrome.storage.local.set({
    weatherSettings: {
      locationId: city.id,
      cityName: city.name
    }
  })

  // 清空搜索状态
  citySearchQuery.value = city.name
  citySearchResults.value = []
  showCityResults.value = false
}

async function clearCity() {
  selectedCity.value = null
  citySearchQuery.value = ''
  citySearchResults.value = []

  // 清除存储
  await chrome.storage.local.remove('weatherSettings')
}

async function addSite() {
  if (!newSite.value.name || !newSite.value.url) {
    alert('请填写网站名称和URL')
    return
  }

  const site: SiteConfig = {
    id: Date.now().toString(),
    name: newSite.value.name,
    url: newSite.value.url,
    enabled: true,
    adapterType: newSite.value.adapterType,
    adapterConfig: newSite.value.adapterType === 'generic' ? {
      urlPattern: newSite.value.url.replace(/https?:\/\/([^\/]+).*/, '$1'),
      selectors: {
        checkInButton: newSite.value.checkInButton
      }
    } : undefined
  }

  await addCheckInSite(site)
  sites.value.push(site)
  showAddSiteModal.value = false

  newSite.value = {
    name: '',
    url: '',
    adapterType: 'pt',
    checkInButton: ''
  }

  chrome.runtime.sendMessage({ action: 'RELOAD_ADAPTERS' })
}

async function toggleSite(siteId: string) {
  const site = sites.value.find(s => s.id === siteId)
  if (site) {
    site.enabled = !site.enabled
    await updateCheckInSite(siteId, { enabled: site.enabled })
  }
}

async function updateSite(siteId: string, updates: Partial<SiteConfig>) {
  await updateCheckInSite(siteId, updates)
}

async function confirmDeleteSite(site: SiteConfig) {
  if (confirm(`确定要删除 "${site.name}" 吗?`)) {
    await removeCheckInSite(site.id)
    sites.value = sites.value.filter(s => s.id !== site.id)
  }
}

async function saveGlobalSettings() {
  await updateGlobalSettings(globalSettings.value)
}

async function saveWorkSettings() {
  console.log('Saving work settings:', workSettings.value)
  await chrome.storage.local.set({ work: workSettings.value })
}

function toggleWorkday(day: number) {
  const index = workSettings.value.workdays.indexOf(day)
  if (index > -1) {
    // 移除工作日
    workSettings.value.workdays = workSettings.value.workdays.filter(d => d !== day)
  } else {
    // 添加工作日 - 创建新数组以触发响应式更新
    workSettings.value.workdays = [...workSettings.value.workdays, day]
  }
  saveWorkSettings()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* ==================== 基础样式 ==================== */
.options-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow-x: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s ease-in-out infinite;
}

.bg-circle-1 {
  width: 400px;
  height: 400px;
  top: -200px;
  left: -100px;
  animation-delay: 0s;
}

.bg-circle-2 {
  width: 300px;
  height: 300px;
  top: 50%;
  right: -150px;
  animation-delay: -5s;
}

.bg-circle-3 {
  width: 200px;
  height: 200px;
  bottom: -100px;
  left: 30%;
  animation-delay: -10s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-30px) rotate(180deg);
  }
}

/* 页面头部 */
.page-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.header-icon {
  font-size: 3rem;
  margin-bottom: 16px;
  animation: spin-slow 10s linear infinite;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.page-header h1 {
  font-size: 2rem;
  color: white;
  margin-bottom: 8px;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.page-header p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

/* ==================== 导航栏 ==================== */
.tabs-nav {
  max-width: 800px;
  margin: 0 auto 30px;
  display: flex;
  gap: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 8px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border: none;
  background: transparent;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.tab-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.tab-button:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: translateY(-2px);
}

.tab-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.tab-icon {
  font-size: 1.25rem;
  position: relative;
  z-index: 1;
}

.tab-label {
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 30px;
  height: 3px;
  background: white;
  border-radius: 2px;
  transition: transform 0.3s;
}

.tab-button.active .tab-indicator {
  transform: translateX(-50%) scaleX(1);
}

/* ==================== 内容区域 ==================== */
.tab-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.tab-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.panel-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.section-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.section-title h2 {
  font-size: 1.25rem;
  color: #1a1a1a;
  margin: 0;
  font-weight: 700;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.section-header .section-title {
  margin-bottom: 0;
}

/* ==================== 按钮样式 ==================== */
.button {
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.button-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.button-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.button-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.button-secondary:hover {
  background: #cbd5e0;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 1rem;
}

/* ==================== 表单样式 ==================== */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 10px;
  font-size: 0.95rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 45px 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s;
  background: #f7fafc;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-icon {
  position: absolute;
  right: 12px;
  font-size: 1.1rem;
  pointer-events: none;
  opacity: 0.5;
}

.textarea-wrapper {
  position: relative;
}

.textarea-wrapper textarea {
  width: 100%;
  padding: 12px 45px 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  font-family: 'Consolas', 'Monaco', monospace;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s;
  background: #f7fafc;
}

.textarea-wrapper textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.textarea-icon {
  position: absolute;
  right: 12px;
  top: 12px;
  font-size: 1.1rem;
  pointer-events: none;
  opacity: 0.5;
}

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  width: 100%;
  padding: 12px 45px 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s;
  background: #f7fafc;
  appearance: none;
  cursor: pointer;
}

.select-wrapper select:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.select-icon {
  position: absolute;
  right: 12px;
  font-size: 1.1rem;
  pointer-events: none;
  opacity: 0.5;
}

.form-group small {
  display: block;
  margin-top: 8px;
  color: #718096;
  font-size: 0.875rem;
  line-height: 1.5;
}

.form-group small code {
  background: #edf2f7;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.8125rem;
  color: #667eea;
}

.form-group small a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.form-group small a:hover {
  text-decoration: underline;
}

/* ==================== 单选卡片样式 ==================== */
.radio-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.radio-label {
  cursor: pointer;
  position: relative;
}

.radio-label input[type="radio"] {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.radio-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #f7fafc;
  transition: all 0.3s;
}

.radio-label:hover .radio-card {
  border-color: #cbd5e0;
  background: white;
}

.radio-label.checked .radio-card {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.radio-icon {
  font-size: 2rem;
}

.radio-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.radio-title {
  font-weight: 700;
  color: #2d3748;
  font-size: 1rem;
}

.radio-desc {
  font-size: 0.875rem;
  color: #718096;
}

/* ==================== 复选框样式 ==================== */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  padding: 16px;
  border-radius: 10px;
  transition: all 0.3s;
}

.checkbox-label:hover {
  background: rgba(102, 126, 234, 0.05);
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 24px;
  height: 24px;
  border: 2px solid #cbd5e0;
  border-radius: 6px;
  flex-shrink: 0;
  transition: all 0.3s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-label input:checked + .checkbox-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.checkbox-label input:checked + .checkbox-custom::after {
  content: '✓';
  color: white;
  font-size: 14px;
  font-weight: bold;
}

.checkbox-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.checkbox-title {
  font-weight: 600;
  color: #2d3748;
}

.checkbox-desc {
  font-size: 0.875rem;
  color: #718096;
}

/* ==================== 信息框 ==================== */
.info-box {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.info-box strong {
  display: block;
  color: #667eea;
  margin-bottom: 12px;
  font-size: 1rem;
}

.info-box ol {
  margin: 0;
  padding-left: 24px;
  color: #4a5568;
  line-height: 1.8;
}

.info-box li {
  margin-bottom: 8px;
}

.info-box code {
  background: rgba(102, 126, 234, 0.15);
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.8125rem;
  color: #667eea;
  font-weight: 600;
}

.info-box a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.info-box a:hover {
  text-decoration: underline;
}

/* 公钥复制框 */
.public-key-box {
  background: white;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 12px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.public-key-box code {
  background: transparent;
  color: #667eea;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.875rem;
  word-break: break-all;
  flex: 1;
  padding: 0;
}

.copy-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s;
  flex-shrink: 0;
}

.copy-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* ==================== 网站列表 ==================== */
.sites-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.site-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f7fafc;
  border-radius: 12px;
  gap: 20px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.site-item:hover {
  background: white;
  border-color: #e2e8f0;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.site-item.disabled {
  opacity: 0.6;
}

.site-info {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.site-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.site-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.site-name-input,
.site-url-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
  background: white;
}

.site-name-input:focus,
.site-url-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.site-name-input {
  font-weight: 600;
  color: #2d3748;
}

.site-url-input {
  color: #718096;
  font-size: 0.875rem;
}

.site-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* ==================== 开关样式 ==================== */
.toggle-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  position: relative;
}

.toggle-switch input[type="checkbox"] {
  display: none;
}

.toggle-slider {
  width: 48px;
  height: 26px;
  background: #cbd5e0;
  border-radius: 13px;
  position: relative;
  transition: all 0.3s;
}

.toggle-slider::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-slider {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.toggle-switch.active .toggle-slider::after {
  transform: translateX(22px);
}

.toggle-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #718096;
}

.toggle-switch.active .toggle-label {
  color: #667eea;
}

/* ==================== 按钮图标 ==================== */
.button-icon {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-icon:hover {
  background: #e2e8f0;
  transform: scale(1.1);
}

.button-icon.delete:hover {
  background: #fed7d7;
}

/* ==================== 空状态 ==================== */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #718096;
}

.empty-state-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

.empty-state-hint {
  font-size: 0.875rem;
  color: #a0aec0;
  margin-top: 8px;
}

/* ==================== 模态框 ==================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  font-size: 1.5rem;
}

.modal-header h3 {
  font-size: 1.25rem;
  color: #1a1a1a;
  margin: 0;
  font-weight: 700;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f7fafc;
}

/* ==================== 时间输入组 ==================== */
.time-input-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.time-input-group input {
  width: 90px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  text-align: center;
  transition: all 0.3s;
  background: #f7fafc;
}

.time-input-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.time-input-group span:not(.input-icon) {
  color: #718096;
  font-weight: 500;
}

.time-input-group .input-icon {
  font-size: 1.5rem;
  opacity: 0.7;
}

/* ==================== 工作日选择器 ==================== */
.workdays-selector {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.workday-checkbox {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f7fafc;
  min-width: 60px;
}

.workday-checkbox:hover {
  border-color: #cbd5e0;
  background: white;
  transform: translateY(-2px);
}

.workday-checkbox.checked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.workday-checkbox input[type="checkbox"] {
  display: none;
}

.workday-label {
  font-weight: 600;
  font-size: 0.9rem;
}

/* ==================== 响应式 ==================== */
@media (max-width: 640px) {
  .tabs-nav {
    flex-wrap: wrap;
  }

  .tab-button {
    flex: 1 1 calc(50% - 6px);
    min-width: 120px;
  }

  .radio-group {
    grid-template-columns: 1fr;
  }

  .site-item {
    flex-direction: column;
    align-items: stretch;
  }

  .site-info {
    flex-direction: column;
    gap: 12px;
  }

  .site-actions {
    justify-content: space-between;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .time-input-group {
    flex-direction: column;
    align-items: stretch;
  }

  .time-input-group input {
    width: 100%;
  }
}

/* ==================== 城市搜索结果 ==================== */
.city-search-results {
  margin-top: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background: white;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.city-result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.2s;
}

.city-result-item:last-child {
  border-bottom: none;
}

.city-result-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.city-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.city-name {
  font-weight: 600;
  color: #2d3748;
  font-size: 1rem;
}

.city-details {
  font-size: 0.875rem;
  color: #718096;
}

.city-select-icon {
  color: #667eea;
  font-size: 1.25rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.city-result-item:hover .city-select-icon {
  opacity: 1;
}

/* 已选择城市显示 */
.selected-city-display {
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.selected-city-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selected-city-icon {
  font-size: 1.5rem;
}

.selected-city-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.selected-city-name {
  font-weight: 600;
  color: #667eea;
  font-size: 1.125rem;
}

.selected-city-id {
  font-size: 0.875rem;
  color: #718096;
}

/* 无结果和搜索中状态 */
.no-results,
.searching {
  margin-top: 12px;
  padding: 20px;
  text-align: center;
  color: #718096;
  font-size: 0.95rem;
  background: #f7fafc;
  border-radius: 10px;
  border: 2px dashed #e2e8f0;
}

.searching {
  color: #667eea;
  border-style: solid;
  border-color: rgba(102, 126, 234, 0.3);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}
</style>
