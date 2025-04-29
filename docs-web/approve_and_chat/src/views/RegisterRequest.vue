<template>
  <div class="register-request">
    <header class="user-header">
      <div v-if="currentUser.anonymous">
        当前身份：<strong>访客</strong>
      </div>
      <div v-else>
        当前登录用户：<strong>{{ currentUser.username }}</strong> ({{ currentUser.email }})
      </div>
    </header>

    <h1>申请注册新账户</h1>

    <form @submit.prevent="submitRequest">
      <div class="form-group">
        <label>用户名</label>
        <input v-model="username" required />
      </div>

      <div class="form-group">
        <label>邮箱</label>
        <input v-model="email" type="email" required />
      </div>

      <div class="form-group">
        <label>密码</label>
        <input v-model="password" type="password" required />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? '提交中...' : '提交申请' }}
      </button>
    </form>

    <div v-if="message" class="success">{{ message }}</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 注册表单数据
const username = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

// 当前用户信息
const currentUser = ref({
  anonymous: true, // 默认访客
  username: '',
  email: ''
})

// 页面加载时调用 /api/user 获取当前用户信息
onMounted(async () => {
  try {
    const response = await fetch('/api/user', {
      method: 'GET',
      credentials: 'include'  // 带上cookie（如果有）
    })
    if (!response.ok) {
      throw new Error('无法获取用户信息')
    }
    const data = await response.json()
    currentUser.value = data
  } catch (err) {
    console.error('获取当前用户失败:', err.message)
  }
})

// 提交注册申请
async function submitRequest() {
  loading.value = true
  message.value = ''
  error.value = ''

  try {
    const response = await fetch('/api/user/registration-request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        email: email.value,
        password: password.value
      })
    })

    if (!response.ok) {
      const resData = await response.json()
      throw new Error(resData.message || '请求失败')
    }

    message.value = '申请提交成功，请等待管理员审核！'
    username.value = ''
    email.value = ''
    password.value = ''
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-request {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.form-group {
  margin-bottom: 15px;
}
.success {
  color: green;
  margin-top: 20px;
}
.error {
  color: red;
  margin-top: 20px;
}
.user-header {
  background: #f0f0f0;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 20px;
}
</style>
