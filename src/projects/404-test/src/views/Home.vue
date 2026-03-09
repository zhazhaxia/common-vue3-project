<template>
  <div class="home">
    <h2>欢迎来到 {{ projectName }}</h2>
    <p>这是一个基于 Vite + Vue3 + TypeScript 的 Monorepo 项目</p>
    <div class="features">
      <div class="feature">
        <h3>🚀 快速构建</h3>
        <p>按需构建，只构建需要的项目</p>
      </div>
      <div class="feature">
        <h3>🔧 环境隔离</h3>
        <p>支持多环境配置，灵活切换</p>
      </div>
      <div class="feature">
        <h3>📦 模板化</h3>
        <p>基于模板快速创建新项目</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const projectName = import.meta.env.PROJECT_NAME || '未命名项目'
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.home > p {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 3rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.feature h3 {
  font-size: 1.5rem;
  margin-bottom: 0.8rem;
  color: #667eea;
}

.feature p {
  color: #666;
  line-height: 1.6;
}
</style>