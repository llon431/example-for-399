<template>
  <div class="chat-page">
    <app-head />
    <div class="topbar">
      <div>自己ID：<strong>{{ selfId }}</strong></div>
      <div class="peer">
        對方ID：
        <input v-model="peerId" placeholder="輸入對方的 userId（另一個視窗的 uid）" />
      </div>
    </div>

    <div class="log">
      <div v-for="(m,i) in messages" :key="i" class="msg" :class="m.from">
        <span class="bubble">{{ m.text }}</span>
      </div>
    </div>

    <div class="composer">
      <input v-model="input" @keyup.enter="send" placeholder="輸入訊息 Enter 送出" />
      <button @click="send">send</button>
    </div>
  </div>
</template>

<script>
import AppHead from '../common/AppHeader.vue'
export default {
  name: 'PrivateChat',
  components: {
    AppHead
  },
  data () {
    return {
      socket: null,
      reconnectTimer: null,
      selfId: '',
      peerId: '',
      input: '',
      messages: [] // { from: 'me' | 'peer' | 'sys', text: string }
    }
  },

  computed: {
    storageKey: function () {
      if (!this.selfId || !this.peerId) return null
      var pair = [String(this.selfId), String(this.peerId)].sort().join(':')
      return 'chat:' + pair
    }
  },

  created: function () {
    const q = (this.$route && this.$route.query) ? this.$route.query : {}

    // 自己的 uid，本地生成或已有
    this.selfId = q.selfId || this.getOrCreateLocalUid()
    this.peerId = q.targetId || q.to || ''

    // 如果 me.vue 傳了 targetId，當作對方 ID
    if (q.targetId) {
      this.peerId = q.targetId
    } else if (q.to) {
      // 保留原本兼容 ?to=bob 的方式
      this.peerId = q.to
    }
  },

  mounted: function () {
    // 先載入歷史，再連線
    this.loadHistory()
    this.connect()

    // messages 任一變動 → 自動保存
    this.$watch('messages', this.saveHistory, { deep: true })

    // 切換對方 → 載入該會話歷史
    this.$watch('peerId', this.loadHistory)
  },

  beforeDestroy: function () {
    this.saveHistory()
    try { this.socket && this.socket.close() } catch (e) {}
    clearTimeout(this.reconnectTimer); this.reconnectTimer = null
  },

  methods: {
    getOrCreateLocalUid: function () {
      var key = 'dev_uid'
      var id = localStorage.getItem(key)
      if (!id) {
        id = 'user-' + Math.random().toString(36).slice(2, 8)
        localStorage.setItem(key, id)
      }
      return id
    },

    wsBaseUrl: function () {
      // Vue2 / CLI 使用 VUE_APP_ 前綴
      return (process.env.VUE_APP_WS_URL || 'ws://localhost:3001/webSocketServer')
    },

    connect: function () {
      var url = this.wsBaseUrl().replace(/\/$/, '') + '/' + encodeURIComponent(this.selfId)
      try { this.socket && this.socket.close() } catch (e) {}
      this.socket = new WebSocket(url)

      var self = this

      this.socket.onopen = function () {
        self.pushSys('已連線：' + self.selfId)
      }

      this.socket.onmessage = function (e) {
        // 盡量把字串轉物件
        var raw = e.data
        var msg = raw
        try { msg = JSON.parse(raw) } catch (err) { /* 不是 JSON 就保留字串 */ }

        if (msg && msg.type === 'welcome') {
          return
        }
        if (msg && msg.type === 'error') {
          return
        }
        if (msg && msg.type === 'sent') {
          // 送達回執：可顯示或忽略
          return
        }
        if (msg && msg.type === 'chat') {
          var text = (msg.text != null) ? String(msg.text) : ''
          self.messages.push({ from: 'peer', text: text })
          self.saveHistory()
          return
        }

        // 其他未知訊息 → 當作系統訊息顯示
        var text2 = (typeof msg === 'string') ? msg : JSON.stringify(msg)
        self.messages.push({ from: 'sys', text: text2 })
        self.saveHistory()
      }

      this.socket.onclose = function () {
        self.pushSys('連線已關閉，1.5s 後嘗試重連…')
        clearTimeout(self.reconnectTimer)
        self.reconnectTimer = setTimeout(function () { self.connect() }, 1500)
      }

      this.socket.onerror = function (err) {
        // 只記錄，不在這裡重連，避免 onclose 再重連造成風暴
        // eslint-disable-next-line no-console
        console.error('[WS error]', err)
      }
    },

    send: function () {
      var text = (this.input || '').trim()
      if (!text) return
      if (!this.peerId || !this.peerId.trim()) {
        this.pushSys('請先輸入對方ID')
        return
      }
      if (!this.socket || this.socket.readyState !== 1) {
        this.pushSys('尚未連線，稍後再試')
        return
      }
      var payload = { type: 'chat', to: this.peerId.trim(), text: text, ts: Date.now() }
      this.socket.send(JSON.stringify(payload))
      this.messages.push({ from: 'me', text: text })
      this.input = ''
      this.saveHistory()
    },

    // 本地保存 / 讀取聊天記錄（localStorage）
    loadHistory: function () {
      if (!this.storageKey) return
      try {
        var raw = localStorage.getItem(this.storageKey)
        if (raw) this.messages = JSON.parse(raw)
      } catch (e) {}
    },
    saveHistory: function () {
      if (!this.storageKey) return
      try {
        var trimmed = this.messages.slice(-500) // 最多存 500 則
        localStorage.setItem(this.storageKey, JSON.stringify(trimmed))
      } catch (e) {}
    },

    pushSys: function (t) {
      this.messages.push({ from: 'sys', text: t })
      this.saveHistory()
    }
  }
}
</script>

<style scoped>
/* 页面框架 */
.chat-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f7f8fa; /* 浅灰色背景 */
}


/* 聊天区域：宽度随屏幕走，最多 1400px */
.chat{
  width: min(95vw, 1400px);   /* 关键：让宽度放大，几乎占满屏 */
  margin: 32px auto;
  padding: 0 20px;
  box-sizing: border-box;
}

/* 顶部那行（Your ID / To / 输入对方ID） */
/* 顶部行更整齐 */
.row {
  display: flex;
  align-items: center;
  gap: 10px;               /* 控件间距 */
}

/* 顶部输入框略微圆角 */
.row .peer-input {
  width: 320px;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 8px;      /* 4个角圆弧 */
  outline: none;
  transition: border-color .2s, box-shadow .2s;
}
.row .peer-input:focus {
  border-color: #3ab1ff;
  box-shadow: 0 0 0 2px rgba(58,177,255,.2);
}

/* 顶部 Send 按钮（圆角 + 浅蓝） */
.top-send-btn {
  border: none;
  border-radius: 20px;     /* 圆弧 */
  padding: 6px 14px;
  background: #36a1ff;     /* 浅蓝 */
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  line-height: 1;
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
  transition: background .2s, transform .05s;
}
.top-send-btn:hover { background: #2b8fe6; }
.top-send-btn:active { transform: translateY(1px); }

.row input {
  font-size: 14px;
  color: #333;
  width: 320px;
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 8px;    /* 四个角圆弧 */
  outline: none;
  font-size: 14px;
  transition: border-color .2s ease, box-shadow .2s ease;
}

.row input:focus {
  border-color: #3ab1ff;
  box-shadow: 0 0 0 2px rgba(58, 177, 255, 0.25);
}


/* 消息区域：占满容器的宽度与更大的高度 */
.log {
  width: 80%;             /* 占屏 80% */
  max-width: 1000px;      /* 也可以 900 / 960，按你喜好 */
  height: 420px;          /* 看着再短一点也行 400~480 */
  overflow: auto;
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 16px;
  margin: 12px auto 16px; /* ⬅ 居中关键：auto */
  box-sizing: border-box;
  background: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}


/* 每列訊息用 flex 排版 */
.msg { display: flex; margin: 6px 0; }

/* 自己的訊息靠右 */
.msg.me { justify-content: flex-end; }

/* 對方的訊息靠左 */
.msg.peer { justify-content: flex-start; }

/* 系統訊息置中、去背景 */
.msg.sys { justify-content: center; }
.msg.sys .bubble { background: transparent; color: #999; font-size: 12px; }

/* 氣泡外觀（你已有，這裡保留） */
.bubble {
  border-radius: 16px;
  padding: 8px 12px;
  max-width: 60%;
  word-break: break-word;
}

.msg.me .bubble  { background: #d9f0ff; }
.msg.peer .bubble{ background: #f1f1f1; }

/* 输入区与按钮：也占满容器宽度 */
.composer {
  width: 80%;
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 10px;
}

.composer input{
  flex:1;
  padding:10px 14px;
  border:1px solid #ccc;
  border-radius:8px;          /* 四角圆弧 */
  outline:none;
  font-size:14px;
  transition: border-color .2s, box-shadow .2s;
}
.composer input:focus{
  border-color:#3ab1ff;
  box-shadow:0 0 0 2px rgba(58,177,255,.25);
}

/* Send 按钮（保持不变） */
.composer button{
  border:none;
  background:#3ab1ff;
  color:#fff;
  border-radius:9999px;
  padding:10px 18px;
  font-weight:600;
  cursor:pointer;
  transition:filter .15s, transform .02s;
}
.composer button:hover{ filter:brightness(.95) }
.composer button:active{ transform:translateY(1px) }

</style>
