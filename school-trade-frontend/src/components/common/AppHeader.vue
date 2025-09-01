<template>
  <header class="app-head">
    <div class="bar">
      <!-- Left: brand -->
      <router-link class="brand" to="/">BAG2BAG</router-link>

      <!-- Center: simple bag mark (use your own logo if available) -->
      <img class="brand-mark" :src="logo" alt="BAG2BAG logo" />

      <!-- Right: actions -->
      <div class="actions">
        <!-- 未登录 -->
        <template v-if="user">
          <el-dropdown trigger="click" @command="onMenu">
    <span class="avatar-wrap">
      <el-avatar :src="avatarSrc" size="small">{{ avatarInitial }}</el-avatar>
    </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile">Profile</el-dropdown-item>
              <el-dropdown-item divided @click.native="logout">Logout</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
        <template v-else>
          <router-link to="/login" class="login-btn">Login</router-link>
        </template>
      </div>
    </div>



    <!-- Slide-out menu (Element UI Drawer) -->
  </header>
</template>

<script>
import Logo from '@/assets/logo.png'
export default {
  name: 'AppHeader',
  data () {
    return { drawer: false,logo: Logo, user:null }
  },
  created() {
    this.hydrate();
    if (!this.user) this.fetchMe(); // 可選：用 cookie 拉一次

    // ✅ 同分頁登入後，立刻讓 Header 更新
    window.addEventListener('bag2bag:user-updated', this.hydrate);

    // ✅ 從 login 頁跳回首頁時也重讀
    this.$watch('$route', () => this.hydrate());
  },
  beforeDestroy() {
    window.removeEventListener('bag2bag:user-updated', this.hydrate);
  },
  methods: {
    hydrate() {
      try {
        const raw = localStorage.getItem('user');
        this.user = raw ? JSON.parse(raw) : null;
        // console.log('header hydrate', this.user)  // 想檢查時打開
      } catch { this.user = null; }
    },
    async fetchMe() {
      try {
        // 用你現成的 $api；接口路徑按你 Network 截圖用 /user
        const res = await this.$api.get('/user', { withCredentials: true });
        const d = res && res.data ? res.data : res;
        if (d && d.status_code === 1 && d.data) {
          localStorage.setItem('user', JSON.stringify(d.data));
          this.user = d.data;
        }
      } catch {}
    },
    async logout() {
      try {
        // 後端清 cookie（若未實作，可先略過這行）
        await this.$api.post('/logout', null, { withCredentials: true })
      } catch (e) { /* 靜默即可 */ }

      // 前端清狀態 + 通知 Header 立即更新
      localStorage.removeItem('user')
      window.dispatchEvent(new CustomEvent('bag2bag:user-updated'))
      this.user = null

      this.$router.push('/index')
    },
  },
  computed: {
    avatarSrc() { return this.user && this.user.avatar ? this.user.avatar : '' },
    avatarInitial() {
      const name = this.user ? (this.user.nickname || this.user.upi || 'U') : 'U';
      return String(name).charAt(0).toUpperCase();
    }
  }
}
</script>

<style scoped>
:root { --nav: #0c1240; --line: #3ba7ff; }
.app-head { width: 100%; background: var(--nav); color: #fff; border-bottom: 4px solid var(--line); }
.bar { height: 88px; max-width: 1080px; margin: 0 auto; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0 16px; }
.brand { font-weight: 900; letter-spacing: 1px; font-size: 28px; color: #fff; text-decoration: none; }
.brand:hover { opacity: .9; }
.brand-mark { justify-self: center; font-size: 26px; opacity: .95; }
.actions { justify-self: end; display: inline-flex; align-items: center; gap: 10px; }
.login { color: #e5e7eb; text-decoration: none; padding: 6px 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,.18); }
.login:hover { background: rgba(255,255,255,.1); }
.menu-btn { border: 0; background: transparent; color: #cbd5e1; font-size: 22px; cursor: pointer; padding: 6px 10px; border-radius: 10px; }
.menu-btn:hover { background: rgba(255,255,255,.1); }

/* Drawer */
.nav-drawer >>> .el-drawer__body { padding: 16px; display: flex; flex-direction: column; }
.drawer-nav { display: grid; gap: 8px; }
.drawer-nav a { padding: 12px 10px; border-radius: 10px; text-decoration: none; color: #1f2937; font-weight: 600; }
.drawer-nav a:hover { background: #f3f4f6; }

@media (max-width: 640px) {
  .bar { height: 74px; }
  .brand { font-size: 22px; }
}
.brand-mark { justify-self:center; height:80px; width:auto; opacity:.95; display:block; }
</style>
