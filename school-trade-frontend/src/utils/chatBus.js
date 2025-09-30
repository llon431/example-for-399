// src/utils/chatBus.js
// 讓整個站點只建立一次 WS 連線，並把收到的訊息分發出去（或直接進資料層）

import { connectWebSocket } from '@/utils/websocket'
import { recordIncoming } from '@/stores/chatStoreLite'

let _ws = null
let _selfId = null
const _subs = new Set() // 可選：給頁面監聽用

export function ensureGlobalChat(selfId) {
    const id = String(selfId || '')
    if (!id) return
    if (_ws && _selfId === id) return // 已經連上同一個人了
    _selfId = id
    _ws = connectWebSocket(id, onWSMessage)
}

function onWSMessage(evt) {
    let msg = evt && evt.data ? evt.data : evt
    try { msg = JSON.parse(msg) } catch (_) {}

    if (!msg || !msg.type) return

    if (msg.type === 'chat') {
        const from = String(msg.from)
        const text = String(msg.text || '')
        const ts = msg.ts || Date.now()

        // 直接寫入本地資料層（建立/更新會話、增加未讀、保存訊息）
        recordIncoming(_selfId, from, text, ts)

        // 通知任何訂閱者（例如 PrivateChat.vue 想即時刷新列表）
        _subs.forEach(fn => { try { fn({ type:'chat', from, text, ts }) } catch(_) {} })
    }
}

export function subscribeChat(fn) {
    _subs.add(fn); return () => _subs.delete(fn)
}
