<template>
  <div class="child-component">
    <h4>子组件</h4>
    <p>父组件传递的消息: {{ message }}</p>
    <input v-model="localMessage" @input="updateMessage" placeholder="修改消息">
    <button @click="emitCustomEvent">发送自定义事件</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// 定义props
const props = defineProps<{
  message: string
}>()

// 定义事件
const emit = defineEmits<{
  'update:message': [value: string]
  'custom-event': [message: string]
}>()

// 本地状态
const localMessage = ref(props.message)

// 监听props变化
watch(
  () => props.message,
  (newValue) => {
    localMessage.value = newValue
  }
)

// 方法
function updateMessage() {
  emit('update:message', localMessage.value)
}

function emitCustomEvent() {
  emit('custom-event', `子组件发送的消息: ${new Date().toLocaleString()}`)
}
</script>

<style scoped>
.child-component {
  padding: 1rem;
  background: #e8f4f8;
  border-radius: 6px;
  margin: 1rem 0;
}

.child-component h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
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
  margin: 0.5rem 0;
}

button:hover {
  background: #5a6fd8;
}
</style>