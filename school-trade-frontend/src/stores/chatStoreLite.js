// src/stores/chatStoreLite.js
// 以雙方固定順序存一個會話訊息清單：chat:<minId>:<maxId>
// 並以 chatIndex:<selfId> 存會話索引：[{peerId, lastText, lastTs, unread}]

function threadKey(a, b) {
    var x = String(a);
    var y = String(b);
    return 'chat:' + (x < y ? x : y) + ':' + (x < y ? y : x);
}
function indexKey(selfId) {
    return 'chatIndex:' + String(selfId);
}

function loadJSON(key, fallback) {
    try {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : (typeof fallback !== 'undefined' ? fallback : null);
    } catch (e) {
        return (typeof fallback !== 'undefined' ? fallback : null);
    }
}
function saveJSON(key, v) {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) {}
}

function loadThread(a, b) {
    var data = loadJSON(threadKey(a, b), []);
    return data || [];
}
function saveThread(a, b, messages) {
    saveJSON(threadKey(a, b), messages || []);
}

function loadIndex(selfId) {
    var data = loadJSON(indexKey(selfId), []);
    return data || [];
}
function saveIndex(selfId, list) {
    saveJSON(indexKey(selfId), list || []);
}

// 上/下行統一更新索引
function upsertIndex(selfId, peerId, opts) {
    opts = opts || {};
    var sid = String(selfId);
    var pid = String(peerId);
    var idx = loadIndex(sid);
    var i, row = null;
    for (i = 0; i < idx.length; i++) {
        if (String(idx[i].peerId) === pid) { row = idx[i]; break; }
    }
    if (!row) {
        row = { peerId: pid, lastText: '', lastTs: 0, unread: 0 };
        idx.push(row);
    }
    if (typeof opts.lastText !== 'undefined' && opts.lastText !== null) {
        row.lastText = String(opts.lastText);
    }
    row.lastTs = typeof opts.lastTs === 'number' ? opts.lastTs : Date.now();
    if (opts.incUnread) {
        row.unread = Number(row.unread || 0) + 1;
    }
    idx.sort(function (a, b) { return (b.lastTs || 0) - (a.lastTs || 0); });
    saveIndex(sid, idx);
}

export function listConversations(selfId) {
    return loadIndex(selfId);
}
export function resetUnread(selfId, peerId) {
    var sid = String(selfId);
    var pid = String(peerId);
    var idx = loadIndex(sid);
    var i;
    for (i = 0; i < idx.length; i++) {
        if (String(idx[i].peerId) === pid) {
            idx[i].unread = 0;
            saveIndex(sid, idx);
            break;
        }
    }
}

// —— 對話訊息層（單一會話使用） ——
export function createChatStore(selfId, peerId) {
    var state = {
        selfId: String(selfId || ''),
        peerId: String(peerId || ''),
        messages: loadThread(selfId, peerId)
    };

    function addMessage(payload) {
        payload = payload || {};
        var msg = {
            from: String(payload.from),
            text: String(payload.text || ''),
            ts: payload.ts || Date.now()
        };
        state.messages.push(msg);
        saveThread(state.selfId, state.peerId, state.messages);

        // 只有 'peer' 或 'me' 才更新索引；'sys' 不更新
        if (msg.from !== 'sys') {
            var isPeer = (msg.from === 'peer');
            upsertIndex(state.selfId, state.peerId, {
                lastText: msg.text,
                lastTs: msg.ts,
                incUnread: isPeer
            });
        }
    }

    return { state: state, addMessage: addMessage };
}

// —— 提供給全局聊天總線 / 其它頁面用的快捷 API ——
// 收到別人 -> 加到對應 thread，索引 +1 未讀
export function recordIncoming(selfId, fromId, text, ts) {
    var messages = loadThread(selfId, fromId);
    var msg = { from: 'peer', text: String(text || ''), ts: ts || Date.now() };
    messages.push(msg);
    saveThread(selfId, fromId, messages);
    upsertIndex(selfId, fromId, { lastText: msg.text, lastTs: msg.ts, incUnread: true });
}

// 自己發送 -> 加到對應 thread，索引更新但不加未讀
export function recordOutgoing(selfId, toId, text, ts) {
    var messages = loadThread(selfId, toId);
    var msg = { from: 'me', text: String(text || ''), ts: ts || Date.now() };
    messages.push(msg);
    saveThread(selfId, toId, messages);
    upsertIndex(selfId, toId, { lastText: msg.text, lastTs: msg.ts, incUnread: false });
}
