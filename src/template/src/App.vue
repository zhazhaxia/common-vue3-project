<template>
  <div id="app">
    <header>
      <h1>{{ projectName }} - Vue3 + TypeScript 项目</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/about">关于</router-link>
      </nav>
      <div class="counter">
        <h3>{{ counterStore.name }}</h3>
        <p>当前值: {{ counterStore.count }}</p>
        <p>双倍值: {{ counterStore.doubleCount }}</p>
        <p>带前缀的值: {{ counterStore.getCountWithName('计数器') }}</p>
        <div class="counter-buttons">
          <button @click="counterStore.increment">增加</button>
          <button @click="counterStore.decrement">减少</button>
          <button @click="counterStore.reset">重置</button>
        </div>
      </div>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <p>当前环境: {{ currentEnv }}</p>
      <p>API地址: {{ apiBaseUrl }}</p>
      <p>页面加载时间: {{ loadTime }}</p>
      <p>计数器变化次数: {{ countChangeTimes }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { useCounterStore } from './store/counter'

// 环境变量
const projectName = import.meta.env.PROJECT_NAME || '未命名项目'
const currentEnv = computed(() => import.meta.env.ENV_TYPE || 'unknown')
const apiBaseUrl = computed(() => import.meta.env.VITE_APP_API_BASE_URL || '未配置')

// Pinia store
const counterStore = useCounterStore()

// 响应式数据
const loadTime = ref('')
const countChangeTimes = ref(0)
const timer = ref<number | null>(null)

// 生命周期 - 组件挂载
onMounted(() => {
  console.log('组件已挂载')
  loadTime.value = new Date().toLocaleString()
  
  // 模拟定时器
  timer.value = window.setInterval(() => {
    console.log('定时器执行')
  }, 5000)
})

// 生命周期 - 组件卸载
onUnmounted(() => {
  console.log('组件已卸载')
  if (timer.value) {
    clearInterval(timer.value)
  }
})

// 监听数据变化
watch(
  () => counterStore.count,
  (newValue, oldValue) => {
    console.log(`计数器从 ${oldValue} 变为 ${newValue}`)
    countChangeTimes.value++
  }
)

// 深度监听示例
watch(
  counterStore,
  (newStore) => {
    console.log('Store 发生变化:', newStore)
  },
  { deep: true }
)
</script>

<style scoped>
.counter {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255,255,255,0.2);
  border-radius: 8px;
}

.counter h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.counter p {
  margin: 0.3rem 0;
}

.counter-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.counter-buttons button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: rgba(255,255,255,0.3);
  color: white;
  cursor: pointer;
  transition: background 0.3s;
}

.counter-buttons button:hover {
  background: rgba(255,255,255,0.5);
}
</style>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

header h1 {
  margin: 0 0 1rem 0;
  font-size: 1.8rem;
}

nav {
  display: flex;
  gap: 1.5rem;
}

nav a {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: background 0.3s;
}

nav a:hover {
  background: rgba(255,255,255,0.2);
}

main {
  flex: 1;
  padding: 2rem;
  background: #f5f7fa;
}

footer {
  background: white;
  padding: 1.5rem 2rem;
  text-align: center;
  color: #666;
  box-shadow: 0 -2px 12px rgba(0,0,0,0.05);
}

footer p {
  margin: 0.5rem 0;
}
</style>