<template>
  <div class="approve-registrations">
    <h1>待审核注册申请</h1>

    <table class="approval-table" v-if="pendingRequests.length > 0">
      <thead>
        <tr>
          <th>用户名</th>
          <th>邮箱</th>
          <th>存储配额 (字节)</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(request, index) in pendingRequests" :key="index">
          <td>{{ request.username }}</td>
          <td>{{ request.email }}</td>
          <td>{{ request.storage_quota || '未设置' }}</td>
          <td>
            <button @click="approveRequest(index)">同意</button>
            <button @click="rejectRequest(index)">拒绝</button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else>暂无待审批的注册申请。</p>

    <div v-if="message" class="success">{{ message }}</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const pendingRequests = ref([])
const message = ref('')
const error = ref('')

function loadPendingRequests() {
  const stored = JSON.parse(localStorage.getItem('pendingRegistrations') || '[]')
  pendingRequests.value = stored
}

// 使用 x-www-form-urlencoded 格式提交注册
async function approveRequest(index) {
  const request = pendingRequests.value[index]

  try {
    const formData = new URLSearchParams()
    formData.append('username', request.username)
    formData.append('password', request.password)
    formData.append('email', request.email)
    formData.append('storage_quota', request.storage_quota ?? '0')

    const response = await fetch('/api/user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      credentials: 'include',
      body: formData
    })

    if (response.status === 200) {
      pendingRequests.value.splice(index, 1)
      localStorage.setItem('pendingRegistrations', JSON.stringify(pendingRequests.value))

      message.value = `✅ 用户 ${request.username} 注册成功！`
      error.value = ''
    } else {
      const resText = await response.text()
      throw new Error(resText || `注册失败，状态码：${response.status}`)
    }
  } catch (err) {
    error.value = `❌ 注册失败: ${err.message}`
    message.value = ''
  }
}

function rejectRequest(index) {
  pendingRequests.value.splice(index, 1)
  localStorage.setItem('pendingRegistrations', JSON.stringify(pendingRequests.value))
  message.value = '已拒绝并删除申请'
  error.value = ''
}

onMounted(() => {
  loadPendingRequests()
})
</script>

<style scoped>
.approve-registrations {
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
}
.approval-table {
  width: 100%;
  border-collapse: collapse;
}
.approval-table th, .approval-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}
.approval-table th {
  background-color: #f2f2f2;
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
  margin: 0 5px;
}
</style>