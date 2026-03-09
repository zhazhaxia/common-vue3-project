<template>
  <div id="app">
    <header>
      <h1>{{ projectName }} - Vue3 + TypeScript 项目3</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/about">关于</router-link>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
    <footer>
      <p>当前环境: {{ currentEnv }}</p>
      <p>API地址: {{ apiBaseUrl }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const projectName = import.meta.env.PROJECT_NAME || '未命名项目'
const currentEnv = computed(() => import.meta.env.ENV_TYPE || 'unknown')
const apiBaseUrl = computed(() => import.meta.env.VITE_APP_API_BASE_URL || '未配置')
</script>

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