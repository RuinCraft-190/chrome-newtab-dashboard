---
description: 调试 Chrome 扩展
---

调试 Chrome 扩展的各个组件。

## Background Service Worker 调试

1. 打开 chrome://extensions/
2. 找到扩展，点击 "Service Worker" 链接
3. 在 DevTools 中查看 console 输出

## Content Script 调试

1. 打开目标网页
2. 按 F12 打开 DevTools
3. 在 Console 中查看 content script 的日志
4. 使用 `chrome.runtime.sendMessage` 测试消息传递

## 新标签页调试

1. 打开新标签页
2. 按 F12 打开 DevTools
3. 查看组件状态和网络请求

## 常用调试命令

### 查看存储数据
```javascript
chrome.storage.local.get(null, console.log)
```

### 清除存储数据
```javascript
chrome.storage.local.clear()
```

### 手动触发签到
```javascript
chrome.runtime.sendMessage({ action: 'CHECK_IN' })
```

### 查看 alarms
```javascript
chrome.alarms.getAll(console.log)
```

### 测试适配器匹配
```javascript
// 在目标网页的控制台中
const url = window.location.href
console.log('Current URL:', url)
```

## 错误日志收集

在代码中添加错误处理：
```typescript
try {
  // 操作
} catch (error) {
  console.error('Operation failed:', error)
  chrome.storage.local.set({
    lastError: {
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack
    }
  })
}
```
