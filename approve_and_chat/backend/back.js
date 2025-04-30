// login-notify-server.js

import express from 'express'
import cors from 'cors'

const app = express()
const PORT = 5173

// ✅ 中间件
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // 支持 x-www-form-urlencoded

// ✅ 日志中间件
app.use((req, res, next) => {
  console.log(`📩 收到请求: ${req.method} ${req.url}`)
  next()
})

// ✅ 登录通知接口
app.post('/login-notify', (req, res) => {
  const { username, timestamp } = req.body || {}

  if (!username || !timestamp) {
    console.warn('⚠️ 请求缺少 username 或 timestamp')
    return res.status(400).json({ error: 'Missing username or timestamp' })
  }

  console.log(`✅ 登录通知：用户 ${username} 于 ${timestamp} 登录成功`)
  res.status(200).json({ status: 'received' })
})

// ✅ 全局错误处理
app.use((err, req, res, next) => {
  console.error('💥 服务内部错误:', err)
  res.status(500).json({ error: 'Internal Server Error' })
})

// ✅ 启动服务
app.listen(PORT, () => {
  console.log(`🚀 登录通知监听服务已启动：http://localhost:${PORT}/login-notify`)
})
