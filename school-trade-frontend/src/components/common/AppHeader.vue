<template>
  <header class="app-head">
    <div class="bar">
      <!-- Left: brand -->
      <router-link class="brand" to="/">BAG2BAG</router-link>

      <!-- Center: simple bag mark (use your own logo if available) -->
      <img class="brand-mark" :src="logo" alt="BAG2BAG logo" />

      <!-- Right: actions -->
      <div class="actions">
        <!-- ✅ 新增：抽屉触发按钮 -->
        <el-button class="menu-btn" icon="el-icon-menu" circle @click="drawer = true" />
      </div>
    </div>

    <el-drawer
        :visible.sync="drawer"
        direction="rtl"
        size="300px"
        :with-header="false"
        :append-to-body="true"
        custom-class="nav-drawer"
    >

      <div class="user" v-if="user">
        <div class="user-section">
          <div class="user-info" @click="goToProfile(); drawer = false">
            <div class="user-name">{{ userNickname }}</div>
            <div class="user-avatar">
              <img :src="userAvatar" alt="User avatar" />
            </div>
            <div class="user-subtitle">View Profile</div>
          </div>
        </div>
      </div>

      <div class="user-section" v-else @click="goToLogin(); drawer=false">
          <div class="user-info" @click="goToLogin(); drawer = false">
            <div class="user-name">{{ userNickname }}</div>
            <div class="user-avatar">
              <img :src="userAvatar" alt="User avatar" />
            </div>
            <div class="user-subtitle">View Profile</div>
          </div>
        </div>

      <!-- User Profile Section -->

      <nav class="drawer-nav">
        <router-link to="/"           @click.native="drawer = false" class="nav-item">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
          </div>
          <span class="nav-text">Home</span>
        </router-link>

        <router-link to="/categories" @click.native="drawer = false" class="nav-item">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/></svg>
          </div>
          <span class="nav-text">Categories</span>
        </router-link>

        <router-link to="/publish"    @click.native="drawer = false" class="nav-item">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </div>
          <span class="nav-text">Post Item</span>
        </router-link>

        <router-link to="/favorites"  @click.native="drawer = false" class="nav-item">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          </div>
          <span class="nav-text">My Favorites</span>
        </router-link>

        <router-link to="/messages"   @click.native="drawer = false" class="nav-item">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </div>
          <div class="nav-text-container">
            <span class="nav-text">My Messages</span>
            <span class="message-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
          </div>
        </router-link>

        <div class="nav-divider"></div>

        <!-- 抽屜中的 Login 項 -->
        <router-link
            v-if="!user"
            to="/login"
            @click.native="drawer = false"
            class="nav-item"
        >
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v12z"/>
            </svg>
          </div>
          <span class="nav-text">Login</span>
        </router-link>

        <a v-if="user" class="nav-item" href="#" @click.prevent="drawer = false; logout()">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zM20 3h-8v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <span class="nav-text">Logout</span>
        </a>

      </nav>
    </el-drawer>
    <!-- Slide-out menu (Element UI Drawer) -->
  </header>
</template>

<script>
import Logo from '@/assets/logo.png'
export default {
  name: 'AppHeader',
  data () {
    return { drawer: false,logo: Logo, user:null,
      userAvatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiNmM2Y0ZjYiLz4KPGNpcmNsZSBjeD0iMzAiIGN5PSIyMyIgcj0iOCIgZmlsbD0iIzZiNzI4MCIvPgo8cGF0aCBkPSJNMTUgNDVjMC02IDYtMTIgMTUtMTJzMTUgNiAxNSAxMiIgZmlsbD0iIzZiNzI4MCIvPgo8L3N2Zz4K',
      userNickname: 'BAG User',
      unreadCount: 2}
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
    async logout () {
      console.log('[logout] clicked')
      try {
        await this.$api.post('/logout', {}, { withCredentials: true })
        console.log('[logout] request finished')
      } catch (e) {
        console.error('[logout] api error:', e)
      }

      localStorage.removeItem('user')
      window.dispatchEvent(new CustomEvent('bag2bag:user-updated'))
      this.user = null
      this.$router.push('/index')
    },

    goToLogin () {
      // 直接去登入頁；若想登入後回到當前頁，可加上 redirect 參數
      // this.$router.push('/login')
      this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath } })
    },

    goToProfile() {
      this.$router.push('/me')
      this.drawer = false
    }
  },
  computed: {
    avatarSrc() { return this.user && this.user.avatar ? this.user.avatar : '' },
    avatarInitial() {
      const name = this.user ? (this.user.nickname || this.user.upi || 'U') : 'U';
      return String(name).charAt(0).toUpperCase();
    }
  },
  onMenu (cmd) {
    if (cmd === 'profile') return this.goToProfile();
    if (cmd === 'logout')  return this.logout();
  }

}
</script>

<style scoped>
:root {
  --nav: #0c1240;
  --line: #3ba7ff;
}

.app-head {
  width: 100%;
  background: var(--nav);
  color: #fff;
  border-bottom: 4px solid var(--line);
}

.bar {
  height: 88px;
  max-width: 1080px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 16px;
}

.brand {
  font-weight: 900;
  letter-spacing: 1px;
  font-size: 28px;
  color: #fff;
  text-decoration: none;
}

.brand:hover { opacity: .9; }

.brand-mark {
  justify-self: center;
  height: 80px;
  width: auto;
  opacity: .95;
  display: block;
}

.actions {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.login {
  color: #e5e7eb;
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,.18);
}

.login:hover { background: rgba(255,255,255,.1); }

.menu-btn {
  border: 0;
  background: transparent;
  color: #cbd5e1;
  font-size: 22px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 10px;
}

.menu-btn:hover { background: rgba(255,255,255,.1); }

/* Drawer Styles */
.nav-drawer >>> .el-drawer__body {
  padding: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.nav-drawer >>> .el-drawer__header {
  display: none;
}

/* User Section */
.user-section {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  padding: 30px 25px;
  display: flex;
  align-items: center;
  gap: 18px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.user-section:hover {
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  transform: translateY(-1px);
}

.user-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  border: 3px solid #e2e8f0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-section:hover .user-avatar {
  border-color: var(--line);
  transform: scale(1.05);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  text-align: left;
}

.user-name {
  font-size: 17px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
}

.user-subtitle {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* Navigation Menu */
.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 20px 0;
  background: transparent;
}

.nav-item {
  padding: 16px 25px;
  text-decoration: none;
  color: #334155;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 167, 255, 0.08), transparent);
  transition: left 0.5s ease;
}

.nav-item:hover::before {
  left: 100%;
}

.nav-item:hover {
  background: rgba(59, 167, 255, 0.08);
  color: #0f172a;
  transform: translateX(6px);
}

.nav-item.router-link-active {
  background: linear-gradient(90deg, rgba(59, 167, 255, 0.15), rgba(59, 167, 255, 0.05));
  color: var(--line);
  border-left: 4px solid var(--line);
  padding-left: 21px;
}

.nav-item.router-link-active:hover {
  transform: translateX(6px);
  background: linear-gradient(90deg, rgba(59, 167, 255, 0.2), rgba(59, 167, 255, 0.08));
}

.nav-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
}

.nav-icon svg {
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
}

.nav-text {
  font-size: 15px;
  letter-spacing: 0.3px;
}

.nav-text-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.nav-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, #cbd5e1, transparent);
  margin: 12px 0;
  position: relative;
}

.nav-divider::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  background: #cbd5e1;
  border-radius: 50%;
}

/* Message Badge */
.message-badge {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

/* Responsive */
@media (max-width: 640px) {
  .bar { height: 74px; }
  .brand { font-size: 22px; }
  .user-section {
    padding: 22px 18px;
  }
  .user-avatar {
    width: 48px;
    height: 48px;
  }
  .nav-item {
    padding: 14px 16px;
    gap: 14px;
  }
  .nav-icon {
    width: 20px;
    height: 20px;
  }
  .nav-text {
    font-size: 14px;
  }
}
</style>