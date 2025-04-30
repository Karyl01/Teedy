<template>
  <div class="group-list">
    <h2>当前群组及成员列表</h2>

    <table v-if="groups.length > 0">
      <thead>
        <tr>
          <th>#</th>
          <th>群组名称</th>
          <th>父群组</th>
          <th>成员列表</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(group, index) in groups" :key="group.name">
          <td>{{ index + 1 }}</td>
          <td>{{ group.name }}</td>
          <td>{{ group.parent || '无' }}</td>
          <td>
            <ul>
              <li v-for="member in group.members" :key="member">
                <span
                  class="status-dot"
                  :class="{ online: onlineUsers.includes(member), offline: !onlineUsers.includes(member) }"
                ></span>
                {{ member }}
              </li>
            </ul>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-else> 暂无群组信息。</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const groups = ref([])
const onlineUsers = ref([])
let intervalId = null

// 获取群组及成员信息
async function fetchGroupsAndStatus() {
  try {
    const res = await fetch('/api/group?sort_column=0&asc=true', {
      method: 'GET',
      credentials: 'include'
    })

    if (!res.ok) {
      console.warn(` 请求失败，状态码：${res.status}`)
      return
    }

    const data = await res.json()
    const groupList = data.groups || []

    // 获取每个群组的成员详情
    const groupDetails = await Promise.all(
      groupList.map(async (group) => {
        try {
          const detailRes = await fetch(`/api/group/${encodeURIComponent(group.name)}`, {
            method: 'GET',
            credentials: 'include'
          })

          if (!detailRes.ok) {
            console.warn(`️ 获取群组 ${group.name} 详情失败，状态码：${detailRes.status}`)
            return { ...group, members: [] }
          }

          const detailData = await detailRes.json()
          return { ...group, members: detailData.members || [] }
        } catch (error) {
          console.error(` 获取群组 ${group.name} 成员失败:`, error.message)
          return { ...group, members: [] }
        }
      })
    )

    groups.value = groupDetails
    console.log(' 群组及成员已更新')

    // ✅ 当前用户所属群组查找逻辑
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}')
    if (userData.username) {
      const userGroup = groupDetails.find(group =>
        group.members.includes(userData.username)
      )
      if (userGroup) {
        console.log(`✅ 用户 ${userData.username} 属于群组: ${userGroup.name}`)
        localStorage.setItem('currentGroup', userGroup.name)
      } else {
        console.warn('⚠️ 未找到用户所属群组')
        localStorage.removeItem('currentGroup')
      }
    }



    //  提取群组名并发送到后端
    const groupNames = groupDetails.map(g => g.name)
    try {
      const initRes = await fetch('http://localhost:5200/init-group-chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ groups: groupNames })
      })

      if (!initRes.ok) {
        console.warn(` 群组聊天文件创建失败，状态码：${initRes.status}`)
      } else {
        console.log(' 已请求后端为群组生成聊天记录文件')
      }
    } catch (err) {
      console.error(' 创建群组聊天记录文件失败:', err.message)
    }

    // 🔁 同步获取在线用户列表
    const onlineRes = await fetch('http://localhost:5200/online-users')
    if (onlineRes.ok) {
      const onlineData = await onlineRes.json()
      onlineUsers.value = onlineData.users || []
    } else {
      console.warn(` 无法获取在线用户，状态码：${onlineRes.status}`)
    }

  } catch (err) {
    console.error(' 请求群组或在线状态失败:', err.message)
  }
}

onMounted(() => {
  fetchGroupsAndStatus()
  intervalId = setInterval(fetchGroupsAndStatus, 10000)
})

onBeforeUnmount(() => {
  clearInterval(intervalId)
})
</script>

<style scoped>
.group-list {
  max-width: 900px;
  margin: 30px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
th, td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
  vertical-align: top;
}
thead {
  background-color: #f2f2f2;
}
ul {
  margin: 0;
  padding-left: 1em;
}
.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 6px;
  border-radius: 50%;
}
.status-dot.online {
  background-color: #4CAF50; /* 绿色 */
}
.status-dot.offline {
  background-color: #F44336; /* 红色 */
}
</style>
