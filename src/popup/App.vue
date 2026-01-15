<template>
  <div class="popup">
    <div class="popup-header">
      <h2>仪表盘</h2>
    </div>
    <div class="popup-body">
      <div class="popup-section">
        <div class="popup-item" @click="openNewTab">
          <span class="popup-icon">🏠</span>
          <span>打开新标签页</span>
        </div>
        <div class="popup-item" @click="openSettings">
          <span class="popup-icon">⚙️</span>
          <span>设置</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
function openNewTab() {
  chrome.tabs.create({ url: 'chrome://newtab' })
  window.close()
}

function openSettings() {
  chrome.runtime.openOptionsPage()
  window.close()
}
</script>

<style scoped>
.popup {
  width: 320px;
  min-height: 200px;
  background: white;
  overflow: visible;
}

.popup-header {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.popup-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.popup-body {
  padding: 8px 0;
}

.popup-section {
  display: flex;
  flex-direction: column;
}

.popup-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.popup-item:hover {
  background: #f7fafc;
}

.popup-icon {
  font-size: 1.25rem;
}
</style>
