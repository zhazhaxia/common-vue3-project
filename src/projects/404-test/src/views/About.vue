<template>
  <div class="about">
    <h2>关于 {{ projectName }}</h2>
    <div class="info">
      <h3>项目信息</h3>
      <ul>
        <li><strong>项目名称:</strong> {{ projectName }}</li>
        <li><strong>当前环境:</strong> {{ currentEnv }}</li>
        <li><strong>API地址:</strong> {{ apiBaseUrl }}</li>
        <li><strong>应用ID:</strong> {{ appId }}</li>
      </ul>
    </div>
    <div class="common-demo">
      <h3>公共工具示例</h3>
      <button @click="testCommonUtils">测试公共工具</button>
      <p v-if="commonResult">结果: {{ commonResult }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const projectName = import.meta.env.PROJECT_NAME || '未命名项目'
const commonResult = ref<string | null>(null)

const currentEnv = computed(() => import.meta.env.ENV_TYPE || 'unknown')
const apiBaseUrl = computed(() => import.meta.env.VITE_APP_API_BASE_URL || 'not configured')
const appId = computed(() => import.meta.env.VITE_APP_APP_ID || 'not configured')

const testCommonUtils = () => {
  commonResult.value = '公共工具功能正常（请实现 src/common/utils/index.ts）'
}
</script>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #333;
}

.info {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
}

.info h3 {
  margin-top: 0;
  color: #667eea;
}

.info ul {
  list-style: none;
  padding: 0;
}

.info li {
  padding: 0.8rem 0;
  border-bottom: 1px solid #eee;
  font-size: 1.1rem;
}

.info li:last-child {
  border-bottom: none;
}

.info strong {
  color: #333;
  margin-right: 1rem;
}

.common-demo {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.common-demo h3 {
  margin-top: 0;
  color: #667eea;
}

.common-demo button {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.common-demo button:hover {
  background: #5568d3;
}

.common-demo p {
  margin-top: 1rem;
  color: #666;
}
</style>