<template>
  <div class="register-request-form">
    <h1>申请注册新账户</h1>

    <form @submit.prevent="submitRequest">
      <div class="form-group">
        <label>用户名 <small>(3~50个字符)</small></label>
        <input v-model="username" required minlength="3" maxlength="50" />
      </div>

      <div class="form-group">
        <label>邮箱 <small>(最长100个字符)</small></label>
        <input v-model="email" type="email" required maxlength="100" />
      </div>

      <div class="form-group">
        <label>密码 <small>(8~50个字符)</small></label>
        <input v-model="password" type="password" required minlength="8" maxlength="50" />
      </div>

      <div class="form-group">
        <label>存储配额 <small>(单位：字节，必须为正整数)</small></label>
        <input v-model="storage" type="number" min="1" required />
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
import { ref } from 'vue'

const username = ref('')
const email = ref('')
const password = ref('')
const storage = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

async function submitRequest() {
  loading.value = true
  message.value = ''
  error.value = ''

  // 校验输入限制
  if (username.value.length < 3 || username.value.length > 50) {
    error.value = '用户名长度应为 3 ~ 50 个字符'
    loading.value = false
    return
  }
  if (password.value.length < 8 || password.value.length > 50) {
    error.value = '密码长度应为 8 ~ 50 个字符'
    loading.value = false
    return
  }
  if (email.value.length < 1 || email.value.length > 100) {
    error.value = '邮箱长度应在 1 ~ 100 个字符之间'
    loading.value = false
    return
  }
  if (!/^[1-9]\d*$/.test(storage.value)) {
    error.value = '存储配额必须是正整数（单位：字节）'
    loading.value = false
    return
  }

  try {
    const pendingRequests = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]')

    pendingRequests.push({
      username: username.value,
      email: email.value,
      password: password.value,
      storage_quota: Number(storage.value)
    })

    localStorage.setItem('pendingRegistrations', JSON.stringify(pendingRequests))

    message.value = '申请保存成功，请等待管理员审核！'
    username.value = ''
    email.value = ''
    password.value = ''
    storage.value = ''
  } catch (err) {
    error.value = '保存失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-request-form {
  max-width: 400px;
  margin: 30px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.form-group {
  margin-bottom: 15px;
}
small {
  color: #888;
  font-size: 12px;
  margin-left: 5px;
}
.success {
  color: green;
  margin-top: 20px;
}
.error {
  color: red;
  margin-top: 20px;
}
button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
}
button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
</style>
