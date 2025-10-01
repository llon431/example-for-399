<template>
  <div class="p-6 space-y-6">
    <h1 class="text-2xl font-bold">Trade API 前端快速測試</h1>

    <!-- 0) Cookie（切換買家/賣家） -->
    <section class="space-y-2">
      <h2 class="text-xl font-semibold">0) 設置 Cookie（shUserId）</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm mb-1">買家 ID</label>
          <input v-model.number="cookieBuyerId" type="number" class="w-full rounded border p-2 bg-transparent" placeholder="111"/>
          <button class="mt-2 rounded px-3 py-1 border" @click="setCookie('shUserId', cookieBuyerId)">用此 ID 登入(買家)</button>
        </div>
        <div>
          <label class="block text-sm mb-1">賣家 ID</label>
          <input v-model.number="cookieSellerId" type="number" class="w-full rounded border p-2 bg-transparent" placeholder="456"/>
          <button class="mt-2 rounded px-3 py-1 border" @click="setCookie('shUserId', cookieSellerId)">用此 ID 登入(賣家)</button>
        </div>
        <div>
          <div class="text-sm opacity-80">當前 cookie</div>
          <div class="text-xs break-all">{{ currentCookie }}</div>
          <button class="mt-2 rounded px-3 py-1 border" @click="refreshCookie">刷新</button>
        </div>
      </div>
    </section>

    <hr class="opacity-20"/>

    <!-- 1) 買家發起交易 -->
    <section class="space-y-3">
      <h2 class="text-xl font-semibold">1) 發起交易（買家）</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block text-sm mb-1">Item ID（商品）</label>
          <input v-model.number="form.itemId" type="number" class="w-full rounded border p-2 bg-transparent" placeholder="123"/>
        </div>
        <div>
          <label class="block text-sm mb-1">Seller ID（賣家 = 該商品擁有者）</label>
          <input v-model.number="form.sellerId" type="number" class="w-full rounded border p-2 bg-transparent" placeholder="456"/>
        </div>
        <div>
          <label class="block text-sm mb-1">Price（$ NZD）</label>
          <input v-model.number="form.price" type="number" class="w-full rounded border p-2 bg-transparent" placeholder="25.00" step="0.01"/>
        </div>
        <div>
          <label class="block text-sm mb-1">Meet Time（本地）</label>
          <input v-model="form.meetTimeLocal" type="datetime-local" class="w-full rounded border p-2 bg-transparent"/>
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm mb-1">Meet Place</label>
          <input v-model.trim="form.meetPlace" type="text" class="w-full rounded border p-2 bg-transparent" placeholder="OGGB Main Gate"/>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button class="rounded px-4 py-2 border" :disabled="loading" @click="createTrade">
          {{ loading ? 'Submitting...' : '發起交易（POST /api/trades）' }}
        </button>
        <span class="text-sm opacity-70">使用目前 cookie 的 shUserId 當買家</span>
      </div>
    </section>

    <hr class="opacity-20"/>

    <!-- 2) 賣家接受/拒絕 -->
    <section class="space-y-3" v-if="trade">
      <h2 class="text-xl font-semibold">2) 賣家回覆（接受/拒絕）</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label class="block text-sm mb-1">Trade ID</label>
          <input v-model.number="respond.tradeId" type="number" class="w-full rounded border p-2 bg-transparent"/>
        </div>
        <div>
          <label class="block text-sm mb-1">Version（最新）</label>
          <input v-model.number="respond.version" type="number" class="w-full rounded border p-2 bg-transparent"/>
        </div>
        <div class="flex gap-2">
          <button class="rounded px-4 py-2 border" @click="respondTrade(true)">接受</button>
          <button class="rounded px-4 py-2 border" @click="respondTrade(false)">拒絕</button>
        </div>
        <div class="text-sm opacity-70">用賣家 cookie（切上面 shUserId=賣家）</div>
      </div>
    </section>

    <hr class="opacity-20"/>

    <!-- 3) 雙方確認完成 -->
    <section class="space-y-3" v-if="trade && trade.status === 2">
      <h2 class="text-xl font-semibold">3) 完成交易（雙方都要按一次）</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div>
          <label class="block text-sm mb-1">Trade ID</label>
          <input v-model.number="confirm.tradeId" type="number" class="w-full rounded border p-2 bg-transparent"/>
        </div>
        <div>
          <label class="block text-sm mb-1">Version（最新）</label>
          <input v-model.number="confirm.version" type="number" class="w-full rounded border p-2 bg-transparent"/>
        </div>
        <div>
          <label class="block text-sm mb-1">角色</label>
          <select v-model="confirm.role" class="w-full rounded border p-2 bg-transparent">
            <option value="buyer">buyer（買家）</option>
            <option value="seller">seller（賣家）</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button class="rounded px-4 py-2 border" @click="confirmTrade">我已完成</button>
        </div>
      </div>
    </section>

    <hr class="opacity-20"/>

    <!-- 狀態輸出 -->
    <section>
      <h2 class="text-xl font-semibold">狀態</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <pre class="rounded border p-3 overflow-auto bg-transparent"><code>trade = {{ pretty(trade) }}</code></pre>
        <pre class="rounded border p-3 overflow-auto bg-transparent"><code>lastResp = {{ pretty(lastResp) }}</code></pre>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'TradeTester',
  data() {
    return {
      loading: false,
      trade: null,
      lastResp: null,
      cookieBuyerId: 111,
      cookieSellerId: 456,
      currentCookie: document.cookie,
      form: {
        itemId: null,
        sellerId: null,
        price: null,           // 顯示用（$）
        meetTimeLocal: '',     // datetime-local
        meetPlace: ''
      },
      respond: {
        tradeId: null,
        version: null
      },
      confirm: {
        tradeId: null,
        version: null,
        role: 'buyer'
      }
    }
  },
  methods: {
    pretty(obj) {
      try { return JSON.stringify(obj, null, 2) } catch (e) { return String(obj) }
    },
    refreshCookie() { this.currentCookie = document.cookie },
    setCookie(name, value, days = 1) {
      if (value === undefined || value === null) return
      const d = new Date()
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000)
      document.cookie = name + '=' + value + ';expires=' + d.toUTCString() + ';path=/'
      this.refreshCookie()
      this.$forceUpdate()
    },
    toISOSeconds(localStr) {
      if (!localStr) return ''
      return localStr.length === 16 ? (localStr + ':00') : localStr
    },
    dollarsToCents(v) {
      if (v === null || v === undefined || v === '') return null
      return Math.round(Number(v) * 100)
    },

    async createTrade() {
      this.loading = true
      try {
        const payload = {
          itemId: this.form.itemId,
          sellerId: this.form.sellerId,
          meetTime: this.toISOSeconds(this.form.meetTimeLocal),
          meetPlace: this.form.meetPlace,
          priceCents: this.dollarsToCents(this.form.price)
        }
        const resp = await axios.post('/api/trades', payload)
        const data = resp && resp.data ? resp.data : resp
        this.lastResp = data
        const t = (data && data.data !== undefined && data.data !== null) ? data.data : data
        this.trade = t
        if (t && t.version !== undefined && t.version !== null) {
          this.respond.version = t.version
          this.confirm.version = t.version
        }
        if (t && t.id) {
          this.respond.tradeId = t.id
          this.confirm.tradeId = t.id
        }
      } catch (e) {
        const err = (e && e.response && e.response.data) ? e.response.data : String(e)
        this.lastResp = err
      } finally {
        this.loading = false
      }
    },

    async respondTrade(accept) {
      if (!this.respond.tradeId) return
      try {
        const url = '/api/trades/' + this.respond.tradeId + '/respond'
        const params = { accept: !!accept, version: this.respond.version }
        const resp = await axios.post(url, null, { params: params })
        const data = resp && resp.data ? resp.data : resp
        this.lastResp = data
        const t = (data && data.data !== undefined && data.data !== null) ? data.data : data
        this.trade = t
        if (t && t.version !== undefined && t.version !== null) {
          this.respond.version = t.version
          this.confirm.version = t.version
        }
      } catch (e) {
        const err = (e && e.response && e.response.data) ? e.response.data : String(e)
        this.lastResp = err
      }
    },

    async confirmTrade() {
      if (!this.confirm.tradeId) return
      try {
        const url = '/api/trades/' + this.confirm.tradeId + '/confirm'
        const params = { role: this.confirm.role, version: this.confirm.version }
        const resp = await axios.post(url, null, { params: params })
        const data = resp && resp.data ? resp.data : resp
        this.lastResp = data
        const t = (data && data.data !== undefined && data.data !== null) ? data.data : data
        this.trade = t
        if (t && t.version !== undefined && t.version !== null) {
          this.respond.version = t.version
          this.confirm.version = t.version
        }
      } catch (e) {
        const err = (e && e.response && e.response.data) ? e.response.data : String(e)
        this.lastResp = err
      }
    }
  }
}
</script>


<style scoped>
/* 簡單保底樣式（若專案已有 Tailwind/Element，可忽略） */
</style>
