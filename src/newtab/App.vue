<template>
  <div class="container">
    <header class="header">
      <h1>欢迎回来</h1>
      <p>{{ currentTime }}</p>
    </header>

    <div class="dashboard">
      <WeatherCard />
      <CheckInCard />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import WeatherCard from './components/WeatherCard.vue'
import CheckInCard from './components/CheckInCard.vue'

const currentTime = ref('')

function updateTime() {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  currentTime.value = now.toLocaleDateString('zh-CN', options)
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
