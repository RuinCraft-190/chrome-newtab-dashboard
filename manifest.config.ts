import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: '新标签页仪表盘',
  version: '1.0.0',
  description: '显示天气和签到状态的 Chrome 新标签页扩展',
  icons: {
    '16': 'icons/icon16.png',
    '48': 'icons/icon48.png',
    '128': 'icons/icon128.png'
  },
  chrome_url_overrides: {
    newtab: 'src/newtab/index.html'
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  action: {
    default_icon: {
      '16': 'icons/icon16.png',
      '48': 'icons/icon48.png'
    }
  },
  options_page: 'src/options/index.html',
  permissions: [
    'storage',
    'alarms'
  ],
  host_permissions: [
    'https://*.qweather.com/*',
    'https://*.qweatherapi.com/*'
  ]
})
