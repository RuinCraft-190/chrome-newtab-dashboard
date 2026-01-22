import { ref } from 'vue'
import storage from '@shared/utils/storage'
import type { DashboardLayout, CardConfig, CardSize } from '@shared/types'

// 默认布局配置
function getDefaultLayout(): DashboardLayout {
  return {
    version: '1.0.0',
    columns: 3,
    cards: [
      {
        id: 'weather-1',
        type: 'weather',
        size: '1x1',
        visible: true,
        position: 0
      },
      {
        id: 'work-1',
        type: 'work',
        size: '1x1',
        visible: true,
        position: 1
      },
      {
        id: 'navigation-1',
        type: 'navigation',
        size: '2x1',
        visible: true,
        position: 2
      }
    ]
  }
}

// 布局管理 Composable
export function useDashboardLayout() {
  const layout = ref<DashboardLayout>(getDefaultLayout())
  const loading = ref(true)

  // 加载布局
  async function loadLayout() {
    loading.value = true
    try {
      const data = await storage.get('dashboardLayout')
      if (data && data.cards && data.cards.length > 0) {
        layout.value = data
      } else {
        // 首次加载，使用默认布局
        layout.value = getDefaultLayout()
        await saveLayout()
      }
    } catch (error) {
      console.error('Failed to load dashboard layout:', error)
      layout.value = getDefaultLayout()
    } finally {
      loading.value = false
    }
  }

  // 保存布局
  async function saveLayout() {
    try {
      await storage.set('dashboardLayout', layout.value)
    } catch (error) {
      console.error('Failed to save dashboard layout:', error)
    }
  }

  // 更新卡片尺寸
  async function updateCardSize(cardId: string, newSize: CardSize) {
    const card = layout.value.cards.find((c) => c.id === cardId)
    if (card) {
      card.size = newSize
      await saveLayout()
    }
  }

  // 切换卡片可见性
  async function toggleCardVisibility(cardId: string) {
    const card = layout.value.cards.find((c) => c.id === cardId)
    if (card) {
      card.visible = !card.visible
      await saveLayout()
    }
  }

  // 拖拽后重新排序
  async function reorderCards(fromIndex: number, toIndex: number) {
    const cards = [...layout.value.cards]
    const [movedCard] = cards.splice(fromIndex, 1)
    cards.splice(toIndex, 0, movedCard)

    // 更新位置
    cards.forEach((card, index) => {
      card.position = index
    })

    layout.value.cards = cards
    await saveLayout()
  }

  // 获取可见卡片列表（按位置排序）
  function getVisibleCards() {
    return layout.value.cards
      .filter((c) => c.visible)
      .sort((a, b) => a.position - b.position)
  }

  // 重置为默认布局
  async function resetToDefault() {
    layout.value = getDefaultLayout()
    await saveLayout()
  }

  return {
    layout,
    loading,
    loadLayout,
    saveLayout,
    updateCardSize,
    toggleCardVisibility,
    reorderCards,
    getVisibleCards,
    resetToDefault
  }
}
