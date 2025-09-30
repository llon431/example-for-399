// server.js —— 僅支援 1對1 私聊
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 3001 });
console.log('WS 1v1 server at ws://localhost:3001/webSocketServer/<userId>');

const clients = new Map(); // userId -> ws

wss.on('connection', (ws, req) => {
    const parts = (req.url || '/').split('/').filter(Boolean);
    // 期望路徑形如 /webSocketServer/<userId>
    const userId = parts[1] || `guest-${Math.random().toString(36).slice(2,8)}`;

    clients.set(userId, ws);
    ws.send(JSON.stringify({ type: 'welcome', msg: `connected as ${userId}` }));

    ws.on('message', (raw) => {
        let data;
        try { data = JSON.parse(raw.toString()); } catch { return; }

        // 僅允許 {type:'chat', to:'xxx', text:'...'}
        if (data?.type !== 'chat' || !data.to || !data.text) {
            ws.send(JSON.stringify({ type:'error', msg:'invalid payload' }));
            return;
        }

        const to = String(data.to);
        const peer = clients.get(to);
        if (peer && peer.readyState === peer.OPEN) {
            // 轉發給對方
            peer.send(JSON.stringify({ type:'chat', from:userId, text:String(data.text), ts: Date.now() }));
            // 回送送達回執給自己（可選）
            ws.send(JSON.stringify({ type:'sent', to, ts: Date.now() }));
        } else {
            ws.send(JSON.stringify({ type:'error', msg:`user ${to} not online` }));
        }
    });

    ws.on('close', () => { clients.delete(userId); });
});
