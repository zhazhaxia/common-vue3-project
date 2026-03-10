<template>
  <div class="about">
    <h2>关于 {{ projectName }}</h2>
    <p>这是 {{ projectName }} 项目的关于页面。</p>
    <p>项目使用了以下技术栈：</p>
    <ul>
      <li>Vue 3</li>
      <li>TypeScript</li>
      <li>Vite</li>
      <li>Vue Router</li>
      <li>Pinia</li>
    </ul>
    
    <!-- 组件通信示例 -->
    <div class="section">
      <h3>组件通信示例</h3>
      <child-component 
        :message="parentMessage"
        @update:message="parentMessage = $event"
        @custom-event="handleCustomEvent"
      />
      <p>父组件接收的消息: {{ childMessage }}</p>
    </div>
    

    
    <!-- 插槽示例 -->
    <div class="section">
      <h3>插槽示例</h3>
      <slot-component>
        <template #header>
          <h4>自定义头部</h4>
        </template>
        <p>默认插槽内容</p>
        <template #footer>
          <p>自定义底部</p>
        </template>
      </slot-component>
    </div>
    
    <!-- 路由传参示例 -->
    <div class="section">
      <h3>路由传参示例</h3>
      <button @click="navigateWithParams">带参数导航</button>
      <p v-if="routeParams">路由参数: {{ routeParams }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const projectName = import.meta.env.PROJECT_NAME || '未命名项目'
const router = useRouter()
const route = useRoute()

// 组件通信
const parentMessage = ref('来自父组件的消息')
const childMessage = ref('')

function handleCustomEvent(message: string) {
  childMessage.value = message
  console.log('接收到子组件事件:', message)
}

// 路由传参
const routeParams = ref('')

function navigateWithParams() {
  router.push({
    path: '/about',
    query: {
      id: '123',
      name: 'test'
    }
  })
}

// 生命周期
onMounted(() => {
  // 检查路由参数
  if (route.query) {
    routeParams.value = JSON.stringify(route.query, null, 2)
  }
})
</script>

<style scoped>
.about {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.about h2 {
  color: #667eea;
  margin-bottom: 1.5rem;
  font-size: 2rem;
}

.about h3 {
  color: #555;
  margin: 1.5rem 0 1rem 0;
}

.about p {
  margin: 0.8rem 0;
  line-height: 1.6;
}

.about ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.about li {
  margin: 0.5rem 0;
}

.section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 6px;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #667eea;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
  margin: 0.5rem 0;
}

button:hover {
  background: #5a6fd8;
}
</style>