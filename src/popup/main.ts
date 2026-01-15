import { createApp } from 'vue'
import App from './App.vue'
import '../newtab/styles/global.css'

// Override global styles for popup
const style = document.createElement('style')
style.textContent = `
  body {
    background: white !important;
    min-height: auto !important;
    width: auto !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  #app {
    width: 100% !important;
    height: auto !important;
    min-height: 200px !important;
  }
  html {
    width: auto !important;
    height: auto !important;
  }
`
document.head.appendChild(style)

createApp(App).mount('#app')
