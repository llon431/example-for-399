// src/utils/websocket.js  （Vue CLI 可用）
let socket = null;

const BASE_WS = 'ws://localhost:3001/webSocketServer';

function join(a, b) {
    return String(a).replace(/\/+$/, '') + '/' + String(b).replace(/^\/+/, '');
}

export function connectWebSocket(userId, onMessage) {
    const url = join(BASE_WS, encodeURIComponent(String(userId)));

    console.log('[WS connect]', url);                // ★ 這裡也用 uid

    try { socket && socket.close(); } catch (_) {}
    socket = new WebSocket(url);

    socket.onopen = () => {};

    socket.onmessage = (evt) => {
        let data = evt && evt.data ? evt.data : evt;
        try { data = JSON.parse(data); } catch (_) {}

        const type = data && data.type ? String(data.type) : 'chat';
        const event = { ...data, type };
        if (typeof onMessage === 'function') {
            onMessage(event);  // ★ 不論 chat 或 TRADE_CARD 都發佈
        }
    };

    socket.onclose = () => {};
    socket.onerror = () => {};

    return socket;                                   // ★ 一定要回傳
}

export function sendChat(to, text) {

    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'chat', to: String(to), text: String(text || '') }));
}

export function sendPayload(obj) {
    if (!obj) { console.warn('[WS] sendPayload: empty payload'); return false }
    if (!socket) { console.warn('[WS] not connected'); return false }
    if (socket.readyState !== WebSocket.OPEN) { console.warn('[WS] not open:', socket.readyState); return false }
    socket.send(JSON.stringify(obj))
    return true
}