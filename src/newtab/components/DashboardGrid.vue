<template>
  <VueDraggable
    v-model="cards"
    class="dashboard-grid"
    :style="{ '--grid-columns': layout.columns }"
    ghost-class="ghost-card"
    drag-class="is-dragging"
    :animation="200"
    handle=".drag-handle"
    @end="onDragEnd"
  >
    <div
      v-for="config in cards"
      :key="config.id"
      v-show="config.visible"
      class="dashboard-card"
      :data-size="config.size"
      :data-card-id="config.id"
      @contextmenu.prevent="handleCardContextMenu($event, config)"
    >
      <!-- 拖动手柄 -->
      <div class="drag-handle" title="拖动排序">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="12" r="1" />
          <circle cx="9" cy="5" r="1" />
          <circle cx="9" cy="19" r="1" />
          <circle cx="15" cy="12" r="1" />
          <circle cx="15" cy="5" r="1" />
          <circle cx="15" cy="19" r="1" />
        </svg>
      </div>

      <!-- 尺寸徽章 -->
      <div class="size-badge">{{ config.size }}</div>

      <!-- 动态卡片组件 -->
      <WeatherCard
        v-if="config.type === 'weather'"
        :card-size="config.size"
      />
      <WorkCard
        v-if="config.type === 'work'"
        :card-size="config.size"
      />
      <NavigationCard
        v-if="config.type === 'navigation'"
        :card-size="config.size"
        @navigation-contextmenu="handleNavigationContextMenu"
      />
    </div>
  </VueDraggable>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import WeatherCard from './WeatherCard.vue'
import WorkCard from './WorkCard.vue'
import NavigationCard from './NavigationCard.vue'
import type { CardConfig, CardType } from '@shared/types'

// 定义 emit
const emit = defineEmits<{
  (e: 'card-contextmenu', event: MouseEvent, config: CardConfig): void
  (e: 'weather-contextmenu', event: MouseEvent): void
  (e: 'navigation-contextmenu', event: MouseEvent, item: any): void
}>()

// 卡片配置列表
const cards = ref<CardConfig[]>([])

// 布局配置
const layout = ref({
  version: '1.0.0',
  columns: 3
})

// 标志位：防止自己保存的布局触发重新加载
let isSavingLayout = false

// 从 storage 加载布局
async function loadLayout() {
  try {
    const result = await (chrome as any).storage.local.get('dashboardLayout')
    console.log('Loaded dashboardLayout from storage:', result.dashboardLayout)

    // 检查 cards 是否为数组
    if (
      result.dashboardLayout &&
      Array.isArray(result.dashboardLayout.cards) &&
      result.dashboardLayout.cards.length > 0
    ) {
      layout.value = {
        version: result.dashboardLayout.version || '1.0.0',
        columns: result.dashboardLayout.columns || 3
      }
      cards.value = result.dashboardLayout.cards
      console.log('Using existing layout, cards:', cards.value)
    } else {
      // 使用默认布局
      console.log('No valid layout found, using default')
      const defaultCards = [
        {
          id: 'weather-1',
          type: 'weather' as CardType,
          size: '1x1',
          visible: true,
          position: 0
        },
        {
          id: 'work-1',
          type: 'work' as CardType,
          size: '1x1',
          visible: true,
          position: 1
        },
        {
          id: 'navigation-1',
          type: 'navigation' as CardType,
          size: '2x1',
          visible: true,
          position: 2
        }
      ]
      cards.value = defaultCards
      await saveLayout()
      console.log('Saved default layout')
    }
  } catch (error) {
    console.error('Failed to load dashboard layout:', error)
  }
}

// 保存布局
async function saveLayout() {
  try {
    isSavingLayout = true
    await (chrome as any).storage.local.set({
      dashboardLayout: {
        ...layout.value,
        cards: cards.value
      }
    })
    // 延迟重置标志位，确保 storage.onChange 事件已经触发
    setTimeout(() => {
      isSavingLayout = false
    }, 100)
  } catch (error) {
    console.error('Failed to save dashboard layout:', error)
    isSavingLayout = false
  }
}

// 拖拽结束处理
async function onDragEnd() {
  // 更新位置
  cards.value.forEach((card, index) => {
    card.position = index
  })
  await saveLayout()
}

// 处理卡片右键菜单
function handleCardContextMenu(event: MouseEvent, config: CardConfig) {
  console.log('handleCardContextMenu called with config:', config)
  emit('card-contextmenu', event, config)
}

// 处理天气卡片右键菜单
function handleWeatherContextMenu(event: MouseEvent) {
  emit('weather-contextmenu', event)
}

// 处理导航卡片右键菜单
function handleNavigationContextMenu(event: MouseEvent, item: any) {
  emit('navigation-contextmenu', event, item)
}

// 初始化
onMounted(() => {
  loadLayout()

  // 监听 storage 变化，当布局在其他地方被修改时自动刷新
  chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
    if (areaName === 'local' && changes.dashboardLayout) {
      // 如果是自己保存的布局变化，则跳过重新加载
      if (isSavingLayout) {
        console.log('Skip reloading: layout changed by self')
        return
      }
      console.log('Dashboard layout changed in storage, reloading...')
      loadLayout()
    }
  })
})

// 暴露方法供父组件调用
defineExpose({
  updateCardSize: async (cardId: string, newSize: string) => {
    const card = cards.value.find((c) => c.id === cardId)
    if (card) {
      card.size = newSize as any
      await saveLayout()
    }
  },
  toggleCardVisibility: async (cardId: string) => {
    const card = cards.value.find((c) => c.id === cardId)
    if (card) {
      card.visible = !card.visible
      await saveLayout()
    }
  }
})
</script>

<style>
@import '../styles/dashboard-grid.css';
</style>
