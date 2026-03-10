<template>
  <div class="home">
    <h2>首页</h2>
    <p>欢迎来到 {{ projectName }} 项目！</p>
    <p>这是一个基于 Vue3 + TypeScript + Vite 的单页应用。</p>
    <p>当前环境: {{ currentEnv }}</p>
    
    <!-- 计算属性示例 -->
    <div class="section">
      <h3>计算属性示例</h3>
      <input v-model="message" placeholder="请输入消息">
      <p>原始消息: {{ message }}</p>
      <p>反转消息: {{ reversedMessage }}</p>
      <p>消息长度: {{ messageLength }}</p>
    </div>
    
    <!-- 方法示例 -->
    <div class="section">
      <h3>方法示例</h3>
      <button @click="greet">打招呼</button>
      <button @click="clearMessage">清空消息</button>
      <p>{{ greeting }}</p>
    </div>
    
    <!-- 表单处理示例 -->
    <div class="section">
      <h3>表单处理示例</h3>
      <form @submit.prevent="handleSubmit">
        <div>
          <label>姓名:</label>
          <input v-model="formData.name" type="text" placeholder="请输入姓名">
        </div>
        <div>
          <label>邮箱:</label>
          <input v-model="formData.email" type="email" placeholder="请输入邮箱">
        </div>
        <button type="submit">提交</button>
      </form>
      <p v-if="submittedData">提交的数据: {{ submittedData }}</p>
    </div>
    
    <!-- 网络请求示例 -->
    <div class="section">
      <h3>网络请求示例</h3>
      <button @click="fetchData">获取数据</button>
      <div v-if="loading">加载中...</div>
      <div v-else-if="apiData">
        <p>API 响应: {{ apiData }}</p>
      </div>
      <div v-else-if="error">
        <p style="color: red;">错误: {{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useCounterStore } from '../store/counter'

// 环境变量
const projectName = import.meta.env.PROJECT_NAME || '未命名项目'
const currentEnv = computed(() => import.meta.env.ENV_TYPE || 'unknown')

// Pinia store
const counterStore = useCounterStore()

// 响应式数据
const message = ref('Hello Vue3!')
const greeting = ref('')
const formData = ref({
  name: '',
  email: ''
})
const submittedData = ref('')
const loading = ref(false)
const apiData = ref('')
const error = ref('')

// 计算属性
const reversedMessage = computed(() => {
  return message.value.split('').reverse().join('')
})

const messageLength = computed(() => {
  return message.value.length
})

// 方法
function greet() {
  greeting.value = `Hello, ${formData.value.name || 'Guest'}!`
}

function clearMessage() {
  message.value = ''
  greeting.value = ''
}

function handleSubmit() {
  submittedData.value = JSON.stringify(formData.value, null, 2)
  console.log('表单提交:', formData.value)
}

// 网络请求
async function fetchData() {
  loading.value = true
  error.value = ''
  
  try {
    // 模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    apiData.value = JSON.stringify({
      success: true,
      data: {
        message: '请求成功',
        timestamp: new Date().toISOString()
      }
    }, null, 2)
  } catch (err) {
    error.value = '请求失败，请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.home {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.home h2 {
  color: #667eea;
  margin-bottom: 1.5rem;
}

.home h3 {
  color: #555;
  margin: 1.5rem 0 1rem 0;
}

.home p {
  margin: 0.8rem 0;
  line-height: 1.6;
}

.section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 6px;
}

input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 0.5rem 0;
  width: 100%;
  max-width: 300px;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #667eea;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
  margin: 0.5rem 0.5rem 0.5rem 0;
}

button:hover {
  background: #5a6fd8;
}

form div {
  margin: 1rem 0;
}

form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
</style>