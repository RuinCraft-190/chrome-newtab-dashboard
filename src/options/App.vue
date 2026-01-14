<template>
  <div class="options-page">
    <div class="container">
      <header class="page-header">
        <h1>扩展设置</h1>
        <p>配置天气和签到功能</p>
      </header>

      <div class="settings-sections">
        <section class="section">
          <h2>天气设置</h2>
          <div class="form-group">
            <label>认证方式</label>
            <div class="radio-group">
              <label class="radio-label">
                <input type="radio" v-model="authType" value="apikey" @change="saveAuthType" />
                <span>API Key（简单）</span>
              </label>
              <label class="radio-label">
                <input type="radio" v-model="authType" value="jwt" @change="saveAuthType" />
                <span>JWT（推荐）</span>
              </label>
            </div>
          </div>
          <div class="form-group">
            <label>城市</label>
            <input
              v-model="weatherCity"
              type="text"
              placeholder="输入城市名称，如：北京"
              @blur="saveWeatherCity"
            />
          </div>
          <div v-if="authType === 'apikey'" class="form-group">
            <label>和风天气 API Key</label>
            <input
              v-model="weatherApiKey"
              type="text"
              placeholder="输入你的 API Key"
              @blur="saveWeatherApiKey"
            />
            <small>
              获取地址: <a href="https://dev.qweather.com/" target="_blank">https://dev.qweather.com/</a>
            </small>
          </div>
          <div v-if="authType === 'jwt'">
            <div class="form-group">
              <label>API ID</label>
              <input
                v-model="qweatherApiId"
                type="text"
                placeholder="输入你的 API ID"
                @blur="saveJWTConfig"
              />
              <small>
                在控制台创建 JWT 凭据后获取
              </small>
            </div>
            <div class="form-group">
              <label>私钥 (Private Key)</label>
              <textarea
                v-model="qweatherPrivateKey"
                placeholder="粘贴你的私钥（包含 BEGIN/END 行）"
                rows="4"
                @blur="saveJWTConfig"
              ></textarea>
              <small>
                从 <code>ed25519-private.pem</code> 文件中复制完整内容
              </small>
            </div>
            <div class="info-box">
              <strong>如何获取 JWT 凭据：</strong>
              <ol>
                <li>访问 <a href="https://console.qweather.com/" target="_blank">和风天气控制台</a></li>
                <li>创建项目并选择免费订阅</li>
                <li>添加凭据，选择 JWT 认证</li>
                <li>将项目中的 <code>ed25519-public.pem</code> 公钥粘贴到控制台</li>
                <li>获取 API ID 并在此配置私钥</li>
              </ol>
            </div>
          </div>
        </section>

        <section class="section">
          <div class="section-header">
            <h2>签到网站</h2>
            <button class="button button-primary" @click="showAddSiteModal = true">
              添加网站
            </button>
          </div>

          <div v-if="sites.length === 0" class="empty-state">
            <div class="empty-state-icon">📋</div>
            <p>还没有配置签到网站</p>
          </div>

          <div v-else class="sites-list">
            <div
              v-for="site in sites"
              :key="site.id"
              class="site-item"
            >
              <div class="site-info">
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
              <div class="site-actions">
                <label class="toggle">
                  <input
                    type="checkbox"
                    :checked="site.enabled"
                    @change="toggleSite(site.id)"
                  />
                  <span>启用</span>
                </label>
                <button class="button-icon delete" @click="confirmDeleteSite(site)">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>全局设置</h2>
          <div class="form-group">
            <label>默认签到时间</label>
            <input
              v-model="globalSettings.defaultSchedule"
              type="time"
              @blur="saveGlobalSettings"
            />
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="globalSettings.randomDelay"
                @change="saveGlobalSettings"
              />
              <span>使用随机延迟 (0-30分钟) 避免检测</span>
            </label>
          </div>
        </section>
      </div>
    </div>

    <div v-if="showAddSiteModal" class="modal-overlay" @click.self="showAddSiteModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>添加签到网站</h3>
          <button class="button-icon" @click="showAddSiteModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>网站名称</label>
            <input v-model="newSite.name" type="text" placeholder="例如: 我的PT站" />
          </div>
          <div class="form-group">
            <label>网站URL</label>
            <input v-model="newSite.url" type="text" placeholder="https://example.com" />
          </div>
          <div class="form-group">
            <label>适配器类型</label>
            <select v-model="newSite.adapterType">
              <option value="pt">PT站通用适配器</option>
              <option value="generic">通用按钮适配器</option>
            </select>
          </div>
          <div v-if="newSite.adapterType === 'generic'" class="form-group">
            <label>签到按钮选择器</label>
            <input
              v-model="newSite.checkInButton"
              type="text"
              placeholder="例如: #signin-btn"
            />
            <small>使用浏览器开发者工具查找按钮的选择器</small>
          </div>
        </div>
        <div class="modal-footer">
          <button class="button button-secondary" @click="showAddSiteModal = false">
            取消
          </button>
          <button class="button button-primary" @click="addSite">
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
  getCheckInSites,
  addCheckInSite,
  removeCheckInSite,
  updateCheckInSite,
  getGlobalSettings as fetchGlobalSettings,
  updateGlobalSettings
} from '@background/storage'

const weatherCity = ref('北京')
const weatherApiKey = ref('')
const authType = ref<'apikey' | 'jwt'>('jwt')
const qweatherApiId = ref('')
const qweatherPrivateKey = ref('')
const sites = ref<SiteConfig[]>([])
const globalSettings = ref({
  defaultSchedule: '09:00',
  randomDelay: true
})

const showAddSiteModal = ref(false)
const newSite = ref({
  name: '',
  url: '',
  adapterType: 'pt' as 'pt' | 'generic',
  checkInButton: ''
})

async function loadData() {
  const result = await chrome.storage.local.get(['weather', 'checkin', 'qweatherApiId', 'qweatherPrivateKey'])
  if (result.weather) {
    weatherCity.value = result.weather.city || '北京'
    weatherApiKey.value = result.weather.apiKey || ''
  }
  if (result.qweatherApiId) {
    qweatherApiId.value = result.qweatherApiId
  }
  if (result.qweatherPrivateKey) {
    qweatherPrivateKey.value = result.qweatherPrivateKey
  }
  // 根据是否有配置决定认证类型
  if (qweatherApiId.value || qweatherPrivateKey.value) {
    authType.value = 'jwt'
  } else if (weatherApiKey.value) {
    authType.value = 'apikey'
  }
  if (result.checkin?.sites) {
    sites.value = result.checkin.sites
  }
  const settings = await fetchGlobalSettings()
  globalSettings.value = settings
}

async function saveWeatherCity() {
  const result = await chrome.storage.local.get('weather')
  const weather = result.weather || { city: '北京', lastUpdate: 0, data: null }
  weather.city = weatherCity.value
  await chrome.storage.local.set({ weather })
}

async function saveWeatherApiKey() {
  const result = await chrome.storage.local.get('weather')
  const weather = result.weather || { city: '北京', lastUpdate: 0, data: null }
  weather.apiKey = weatherApiKey.value
  await chrome.storage.local.set({ weather })
}

async function saveAuthType() {
  await chrome.storage.local.set({ weatherAuthType: authType.value })
}

async function saveJWTConfig() {
  await chrome.storage.local.set({
    qweatherApiId: qweatherApiId.value,
    qweatherPrivateKey: qweatherPrivateKey.value
  })
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

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.options-page {
  min-height: 100vh;
  background: #f7fafc;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2rem;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.page-header p {
  color: #666;
}

.settings-sections {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section h2 {
  font-size: 1.25rem;
  color: #1a1a1a;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  margin-bottom: 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.form-group input[type="text"],
.form-group input[type="time"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.875rem;
}

.form-group small code {
  background: #f7fafc;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.8125rem;
}

.form-group small {
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 0.875rem;
}

.form-group small a {
  color: #667eea;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  width: 18px;
  height: 18px;
}

.info-box {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
}

.info-box strong {
  display: block;
  color: #0369a1;
  margin-bottom: 8px;
}

.info-box ol {
  margin: 0;
  padding-left: 20px;
  color: #0c4a6e;
}

.info-box li {
  margin-bottom: 6px;
}

.info-box code {
  background: #e0f2fe;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.8125rem;
}

.sites-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.site-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
  gap: 16px;
}

.site-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.site-name-input,
.site-url-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
}

.site-name-input {
  font-weight: 600;
}

.site-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.button-icon {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.button-icon:hover {
  background: #e2e8f0;
}

.button-icon.delete:hover {
  background: #fed7d7;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #666;
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 1.25rem;
  color: #1a1a1a;
  margin: 0;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}
</style>
