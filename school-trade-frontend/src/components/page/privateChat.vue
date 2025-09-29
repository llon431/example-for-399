<template>
  <div class="chat-page">
    <app-head />
    <div class="chat-wrapper">
      <!-- 左側：會話列表 -->
      <aside class="sidebar">
        <div class="sidebar-header">會話列表</div>
        <div v-if="!conversations.length" class="sidebar-empty">目前尚無會話</div>
        <ul v-else class="conv-list">
          <li
              v-for="row in conversations"
              :key="row.peerId"
              :class="{ active: String(row.peerId) === String(peerId) }"
          >
            <a href="" @click.prevent="switchPeer(row.peerId)">
              <div class="conv-title">
                <span>用戶 {{ row.peerId }}</span>
                <span v-if="row.unread" class="badge">{{ row.unread }}</span>
              </div>
              <div class="conv-sub">{{ row.lastText }}</div>
              <div class="conv-time">{{ formatTs(row.lastTs) }}</div>
            </a>
          </li>
        </ul>
      </aside>

      <!-- 右側：聊天區 -->
      <section class="main">
        <div class="topbar">
          <div>自己ID：<strong>{{ selfId }}</strong></div>
          <div>對方ID：<strong>{{ peerId }}</strong></div>
        </div>

        <div ref="log" class="log">
          <div v-for="(m,i) in messages" :key="i" class="msg" :class="m.from">
            <div class="bubble">
              <div class="text">{{ m.text }}</div>
              <div class="ts">{{ formatTs(m.ts) }}</div>
            </div>
          </div>
        </div>

        <div class="composer">
          <input
              v-model="input"
              @keyup.enter="send"
              placeholder="輸入訊息 Enter 送出"
          />
          <button @click="send">send</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import AppHead from '../common/AppHeader.vue'
import { createChatStore, listConversations, resetUnread, recordOutgoing } from '@/stores/chatStoreLite'
import { sendChat } from '@/utils/websocket'
import { ensureGlobalChat, subscribeChat } from '@/utils/chatBus'

export default {
  name: 'PrivateChat',
  components: {
    AppHead
  },
  data () {
    return {
      selfId: '',
      peerId: '',
      input: '',
      chat: null,            // 當前會話的本地 store
      conversations: [],     // 左側會話列表
      unsub: null            // chatBus 退訂函式
    }
  },
  computed: {
    messages () { return this.chat ? this.chat.state.messages : [] }
  },
  created () {
    // 讀路由參數
    const q = (this.$route && this.$route.query) ? this.$route.query : {}
    this.selfId = q.selfId ? String(q.selfId) : ''
    this.peerId = q.peerId ? String(q.peerId) : ''

    // ★ 確保全局只有一條 WS 連線（冪等，不會重複連）
    ensureGlobalChat(this.selfId)

    // 初始化當前會話 & 左側列表
    this.chat = createChatStore(this.selfId, this.peerId)
    this.loadConversations()
  },
  mounted () {
    // 訂閱全局聊天事件（任何頁面收到訊息都會經過這裡）
    this.unsub = subscribeChat(this.onBusEvent)
    // 進入當前會話，視為已讀
    resetUnread(this.selfId, this.peerId)
    this.$nextTick(this.scrollToBottom)
  },
  beforeDestroy () { this.unsub && this.unsub() },
  watch: {
    // 切換不同 peerId（從左側點選或外部跳轉）時，重建當前會話
    '$route.query.peerId': function (n) {
      this.peerId = n ? String(n) : ''
      this.chat = createChatStore(this.selfId, this.peerId)
      this.loadConversations()
      resetUnread(this.selfId, this.peerId)
      this.$nextTick(this.scrollToBottom)
    },
    // 新訊息來了自動捲到底
    messages () { this.$nextTick(this.scrollToBottom) }
  },
  methods: {
    // ===== 左側列表 =====
    loadConversations () {
      var list = listConversations(this.selfId) || []
      this.conversations = list
          .filter(function (r) { return r && typeof r === 'object' && r.peerId != null })
          .map(function (r) { return {
            peerId: String(r.peerId),
            lastText: String(r.lastText || ''),
            lastTs: Number(r.lastTs || 0),
            unread: Number(r.unread || 0)
          }})
    },
    switchPeer (pid) {
      if (String(pid) === String(this.peerId)) return
      this.$router.push({
        name: 'PrivateChat',
        query: { selfId: this.selfId, peerId: String(pid) }
      })
    },

    // ===== 全局事件回調 =====
    onBusEvent (e) {
      if (!e || e.type !== 'chat') return
      // 刷新左側列表（recordIncoming 已把索引/未讀寫好）
      this.loadConversations()

      // 若訊息來自當前 peer，右側也同步顯示並清未讀
      if (String(e.from) === String(this.peerId)) {
        this.chat.addMessage({ from: 'peer', text: e.text || '', ts: e.ts })
        resetUnread(this.selfId, this.peerId)
        this.$nextTick(this.scrollToBottom)
      }
    },

    // ===== 發送 =====
    send () {
      const text = (this.input || '').trim()
      if (!text) return
      // 直接透過全局連線送出
      sendChat(this.peerId, text)
      // 本地更新索引與對話（不加未讀）
      recordOutgoing(this.selfId, this.peerId, text)
      // 右側同步（以確保 messages 立即顯示）
      this.chat = createChatStore(this.selfId, this.peerId)
      this.loadConversations()
      this.input = ''
      this.$nextTick(this.scrollToBottom)
    },

    // ===== UI 小工具 =====
    pushSys (text, ts) { this.chat && this.chat.addMessage({ from: 'sys', text: text, ts: ts }) },
    scrollToBottom () {
      const el = this.$refs.log
      if (!el) return
      el.scrollTop = el.scrollHeight
    },
    formatTs (ts) {
      if (!ts) return ''
      try {
        const d = new Date(ts)
        const pad = n => (n < 10 ? '0'+n : ''+n)
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
      } catch (e) { return '' }
    }
  }
}
</script>


<style scoped>
.chat-page{
  display: flex;
  flex-direction: column;
  height: 100vh;        /* ★ 覆蓋整個視窗 */
  overflow: hidden;     /* ★ 不讓外層滾動 */
}

/* 聊天外殼吃滿剩餘高度，不用知道 header 高度 */
.chat-wrapper{
  flex: 1;              /* ★ 吃滿 header 以外的高度 */
  min-height: 0;        /* ★ 讓內層可以正確收縮 */
  display: flex;
  overflow: hidden;     /* 內部自己滾 */
}

/* 右側主區：垂直佈局 */
.main{
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar{
  display: flex;
  gap: 20px;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  background: #fff;
}

/* 只讓訊息列表滾動 */
.log{
  flex: 1;
  overflow: auto;
  padding: 16px 12px;
  background: #fafafa;
}

/* 送出列黏在底部 */
.composer{
  position: sticky;
  bottom: 0;
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid #eee;
  background: #fff;
}

/* 訊息氣泡：左右對齊 */
.msg {
  display: flex;
  margin: 6px 0;
}
.msg.peer { justify-content: flex-start; }   /* 對方靠左 */
.msg.me   { justify-content: flex-end;   }   /* 我方靠右 */
.msg.sys  { justify-content: center;     }   /* 系統置中（可選） */

.bubble {
  max-width: 70%;
  padding: 8px 10px;
  border-radius: 10px;
  box-shadow: 0 0 1px rgba(0,0,0,.08);
  display: flex;
  flex-direction: column;
  gap: 4px;
  word-break: break-word;
}

/* 顏色區分 */
.msg.peer .bubble { background: #ffffff; color: #222; }
.msg.me   .bubble { background: #cfe8ff; color: #111; }   /* 淺藍 */
.msg.sys  .bubble { background: #eee;    color: #444; }

/* 時間字 */
.ts { font-size: 12px; color: #999; }


/* 左側 */
.sidebar { width: 220px; border-right: 1px solid #eaeaea; background:#fff; display:flex; flex-direction:column; }
.sidebar-header { padding: 10px 12px; font-weight: 600; border-bottom: 1px solid #eee; }
.sidebar-empty { padding: 12px; color:#999; }
.conv-list { list-style: none; padding: 6px; margin: 0; }
.conv-list li { margin: 4px 0; }
.conv-list li a { display:block; padding:8px 10px; border-radius: 8px; text-decoration:none; color:#333; }
.conv-list li.active a { background:#e6f2ff; font-weight: 600; }

/* 右側 */
.main { flex: 1; display:flex; flex-direction:column; }
.topbar { display:flex; gap:20px; padding:8px 12px; border-bottom:1px solid #eee; background:#fff; }
.log { flex:1; overflow:auto; padding:12px; background:#fafafa; }
.msg { margin:6px 0; }
.msg.sys .bubble { background:#eee; color:#333; }
.msg.me .bubble { background:#cfe8ff; align-self:flex-end; }
.msg.peer .bubble { background:#fff; }
.bubble { display:inline-flex; flex-direction:column; gap:4px; padding:6px 10px; border-radius:8px; box-shadow:0 0 1px rgba(0,0,0,.1); }
.bubble .ts { font-size: 12px; color:#999; }
.composer { display:flex; gap:8px; padding:10px; border-top:1px solid #eee; background:#fff; }
.composer input { flex:1; padding:8px; }
</style>
