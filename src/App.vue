<template>
  <div v-if="loading" class="loading">加载中...</div>
  <GameTable v-else />
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue'
import GameTable from './components/GameTable.vue'

const loading = ref(true)

onErrorCaptured((err) => {
  console.error('组件错误:', err)
  return false
})

// 模拟加载完成
setTimeout(() => loading.value = false, 1000)
</script>

<style>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
}
.loading {
  text-align: center;
  padding: 20px;
}
</style>