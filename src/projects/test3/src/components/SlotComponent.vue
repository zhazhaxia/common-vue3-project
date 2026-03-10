<template>
  <div class="slot-component">
    <div class="header">
      <slot name="header">默认头部</slot>
    </div>
    <div class="content">
      <slot>默认内容</slot>
    </div>
    <div class="footer">
      <slot name="footer">默认底部</slot>
    </div>
  </div>
</template>

<script setup lang="ts">
// 插槽组件
</script>

<style scoped>
.slot-component {
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
  margin: 1rem 0;
}

.header {
  background: #f0f0f0;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}

.content {
  padding: 1.5rem;
  background: white;
}

.footer {
  background: #f0f0f0;
  padding: 1rem;
  border-top: 1px solid #ddd;
  text-align: center;
}
</style>
