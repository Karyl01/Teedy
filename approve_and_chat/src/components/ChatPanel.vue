<template>
  <div class="chat-panel">


    <div class="chat-body">
      <div
        class="chat-row"
        v-for="(msg, index) in messages"
        :key="index"
      >
        <div class="user-name">{{ msg.user }}</div>
        <div class="user-msg">{{ msg.text }}</div>
      </div>
    </div>

    <div class="chat-input">
      <input
        v-model="inputText"
        @keyup.enter="sendMessage"
        placeholder="请输入消息..."
      />
      <button @click="sendMessage">发送</button>
    </div>
  </div>
</template>



<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// ✅ 从 localStorage 获取当前用户和群组
const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}').username || 'anonymous'
const currentGroup = localStorage.getItem('currentGroup') || '默认群组'

const messages = ref([])
const inputText = ref('')
let pollInterval = null

async function sendMessage() {
  const content = inputText.value.trim()
  if (!content) return

  // 本地预览显示
  messages.value.push({
    user: currentUser,
    text: content
  })

  inputText.value = ''

  // ✅ 向后端发送消息
  try {
    const res = await fetch('http://localhost:5200/append-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        group: currentGroup,
        user: currentUser,
        text: content
      })
    })

    if (!res.ok) {
      console.warn(`⚠️ 消息发送失败：状态码 ${res.status}`)
    }
  } catch (err) {
    console.error('❌ 消息发送出错:', err.message)
  }
}


// ✅ 从后端获取群组聊天记录
async function fetchChatLog() {
  try {
    const res = await fetch('http://localhost:5200/get-chat-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ group: currentGroup })
    })

    if (res.ok) {
      const data = await res.json()
      messages.value = data.messages || []
    } else {
      console.warn('⚠️ 获取聊天记录失败')
    }
  } catch (err) {
    console.error('❌ 请求聊天记录失败:', err.message)
  }
}

onMounted(() => {
  fetchChatLog()
  pollInterval = setInterval(fetchChatLog, 100) // 每 5 秒轮询
})

onBeforeUnmount(() => {
  clearInterval(pollInterval)
});
</script>





<style scoped>
.chat-panel {
  max-width: 600px;
  margin: 30px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: Arial, sans-serif;
  background-color: #fdfdfd;
}
.chat-body {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
}
.chat-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 10px;
}
.user-name {
  font-weight: bold;
  width: 100px;
  flex-shrink: 0;
}
.user-msg {
  background-color: #eef;
  padding: 8px 12px;
  border-radius: 6px;
  max-width: 70%;
}
.chat-input {
  display: flex;
  gap: 10px;
}
.chat-input input {
  flex: 1;
  padding: 8px;
}
.chat-input button {
  padding: 8px 16px;
}
</style>
