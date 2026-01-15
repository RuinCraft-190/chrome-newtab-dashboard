<template>
  <div class="nav-cards">
    <template v-if="navigationItems.length > 0">
      <a
        v-for="item in navigationItems"
        :key="item.id"
        :href="item.url"
        target="_blank"
        class="nav-card"
        :title="item.name"
      >
        <div class="nav-icon">
          <img v-if="item.icon" :src="item.icon" :alt="item.name" @error="handleIconError($event, item)" />
          <span v-else class="default-icon">{{ getInitials(item.name) }}</span>
        </div>
        <span class="nav-name">{{ item.name }}</span>
        <button class="delete-btn" @click.prevent="removeItem(item.id)" title="删除">
          ×
        </button>
      </a>
    </template>

    <button class="nav-card add-card" @click="showAddDialog = true" title="添加导航">
      <div class="add-icon">
        <span>+</span>
      </div>
    </button>

    <!-- 添加导航对话框 -->
    <div class="dialog-overlay" v-if="showAddDialog" @click.self="showAddDialog = false">
      <div class="dialog">
        <h3>添加网页导航</h3>
        <form @submit.prevent="addNavigation">
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
            <button type="button" class="btn-cancel" @click="showAddDialog = false">取消</button>
            <button type="submit" class="btn-confirm" :disabled="isAdding">
              {{ isAdding ? '添加中...' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { NavigationItem } from '@shared/types'
import storage from '@shared/utils/storage'

const navigationItems = ref<NavigationItem[]>([])
const showAddDialog = ref(false)
const isAdding = ref(false)
const previewIcon = ref<string>()

const newItem = ref({
  name: '',
  url: ''
})

onMounted(() => {
  loadNavigation()
})

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

  // 重置表单
  newItem.value = { name: '', url: '' }
  previewIcon.value = undefined
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
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.nav-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.nav-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.nav-card:hover .delete-btn {
  opacity: 1;
}

.nav-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.nav-icon img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.default-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.nav-name {
  font-size: 13px;
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
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(220, 53, 69, 0.9);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
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
  min-height: 88px;
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
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
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

@media (max-width: 480px) {
  .nav-cards {
    grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
    gap: 12px;
  }

  .nav-card {
    padding: 12px 8px;
  }

  .nav-icon {
    width: 40px;
    height: 40px;
  }

  .nav-icon img {
    width: 28px;
    height: 28px;
  }

  .default-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .nav-name {
    font-size: 12px;
  }
}
</style>
