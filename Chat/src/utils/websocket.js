// src/websocket.js
let socket
let heartbeatTimer = null
let reconnectTimer = null
let lastUrl = null

// 讀取 .env 裡的 VITE_WS_URL，沒設就用本機 echo 伺服器
// 例如：VITE_WS_URL=ws://47.121.140.11:8889/webSocketServer
const BASE_WS = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

export function connectWebSocket(userId, onMessage) {
  // 允許兩種寫法：
  // 1) BASE_WS 已含 /webSocketServer => `${BASE_WS}/${userId}`
  // 2) BASE_WS 是完整 ws 回聲 => 直接用 BASE_WS，不追加 userId
  const url = BASE_WS.includes('webSocketServer')
      ? `${BASE_WS}/${encodeURIComponent(userId)}`
      : BASE_WS

  lastUrl = url
  // 關掉舊連線
  try { socket && socket.close() } catch (e) {}

  socket = new WebSocket(url)

  socket.onopen = () => {
    console.log('[WS] open:', url)
    startHeartbeat()
  }

  socket.onmessage = (event) => {
    // 優先嘗試 JSON，否則回傳原字串
    let data = event.data
    try { data = JSON.parse(event.data) } catch (_) {}
    onMessage && onMessage(data)
  }

  socket.onclose = () => {
    console.log('[WS] closed')
    stopHeartbeat()
    scheduleReconnect()
  }

  socket.onerror = (err) => {
    console.error('[WS] error:', err)
  }
}

export function sendMessage(message) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('[WS] not open')
    return
  }
  const payload = typeof message === 'string' ? message : JSON.stringify(message)
  socket.send(payload)
}

export function disconnectWebSocket() {
  stopHeartbeat()
  clearTimeout(reconnectTimer); reconnectTimer = null
  try { socket && socket.close() } catch (e) {}
  socket = null
}

function startHeartbeat() {
  stopHeartbeat()
  heartbeatTimer = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'ping', ts: Date.now() }))
    }
  }, 25_000) // 25s 一次，依你後端設定調整
}

function stopHeartbeat() {
  clearInterval(heartbeatTimer); heartbeatTimer = null
}

function scheduleReconnect() {
  if (reconnectTimer) return
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    if (lastUrl) {
      // 若你想保留 userId 參數，建議把它存在外層並重呼 connectWebSocket
      // 這裡簡單重建（假設後端不需要 userId path）
      socket = new WebSocket(lastUrl)
    }
  }, 3000)
}
