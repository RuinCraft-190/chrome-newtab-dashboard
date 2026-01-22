<template>
  <div class="nav-cards" :style="{ gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }">
    <template v-if="displayItems.length > 0">
      <a
        v-for="item in displayItems"
        :key="item.id"
        :href="item.url"
        target="_blank"
        class="nav-card"
        :title="item.name"
        @contextmenu.prevent="handleContextMenu($event, item)"
      >
        <div class="nav-icon">
          <img v-if="item.icon" :src="item.icon" :alt="item.name" @error="handleIconError($event, item)" />
          <span v-else class="default-icon">{{ getInitials(item.name) }}</span>
        </div>
        <span class="nav-name">{{ item.name }}</span>
        <button class="delete-btn" @click.prevent.stop="removeItem(item.id)" title="删除">
          ×
        </button>
      </a>
    </template>

    <button class="nav-card add-card" @click="showAddDialog = true" title="添加导航">
      <div class="add-icon">
        <span>+</span>
      </div>
    </button>

    <!-- 添加/编辑导航对话框 -->
    <div class="dialog-overlay" v-if="showAddDialog" @click.self="showAddDialog = false">
      <div class="dialog">
        <h3>{{ isEditing ? '编辑网页导航' : '添加网页导航' }}</h3>
        <form @submit.prevent="isEditing ? updateNavigation() : addNavigation()">
          <div class="form-group">
            <label for="navName">名称</label>
            <input
              id="navName"
              v-model="newItem.name"
              type="text"
              placeholder="例如：GitHub"
              required
              maxlength="20"
            />
          </div>
          <div class="form-group">
            <label for="navUrl">网址</label>
            <input
              id="navUrl"
              v-model="newItem.url"
              type="url"
              placeholder="https://github.com"
              required
              @blur="onUrlBlur"
            />
            <div class="icon-preview" v-if="previewIcon">
              <span class="preview-label">图标预览：</span>
              <img :src="previewIcon" alt="预览" />
            </div>
          </div>
          <div class="dialog-actions">
            <button type="button" class="btn-cancel" @click="cancelDialog">取消</button>
            <button type="submit" class="btn-confirm" :disabled="isAdding">
              {{ isAdding ? (isEditing ? '保存中...' : '添加中...') : (isEditing ? '保存' : '添加') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import type { NavigationItem, CardSize } from '@shared/types'
import storage from '@shared/utils/storage'

// 接收卡片尺寸
const props = defineProps<{
  cardSize?: CardSize
}>()

// 定义 emit
const emit = defineEmits<{
  (e: 'navigation-contextmenu', event: MouseEvent, item: NavigationItem): void
}>()

const navigationItems = ref<NavigationItem[]>([])

// 根据卡片尺寸计算显示的导航项数量
const displayItems = computed(() => {
  const maxItems = {
    '1x1': 4,      // 1x1 显示 4 个（2x2 布局）
    '1x2': 6,      // 1x2 显示 6 个（2x3 布局）
    '2x1': 8,      // 2x1 显示 8 个（4x2 布局）
    '2x2': 12      // 2x2 显示 12 个（4x3 布局）
  }
  const limit = maxItems[props.cardSize || '1x1']
  return navigationItems.value.slice(0, limit)
})

// 根据卡片尺寸计算网格列数
const gridColumns = computed(() => {
  const columns = {
    '1x1': 2,
    '1x2': 2,
    '2x1': 4,
    '2x2': 4
  }
  return columns[props.cardSize || '1x1']
})
const showAddDialog = ref(false)
const isAdding = ref(false)
const isEditing = ref(false)
const editingItemId = ref<string | null>(null)
const previewIcon = ref<string>()

const newItem = ref({
  name: '',
  url: ''
})

onMounted(() => {
  loadNavigation()
  setupEventListeners()
})

onBeforeUnmount(() => {
  removeEventListeners()
})

function setupEventListeners() {
  window.addEventListener('add-navigation', onAddNavigationEvent)
  window.addEventListener('edit-navigation', onEditNavigationEvent)
  window.addEventListener('delete-navigation', onDeleteNavigationEvent)
}

function removeEventListeners() {
  window.removeEventListener('add-navigation', onAddNavigationEvent)
  window.removeEventListener('edit-navigation', onEditNavigationEvent)
  window.removeEventListener('delete-navigation', onDeleteNavigationEvent)
}

// 处理右键菜单
function handleContextMenu(event: MouseEvent, item: NavigationItem) {
  emit('navigation-contextmenu', event, item)
}

// 事件处理函数
function onAddNavigationEvent() {
  resetForm()
  showAddDialog.value = true
}

function onEditNavigationEvent(event: CustomEvent) {
  const item = event.detail
  startEditing(item)
}

function onDeleteNavigationEvent(event: CustomEvent) {
  const item = event.detail
  removeItem(item.id)
}

async function loadNavigation() {
  const data = await storage.get('navigation')
  navigationItems.value = data?.items || []
}

async function onUrlBlur() {
  if (!newItem.value.url) return

  let url = newItem.value.url.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  previewIcon.value = await fetchFavicon(url)
}

async function addNavigation() {
  if (!newItem.value.name || !newItem.value.url) return

  isAdding.value = true

  let url = newItem.value.url.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  const item: NavigationItem = {
    id: Date.now().toString(),
    name: newItem.value.name.trim(),
    url,
    icon: previewIcon.value || await fetchFavicon(url),
    createdAt: Date.now()
  }

  const data = await storage.get('navigation')
  const items = data?.items || []
  items.push(item)

  await storage.set('navigation', { items })
  navigationItems.value = items

  resetForm()
  showAddDialog.value = false
  isAdding.value = false
}

async function updateNavigation() {
  if (!newItem.value.name || !newItem.value.url || !editingItemId.value) return

  isAdding.value = true

  let url = newItem.value.url.trim()
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  const data = await storage.get('navigation')
  const items = data?.items || []
  const index = items.findIndex((item: NavigationItem) => item.id === editingItemId.value)

  if (index !== -1) {
    items[index] = {
      ...items[index],
      name: newItem.value.name.trim(),
      url,
      icon: previewIcon.value || await fetchFavicon(url)
    }

    await storage.set('navigation', { items })
    navigationItems.value = items
  }

  resetForm()
  showAddDialog.value = false
  isAdding.value = false
}

async function removeItem(id: string) {
  if (!confirm('确定要删除这个导航吗？')) return

  const data = await storage.get('navigation')
  const items = data?.items?.filter((item: NavigationItem) => item.id !== id) || []

  await storage.set('navigation', { items })
  navigationItems.value = items
}

function startEditing(item: NavigationItem) {
  isEditing.value = true
  editingItemId.value = item.id
  newItem.value = {
    name: item.name,
    url: item.url
  }
  previewIcon.value = item.icon
  showAddDialog.value = true
}

function cancelDialog() {
  resetForm()
  showAddDialog.value = false
}

function resetForm() {
  isEditing.value = false
  editingItemId.value = null
  newItem.value = { name: '', url: '' }
  previewIcon.value = undefined
  isAdding.value = false
}

async function fetchFavicon(url: string): Promise<string | undefined> {
  try {
    const urlObj = new URL(url)
    const domain = urlObj.hostname
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  } catch {
    return undefined
  }
}

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase()
}

function handleIconError(event: Event, item: NavigationItem) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}
</script>

<style scoped>
.nav-cards {
  display: grid;
  gap: 12px;
  height: 100%;
}

.nav-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.nav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.nav-card:hover .delete-btn {
  opacity: 1;
}

.nav-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6px;
}

.nav-icon img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.default-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.nav-name {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
  border: none;
  background: rgba(220, 53, 69, 0.9);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  line-height: 1;
  opacity: 0;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: rgb(200, 35, 51);
  transform: scale(1.1);
}

/* 添加卡片 */
.add-card {
  min-height: 70px;
  justify-content: center;
  background: rgba(255, 255, 255, 0.6);
  border: 2px dashed rgba(102, 126, 234, 0.3);
  box-shadow: none;
}

.add-card:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(102, 126, 234, 0.6);
}

.add-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: 300;
  line-height: 1;
  transition: transform 0.2s ease;
}

.add-card:hover .add-icon {
  transform: scale(1.1) rotate(90deg);
}

/* 对话框样式 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: white;
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog h3 {
  margin: 0 0 24px 0;
  font-size: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.icon-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.preview-label {
  font-size: 0.85rem;
  color: #868e96;
}

.icon-preview img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.dialog-actions button {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f1f3f5;
  color: #495057;
}

.btn-cancel:hover {
  background: #e9ecef;
}

.btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-confirm:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ============ 响应式调整 ============ */
@media (max-width: 480px) {
  .nav-card {
    padding: 10px 6px;
  }

  .nav-icon {
    width: 36px;
    height: 36px;
  }

  .nav-icon img {
    width: 24px;
    height: 24px;
  }

  .default-icon {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }

  .nav-name {
    font-size: 11px;
  }
}
</style>
