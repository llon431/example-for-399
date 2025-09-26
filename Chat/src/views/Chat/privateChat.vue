<template>
  <div class="chat-page">
    <!-- 顶部导航 -->
    <NavBar />

    <!-- ↓↓↓ 新增外层：整体“联系人 + 聊天区”容器，主要用来整体下移 ↓↓↓ -->
    <div class="chat-shell">
      <!-- 左侧联系人 -->
      <aside class="contacts-panel">
        <h3 class="contacts-title">Contacts</h3>

        <!-- 这里是示例联系人；你也可以改成从接口/状态里渲染 -->
        <ul class="contacts-list">
          <li class="contact-item" @click="selectPeer('alice')">
            <span class="avatar">A</span>
            <div class="meta">
              <div class="name">Alice</div>
              <div class="desc">Hey there!</div>
            </div>
          </li>
          <li class="contact-item" @click="selectPeer('bob')">
            <span class="avatar">B</span>
            <div class="meta">
              <div class="name">Bob</div>
              <div class="desc">Ping me :)</div>
            </div>
          </li>
          <li class="contact-item" @click="selectPeer('charlie')">
            <span class="avatar">C</span>
            <div class="meta">
              <div class="name">Charlie</div>
              <div class="desc">See you…</div>
            </div>
          </li>
        </ul>
      </aside>

      <!-- 右侧聊天区 -->
      <section class="chat-pane">
        <!-- 顶部：自己的ID + 对方输入框 + 顶部Send -->
        <div class="top-row">
          <label class="id-label">Your ID: <b>{{ selfId }}</b></label>
          <label class="to-label">To:</label>
          <input
            v-model="peerId"
            class="peer-input"
            placeholder="Enter recipient userId"
          />
          <button class="top-send-btn" @click="send">Send</button>
        </div>

        <!-- 新增：让“顶栏”和“聊天框”之间再空一点 -->
        <div class="gap-12"></div>

        <!-- 聊天记录 -->
        <div class="log" ref="logEl">
          <!-- 示例系统提示；你可以替换为自己的消息渲染 -->
          <div class="sys">已連線： {{ selfId }}</div>
          <div
            v-for="(m, i) in msgs"
            :key="i"
            :class="['bubble', m.from]"
          >
            {{ m.text }}
          </div>
        </div>

        <!-- 输入框 + 发送 -->
        <div class="composer">
          <input
            v-model="input"
            class="msg-input"
            placeholder="Type a message and press Enter"
            @keyup.enter="send"
          />
          <button class="send-btn" @click="send">Send</button>
        </div>
      </section>
    </div>
    <!-- ↑↑↑ 新增外层：整体“联系人 + 聊天区”容器 ↑↑↑ -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'

/* ===== 这里用你的原有逻辑即可；变量名保持一致即可 ===== */

const selfId = ref(getUid())       // 你的生成/读取 uid 方法
const peerId = ref('')             // 对方 ID
const input  = ref('')             // 输入框
const msgs   = ref([])             // 消息数组
const logEl  = ref(null)           // 聊天区 DOM

function getUid () {
  // 示例：从 URL 或 localStorage 获取；你可直接换成你的实现
  const u = new URL(location.href).searchParams.get('uid')
  if (u) return u
  const key = 'dev_uid'
  let id = localStorage.getItem(key)
  if (!id) { id = 'user-' + Math.random().toString(36).slice(2, 8); localStorage.setItem(key, id) }
  return id
}

// 选择左侧联系人时，填充到 To 框
function selectPeer(id) {
  peerId.value = id
}

// 发送消息（示例：只推入本地；你替换成你的 websocket 发送）
function send() {
  const text = input.value?.trim()
  if (!text) return
  msgs.value.push({ from: 'me', text })
  input.value = ''
  // 你的真实发送逻辑：sendMessage({ to: peerId.value, text })
  // 滚动到底部
  requestAnimationFrame(() => {
    logEl.value?.scrollTo({ top: logEl.value.scrollHeight, behavior: 'smooth' })
  })
}

onMounted(() => {
  // 这里保留你的 websocket 连接等逻辑即可
})
</script>

<style scoped>
/* 页面整体 */
.chat-page {
  background: #f5f7fa;
  min-height: 100vh;
}

/* ========== 关键：整体“联系人 + 聊天区”的外层容器，负责整体往下挪 ========== */
.chat-shell {
  /* 这个就是你要的“整体往下移动”的距离，按需调大/调小 */
  margin-top: 18px;

  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;

  /* 与页面左右留白一致，沿用你现有的布局风格 */
  padding: 0 24px 28px;
}

/* 左侧联系人 */
.contacts-panel {
  background: #fff;
  border: 1px solid #e6eaf0;
  border-radius: 12px;
  padding: 16px 12px;
  box-shadow: 0 1px 2px rgba(18,18,18,.03);
}
.contacts-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 4px;
}
.contacts-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  border-radius: 10px;
  cursor: pointer;
}
.contact-item:hover {
  background: #f3f7ff;
}
.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #dbeafe;
  color: #2563eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}
.meta .name {
  font-weight: 600;
  margin-bottom: 2px;
}
.meta .desc {
  font-size: 12px;
  color: #667085;
}

/* 右侧聊天区 */
.chat-pane {
  background: #fff;
  border: 1px solid #e6eaf0;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 2px rgba(18,18,18,.03);

  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 12px;
}

/* 顶部行：ID、To、输入框、按钮 */
.top-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.id-label {
  color: #111827;
}
.to-label {
  color: #111827;
  margin-left: 6px;            /* 让 To: 与前面有一点点距离 */
}
.peer-input {
  width: 260px;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;         /* 圆角 */
  outline: none;
  transition: box-shadow .2s, border-color .2s;
}
.peer-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,.18);
}
/* 顶部 Send 按钮（淡蓝 + 圆角） */
.top-send-btn {
  background: #3ba4ff;
  color: #fff;
  border: none;
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  cursor: pointer;
  transition: filter .15s ease;
}
.top-send-btn:hover { filter: brightness(1.03); }

/* 让顶栏与聊天框之间再空一点（你要的第二个“往下挪”） */
.gap-12 { height: 12px; }

/* 聊天记录 */
.log {
  width: 100%;
  height: 440px;
  overflow: auto;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 16px;
  background: #fff;
}
.sys {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 10px;
}
.bubble {
  display: inline-block;
  max-width: 70%;
  padding: 10px 12px;
  border-radius: 12px;
  margin: 8px 0;
  line-height: 1.45;
  word-wrap: break-word;
}
.bubble.me {
  background: #e8f3ff;
  color: #0f172a;
  margin-left: auto;
  display: block;
}
.bubble.peer {
  background: #f3f4f6;
  color: #111827;
}

/* 底部输入 + 发送 */
.composer {
  display: flex;
  align-items: center;
  gap: 12px;
}
.msg-input {
  flex: 1;
  height: 40px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  outline: none;
  transition: box-shadow .2s, border-color .2s;
}
.msg-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59,130,246,.18); /* 和上面小输入框统一的高亮效果 */
}
.send-btn {
  background: #3ba4ff;
  color: #fff;
  border: none;
  height: 40px;
  padding: 0 18px;
  border-radius: 12px;
  cursor: pointer;
  transition: filter .15s ease;
}
.send-btn:hover { filter: brightness(1.03); }

/* 小屏自适应 */
@media (max-width: 960px) {
  .chat-shell {
    grid-template-columns: 1fr;
  }
  .contacts-panel {
    order: 2;
  }
  .chat-pane {
    order: 1;
  }
}
</style>
