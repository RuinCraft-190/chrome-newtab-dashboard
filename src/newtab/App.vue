<template>
  <div class="container" @contextmenu.prevent="showContainerContextMenu">
    <!-- 新 Hero Header -->
    <div class="hero-header">
      <!-- 左侧面板：时间和日期 -->
      <div class="left-panel">
        <div class="top-info">
          <span>欢迎回来</span>
          <div class="date-badge">{{ dateDisplay }}</div>
        </div>
        <div class="main-time">{{ realTime }}</div>
      </div>

      <!-- 中央分割线 -->
      <div class="divider"></div>

      <!-- 右侧面板：进度和控制 -->
      <div class="right-panel">
        <div class="progress-section">
          <div class="progress-info">
            <div class="status-indicator"></div>
            <span>今日进度</span>
            <span class="progress-percent">{{ progress }}%</span>
          </div>
          <div class="progress-bg">
            <div class="progress-bar" :style="{ width: progress + '%' }"></div>
          </div>
        </div>
        <button class="settings-btn" @click="openSettings" title="打开设置">
          <span class="settings-icon">⚙️</span>
        </button>
      </div>
    </div>

    <DashboardGrid
      @card-contextmenu="handleCardContextMenu"
      @weather-contextmenu="handleWeatherContextMenu"
      @navigation-contextmenu="handleNavigationContextMenu"
    />

    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
    >
      <!-- 空白区域菜单 -->
      <template v-if="contextMenu.type === 'container'">
        <div class="context-menu-item" @click="onAddNavigation">
          <span class="menu-icon">➕</span>
          新建网站导航
        </div>
        <div class="context-menu-item" @click="onResetLayout">
          <span class="menu-icon">🔄</span>
          重置布局
        </div>
      </template>

      <!-- 导航卡片菜单 -->
      <template v-if="contextMenu.type === 'navigation'">
        <div class="context-menu-item" @click="onEditNavigation">
          <span class="menu-icon">✏️</span>
          编辑
        </div>
        <div class="context-menu-item danger" @click="onDeleteNavigation">
          <span class="menu-icon">🗑️</span>
          删除
        </div>
      </template>

      <!-- 天气卡片菜单 -->
      <template v-if="contextMenu.type === 'weather'">
        <div class="context-menu-item" @click="onRefreshWeather">
          <span class="menu-icon">🔄</span>
          刷新天气
        </div>
        <div class="context-menu-item" @click="onChangeCity">
          <span class="menu-icon">🏙️</span>
          切换城市
        </div>
      </template>

      <!-- 卡片尺寸菜单 -->
      <template v-if="contextMenu.type === 'card-size'">
        <div class="context-menu-section-title">卡片尺寸</div>
        <div
          v-for="option in sizeOptions"
          :key="option.value"
          class="context-menu-item"
          :class="{ active: currentCardConfig?.size === option.value }"
          @click="onChangeCardSize(option.value)"
        >
          <span class="size-icon">{{ option.icon }}</span>
          <span>{{ option.label }}</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import DashboardGrid from './components/DashboardGrid.vue'
import type { CardConfig } from '@shared/types'

const realTime = ref('')
const dateDisplay = ref('')
const progress = ref(0)

// 右键菜单状态
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  type: '' // 'container' | 'navigation' | 'weather' | 'card-size' | 'card-visibility'
})
const contextMenuItem = ref<any>(null)
const currentCardConfig = ref<CardConfig | null>(null)

// 可用的卡片尺寸选项
const sizeOptions = [
  { value: '1x1', label: '标准 (1x1)', icon: '▢' },
  { value: '2x1', label: '宽屏 (2x1)', icon: '▬' },
  { value: '1x2', label: '高屏 (1x2)', icon: '▮' },
  { value: '2x2', label: '大屏 (2x2)', icon: '⬛' }
]

// 显示容器（空白区域）右键菜单
function showContainerContextMenu(event: MouseEvent) {
  // 检查点击的是否是空白区域（不是卡片）
  const target = event.target as HTMLElement
  const isCard = target.closest('.dashboard-card') || target.closest('.card') || target.closest('.nav-card')

  if (!isCard) {
    showContextMenu(event, 'container')
  }
}

// 处理 DashboardGrid 的卡片右键菜单
function handleCardContextMenu(event: MouseEvent, config: CardConfig) {
  currentCardConfig.value = config
  // 根据卡片类型决定显示什么菜单
  const resizeableTypes = ['weather', 'work']
  if (resizeableTypes.includes(config.type)) {
    showContextMenu(event, 'card-size')
  } else {
    showContextMenu(event, 'card-visibility')
  }
}

// 显示右键菜单
function showContextMenu(event: MouseEvent, type: string, item: any = null) {
  event.preventDefault()
  event.stopPropagation()

  contextMenuItem.value = item
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    type
  }

  // 点击其他地方关闭菜单
  document.addEventListener('click', closeContextMenu)
  document.addEventListener('contextmenu', closeContextMenu)
}

// 关闭右键菜单
function closeContextMenu() {
  contextMenu.value.visible = false
  document.removeEventListener('click', closeContextMenu)
  document.removeEventListener('contextmenu', closeContextMenu)
}

// 处理导航卡片的右键菜单
function handleNavigationContextMenu(event: MouseEvent, item: any) {
  showContextMenu(event, 'navigation', item)
}

// 处理天气卡片的右键菜单
function handleWeatherContextMenu(event: MouseEvent) {
  showContextMenu(event, 'weather')
}

// 菜单操作：新建导航
function onAddNavigation() {
  // 通过事件通知 NavigationCard 组件
  const event = new CustomEvent('add-navigation')
  window.dispatchEvent(event)
  closeContextMenu()
}

// 菜单操作：编辑导航
function onEditNavigation() {
  const event = new CustomEvent('edit-navigation', { detail: contextMenuItem.value })
  window.dispatchEvent(event)
  closeContextMenu()
}

// 菜单操作：删除导航
function onDeleteNavigation() {
  const event = new CustomEvent('delete-navigation', { detail: contextMenuItem.value })
  window.dispatchEvent(event)
  closeContextMenu()
}

// 菜单操作：刷新天气
function onRefreshWeather() {
  const event = new CustomEvent('refresh-weather')
  window.dispatchEvent(event)
  closeContextMenu()
}

// 菜单操作：切换城市
function onChangeCity() {
  chrome.runtime.openOptionsPage()
  closeContextMenu()
}

// 菜单操作：重置布局
async function onResetLayout() {
  if (!confirm('确定要重置卡片布局吗？这将恢复默认设置。')) {
    return
  }

  const defaultLayout = {
    version: '1.0.0',
    columns: 3,
    cards: [
      {
        id: 'weather-1',
        type: 'weather' as const,
        size: '1x1' as const,
        visible: true,
        position: 0
      },
      {
        id: 'work-1',
        type: 'work' as const,
        size: '1x1' as const,
        visible: true,
        position: 1
      },
      {
        id: 'navigation-1',
        type: 'navigation' as const,
        size: '2x1' as const,
        visible: true,
        position: 2
      }
    ]
  }

  await (chrome as any).storage.local.set({ dashboardLayout: defaultLayout })
  window.location.reload()
}

// 菜单操作：更改卡片尺寸
async function onChangeCardSize(size: string) {
  console.log('[App] onChangeCardSize called with size:', size)
  console.log('[App] currentCardConfig:', currentCardConfig.value)
  if (currentCardConfig.value) {
    const cardId = currentCardConfig.value.id
    const result = await (chrome as any).storage.local.get('dashboardLayout')
    console.log('[App] Current layout from storage:', result.dashboardLayout)

    if (result.dashboardLayout && result.dashboardLayout.cards) {
      // 将 cards 转换为数组（可能是类数组对象）
      const cardsArray = Array.isArray(result.dashboardLayout.cards)
        ? result.dashboardLayout.cards
        : Object.values(result.dashboardLayout.cards)

      console.log('[App] cardsArray:', cardsArray)

      // 找到目标卡片
      const card = cardsArray.find((c: CardConfig) => c.id === cardId)
      console.log('[App] Found card:', card)

      if (card) {
        // 创建新的卡片数组
        const newCardsArray = cardsArray.map((c: CardConfig) =>
          c.id === cardId ? { ...c, size: size as any } : c
        )
        console.log('[App] newCardsArray:', newCardsArray)

        // 创建新的布局对象
        const newLayout = {
          ...result.dashboardLayout,
          cards: newCardsArray
        }
        console.log('[App] New layout to save:', newLayout)

        await (chrome as any).storage.local.set({ dashboardLayout: newLayout })
        console.log('[App] Layout saved successfully')
      }
    }
  }
  closeContextMenu()
}

// 菜单操作：切换卡片可见性
async function onToggleCardVisibility() {
  console.log('[App] onToggleCardVisibility called')
  if (currentCardConfig.value) {
    const cardId = currentCardConfig.value.id
    const result = await (chrome as any).storage.local.get('dashboardLayout')

    if (result.dashboardLayout && result.dashboardLayout.cards) {
      // 将 cards 转换为数组（可能是类数组对象）
      const cardsArray = Array.isArray(result.dashboardLayout.cards)
        ? result.dashboardLayout.cards
        : Object.values(result.dashboardLayout.cards)

      // 创建新的布局对象
      const newLayout = {
        ...result.dashboardLayout,
        cards: cardsArray.map((c: CardConfig) =>
          c.id === cardId ? { ...c, visible: !c.visible } : c
        )
      }
      await (chrome as any).storage.local.set({ dashboardLayout: newLayout })
      console.log('[App] Card visibility toggled successfully')
    }
  }
  closeContextMenu()
}

function updateTime() {
  const now = new Date()

  // 实时秒级时间 (10:16:44)
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  realTime.value = `${h}:${m}:${s}`

  // 日期显示 (1月15日 · 周四)
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  dateDisplay.value = `${month}月${day}日 · 周${weekdays[now.getDay()]}`

  // 进度计算 (工作时间 9:00-18:00)
  const current = now.getHours() * 60 + now.getMinutes()
  const start = 9 * 60
  const end = 18 * 60

  if (current < start) {
    progress.value = 0
  } else if (current > end) {
    progress.value = 100
  } else {
    progress.value = Math.round(((current - start) / (end - start)) * 100)
  }
}

function openSettings() {
  chrome.runtime.openOptionsPage()
}

let timer: number

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000) as unknown as number
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.container {
  height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Hero Header 主容器 */
.hero-header {
  width: 100%;
  max-width: 900px;
  height: 120px;
  margin: 0 auto 40px;

  /* 毛玻璃背景 */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);

  display: flex;
  align-items: center;
  position: relative;
  color: white;
}

/* 左侧面板 */
.left-panel {
  flex: 1;
  height: 100%;
  padding: 0 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
}

/* 问候语 + 日期胶囊 */
.top-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 2px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

/* 日期胶囊 */
.date-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #fff;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

/* 主时间显示 */
.main-time {
  font-size: 2.5rem;
  font-weight: 700;
  line-height: 1.1;
  font-family: 'Consolas', 'Monaco', monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: -1px;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* 中央分割线 */
.divider {
  width: 1px;
  height: 50%;
  background: rgba(255, 255, 255, 0.2);
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

/* 右侧面板 */
.right-panel {
  flex: 1;
  height: 100%;
  padding: 0 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px; /* 稍微减小间隙 */
}

/* 进度部分 */
.progress-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
}

/* 状态指示点 */
.status-indicator {
  width: 8px;
  height: 8px;
  background-color: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
}

/* 进度百分比 */
.progress-percent {
  font-size: 1.2rem;
  font-weight: 700;
  font-family: 'Consolas', 'Monaco', monospace;
  font-variant-numeric: tabular-nums;
  margin-left: auto;
}

/* 进度条背景 */
.progress-bg {
  width: 100%;
  height: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 进度条填充 */
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 5px;
  transition: width 0.3s ease;
}

/* 设置按钮 */
.settings-btn {
  width: 52px; /* 进一步增大按钮 */
  height: 52px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
  padding: 8px;
  position: relative;
  /* 确保不被裁剪 */
  overflow: visible;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.settings-btn:active {
  transform: scale(0.95);
}

/* 设置图标采用Unicode字符避免SVG渲染问题 */
.settings-icon {
  font-size: 28px;
  line-height: 1;
  user-select: none;
  transition: transform 0.2s ease;
}

.settings-btn:hover .settings-icon {
  transform: rotate(30deg) scale(1.1);
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .hero-header {
    height: auto;
    flex-direction: column;
    padding: 20px;
    gap: 16px;
  }

  .divider {
    width: 100%;
    height: 1px;
    position: static;
    transform: none;
  }

  .left-panel,
  .right-panel {
    padding: 0;
    width: 100%;
    align-items: center;
  }

  .top-info {
    justify-content: center;
    width: 100%;
  }

  .right-panel {
    flex-direction: column;
    gap: 12px;
  }

  .progress-section {
    width: 100%;
  }

  .settings-btn {
    width: 48px;
    height: 48px;
    border-radius: 10px;
  }

  .settings-icon {
    font-size: 26px;
  }

  .main-time {
    font-size: 2rem;
    font-family: 'Consolas', 'Monaco', monospace; /* 保持字体一致 */
  }

  .progress-percent {
    font-family: 'Consolas', 'Monaco', monospace; /* 百分比数字字体 */
  }
}

/* 小屏幕优化 */
@media (max-width: 480px) {
  .container {
    padding: 20px 12px;
  }

  .hero-header {
    margin: 0 auto 24px;
  }

  .main-time {
    font-size: 1.75rem;
    font-family: 'Consolas', 'Monaco', monospace; /* 保持字体一致 */
  }

  .top-info {
    font-size: 0.85rem;
  }

  .date-badge {
    font-size: 0.8rem;
    padding: 2px 6px;
  }

  .progress-percent {
    font-size: 1rem;
    font-family: 'Consolas', 'Monaco', monospace; /* 保持字体一致 */
  }

  .settings-btn {
    width: 44px;
    height: 44px;
  }

  .settings-icon {
    font-size: 24px;
  }
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 180px;
  z-index: 10000;
  animation: contextMenuFadeIn 0.15s ease-out;
}

@keyframes contextMenuFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-8px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
}

.context-menu-item:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.context-menu-item.danger:hover {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
}

.menu-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.size-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.context-menu-section-title {
  padding: 8px 16px 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.context-menu-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 4px 0;
}

.context-menu-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
  color: #667eea;
  font-weight: 500;
}
</style>
