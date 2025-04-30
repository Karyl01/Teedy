<template>
  <div class="group-chat-panel">
    <header class="user-header">
      <div v-if="currentUser.anonymous">
        当前身份：<strong>访客</strong>
      </div>
      <div v-else>
        当前登录用户：<strong>{{ currentUser.username }}</strong> ({{ currentUser.email }} )
      </div>
    </header>

    <section v-if="!currentUser.anonymous" class="chat-section">
      <p>💬 当前为同组聊天功能预留区域（敬请期待）</p>
    </section>

    <section v-else class="chat-section-disabled">
      <p>⚠️ 请先登录后才能使用聊天功能。</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentUser = ref({
  anonymous: true,
  username: '',
  email: ''
})

onMounted(async () => {
  try {
    const response = await fetch('/api/user', {
      method: 'GET',
      credentials: 'include'
    })
    if (!response.ok) throw new Error('无法获取用户信息')

    const data = await response.json()
    currentUser.value = data
    console.log('[当前用户]', data)
  } catch (err) {
    console.error('获取当前用户失败:', err.message)
  }
})
</script>

<style scoped>
.group-chat-panel {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
}
.user-header {
  background: #f0f0f0;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
}
.chat-section {
  border: 1px solid #ccc;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
}
.chat-section-disabled {
  padding: 15px;
  background: #fff2f2;
  border: 1px solid #f5c2c7;
  color: #a94442;
  border-radius: 6px;
}
</style>
