<template>
  <div class="register-request">
    <header class="user-header">
      <div v-if="currentUser.anonymous">
        当前身份：<strong>访客</strong>
      </div>
      <div v-else>
        当前登录用户：<strong>{{ currentUser.username }}</strong> ({{ currentUser.email }} )
      </div>
    </header>

    <div v-if="currentUser.email === 'guest@localhost'">
      <!-- 访客用户，显示注册申请表单 -->
      <RegisterRequestForm />
    </div>

    <div v-else-if="currentUser.email === 'admin@localhost'">
      <!-- 管理员用户，显示管理员审批表 -->
      <ApproveRegistrations />
    </div>

    <div v-else>
      <p>无权操作。</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import RegisterRequestForm from '@/components/RegisterRequestForm.vue'
import ApproveRegistrations from '@/components/ApproveRegistrations.vue' // 管理员审批界面

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
    if (!response.ok) {
      throw new Error('无法获取用户信息')
    }
    const data = await response.json()
    currentUser.value = data
    console.log(data)
  } catch (err) {
    console.error('获取当前用户失败:', err.message)
  }
})
</script>

<style scoped>
.register-request {
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
</style>
