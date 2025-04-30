// login-notify-server.js

import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'

const app = express()
const PORT = 5200
const filePath = path.resolve('../public/chat/isOnline.txt')

//  中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//  日志中间件
app.use((req, res, next) => {
  console.log(` 收到请求: ${req.method} ${req.url}`)
  next()
})

//  工具方法：将用户添加到 isOnline.txt
function addUserToOnlineList(username) {
  if (!username) return
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      console.error(' 读取在线用户文件出错:', err)
      return
    }
    const users = (data || '').split('\n').filter(Boolean)
    if (!users.includes(username)) {
      users.push(username)
      fs.writeFile(filePath, users.join('\n'), 'utf8', err => {
        if (err) console.error(' 写入在线用户失败:', err)
      })
    }
  })
}

//  工具方法：从 isOnline.txt 移除用户
function removeUserFromOnlineList(username) {
  if (!username) return
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      console.error(' 读取在线用户文件出错:', err)
      return
    }
    const users = (data || '').split('\n').filter(Boolean)
    const updated = users.filter(user => user !== username)
    fs.writeFile(filePath, updated.join('\n'), 'utf8', err => {
      if (err) console.error(' 更新在线用户失败:', err)
    })
  })
}

//  登录通知接口
app.post('/login-notify', (req, res) => {
  const { username, timestamp } = req.body || {}
  if (!username || !timestamp) {
    console.warn(' 登录请求缺少 username 或 timestamp')
    return res.status(400).json({ error: 'Missing username or timestamp' })
  }
  console.log(` 登录通知：用户 ${username} 于 ${timestamp} 登录成功`)
  addUserToOnlineList(username)
  res.status(200).json({ status: 'received' })
})

//  登出通知接口（新增）
app.post('/logout-notify', (req, res) => {
  const { username, timestamp } = req.body || {}
  console.log("username: " + username)
  console.log("timestamp: " + timestamp)
  if (!username || !timestamp) {
    console.warn(' 登出请求缺少 username 或 timestamp')
    return res.status(400).json({ error: 'Missing username or timestamp' })
  }
  console.log(` 登出通知：用户 ${username} 于 ${timestamp} 登出`)
  removeUserFromOnlineList(username)
  res.status(200).json({ status: 'received' })
})

//  全局错误处理
app.use((err, req, res, next) => {
  console.error(' 服务内部错误:', err)
  res.status(500).json({ error: 'Internal Server Error' })
})

//  启动服务
app.listen(PORT, () => {
  console.log(` 登录/登出通知监听服务已启动：http://localhost:${PORT}`)
})

//  获取在线用户接口
app.get('/online-users', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(' 无法读取在线用户文件:', err)
      return res.status(500).json({ error: '读取失败' })
    }

    // 将文件内容按行分割，过滤空行和空格
    const users = data
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)

    res.status(200).json({ users })
  })
})




//  创建群组聊天记录文件的接口
app.post('/init-group-chats', (req, res) => {
  const groups = req.body.groups

  if (!groups || !Array.isArray(groups)) {
    return res.status(400).json({ error: '缺少群组数组，格式应为 { groups: [groupName1, groupName2, ...] }' })
  }

  const baseDir = path.resolve('../public/chat/group_chats')

  // 确保群聊目录存在
  fs.mkdir(baseDir, { recursive: true }, (err) => {
    if (err) {
      console.error(' 创建 group_chats 目录失败:', err)
      return res.status(500).json({ error: '目录创建失败' })
    }

    // 为每个群组创建 .txt 文件
    let created = 0
    groups.forEach(group => {
      const filePath = path.join(baseDir, `${group}.txt`)
      fs.writeFile(filePath, '', { flag: 'wx' }, (err) => {
        if (err) {
          if (err.code === 'EEXIST') {
            console.log(`️ 文件已存在: ${group}.txt`)
          } else {
            console.error(` 创建 ${group}.txt 失败:`, err)
          }
        } else {
          console.log(` 已创建群组聊天记录文件: ${group}.txt`)
          created++
        }
      })
    })

    res.status(200).json({ message: '群组文件初始化请求已处理' })
  })
})

// ✅ 获取群组聊天记录接口
app.post('/get-chat-log', (req, res) => {
  const { group } = req.body

  if (!group || typeof group !== 'string') {
    return res.status(400).json({ error: '缺少群组名称' })
  }

  const filePath = path.resolve(`../public/chat/group_chats/${group}.txt`)
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(`❌ 读取聊天记录失败: ${err.message}`)
      return res.status(404).json({ error: '找不到聊天记录文件' })
    }

    // 将每一行格式化为 { user, text }
    const lines = data
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => {
        const [user, ...rest] = line.split(':')
        return {
          user: user.trim(),
          text: rest.join(':').trim()
        }
      })

    res.status(200).json({ messages: lines })
  })
})


// ✅ 接收并写入聊天消息的接口
app.post('/append-chat', (req, res) => {
  const { group, user, text } = req.body || {}

  if (!group || !user || !text) {
    return res.status(400).json({ error: '缺少必要字段 group/user/text' })
  }

  const filePath = path.resolve(`../public/chat/group_chats/${group}.txt`)
  const messageLine = `${user}: ${text}\n`

  fs.appendFile(filePath, messageLine, 'utf8', (err) => {
    if (err) {
      console.error('❌ 写入聊天记录失败:', err)
      return res.status(500).json({ error: '写入失败' })
    }

    console.log(`✏️ 消息写入成功 [${group}] ${user}: ${text}`)
    res.status(200).json({ status: 'ok' })
  })
})



