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

    socket.onopen = () => { /* 不送 hello/ping，照你的 server.js 協議 */ };

    socket.onmessage = (evt) => {
        let data = evt && evt.data ? evt.data : evt;
        try { data = JSON.parse(data); } catch (_) {}
        if (typeof onMessage === 'function') onMessage(data);
    };

    socket.onclose = () => {};
    socket.onerror = () => {};

    return socket;                                   // ★ 一定要回傳
}

export function sendChat(to, text) {

    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: 'chat', to: String(to), text: String(text || '') }));
}

