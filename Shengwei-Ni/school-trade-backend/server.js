// server.js —— 1對1聊天（含離線暫存與補發）
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });
console.log('WS server on ws://localhost:3001 (path /webSocketServer/<userId> or /<userId>)');

const clients = new Map(); // userId -> ws
const inbox   = new Map(); // userId -> [{type:'chat', from, text, ts}, ...]

function parseUserIdFromUrl(url) {
    try {
        const path = new URL(url, 'ws://localhost').pathname;
        const seg  = path.split('/').filter(Boolean); // e.g. ['webSocketServer','11'] 或 ['11']
        if (!seg.length) return '';
        if (seg[0] === 'webSocketServer') return seg[1] || '';
        return seg[0];
    } catch { return ''; }
}

function queueMessage(to, payload) {
    const k = String(to);
    const list = inbox.get(k) || [];
    list.push(payload);
    inbox.set(k, list);
    console.log(`[QUEUE] -> ${k} (#${list.length})`, payload);
}

wss.on('connection', (ws, req) => {
    let userId = parseUserIdFromUrl(req.url || '/') || `guest-${Math.random().toString(36).slice(2,8)}`;

    // 註冊在線
    clients.set(userId, ws);
    console.log(`[OPEN] ${userId} connected`);
    try { ws.send(JSON.stringify({ type: 'welcome', msg: `connected as ${userId}` })); } catch {}

    // ★ 連線當下：補發離線消息
    const pending = inbox.get(userId);
    if (pending && pending.length) {
        console.log(`[FLUSH] deliver ${pending.length} message(s) to ${userId}`);
        for (const msg of pending) {
            try { ws.send(JSON.stringify(msg)); } catch (e) { console.warn('send fail', e); }
        }
        inbox.delete(userId);
    }

    ws.on('message', (raw) => {
        let data;
        try { data = JSON.parse(raw.toString()); } catch { return; }

        if (!data || data.type !== 'chat' || !data.to || typeof data.text !== 'string') {
            try { ws.send(JSON.stringify({ type: 'error', msg: 'invalid payload' })); } catch {}
            return;
        }

        const to = String(data.to);
        const ts = Date.now();
        const payload = { type: 'chat', from: String(userId), text: String(data.text), ts };

        const peer = clients.get(to);
        if (peer && peer.readyState === peer.OPEN) {
            try { peer.send(JSON.stringify(payload)); } catch {}
            try { ws.send(JSON.stringify({ type: 'sent', to, ts })); } catch {}
            console.log(`[SEND] ${userId} -> ${to}`, payload.text);
        } else {
            queueMessage(to, payload); // ★ 對方離線：改成排隊
            const count = (inbox.get(to) || []).length;
            try { ws.send(JSON.stringify({ type: 'queued', to, count, ts })); } catch {}
            console.log(`[OFFLINE] ${to} not online; queued (#${count})`);
        }
    });

    ws.on('close', () => {
        clients.delete(userId);
        console.log(`[CLOSE] ${userId}`);
    });
});
