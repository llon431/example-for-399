<template>
  <header class="app-head">
    <div class="bar">
      <!-- Left: brand -->
      <router-link class="brand" to="/">BAG2BAG</router-link>

      <!-- Center: simple bag mark -->
      <img class="brand-mark" :src="logo" alt="BAG2BAG logo" />

      <!-- Right: actions -->
      <div class="actions">
        <!-- Post Item 按钮移到这里 -->
        <router-link to="/release" class="post-btn">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
          </svg>
          Post Item
        </router-link>

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

      <!-- 用户信息 -->
      <div class="user-section" @click="user ? goToProfile() : goToLogin(); drawer=false">
        <div class="user-avatar">
          <img :src="user && user.avatar ? user.avatar : defaultAvatar" alt="User avatar" />
        </div>
        <div class="user-info">
          <div class="user-name">{{ user ? user.nickname : 'Guest' }}</div>
          <div class="user-subtitle">{{ user ? 'View Profile' : 'Login to your account' }}</div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="drawer-nav">
        <router-link to="/index" exact class="nav-item" @click.native="drawer = false">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          <span class="nav-text">Home</span>
        </router-link>

        <router-link to="/messages" exact class="nav-item" @click.native="drawer = false">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
          </div>
          <div class="nav-text-container">
            <span class="nav-text">My Messages</span>
            <span class="message-badge" v-if="unreadCount > 0">{{ unreadCount }}</span>
          </div>
        </router-link>

        <router-link to="/about" exact class="nav-item" @click.native="drawer = false">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <span class="nav-text">About Us</span>
        </router-link>

        <div class="nav-divider"></div>

        <!-- 登录 / 登出 -->
        <router-link
            v-if="!user"
            to="/login"
            class="nav-item"
            @click.native="drawer = false"
        >
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v12z"/>
            </svg>
          </div>
          <span class="nav-text">Login</span>
        </router-link>

        <a
            v-if="user"
            href="#"
            class="nav-item"
            :class="{ 'is-disabled': loggingOut }"
            :aria-busy="loggingOut"
            :aria-disabled="loggingOut"
            @click.prevent="onLogout"
        >
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 13v-2H7V8l-5 4 5 4v-3h9zM20 3h-8v2h8v14h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <span class="nav-text">Logout</span>
        </a>
      </nav>
    </el-drawer>
  </header>
</template>

<script>
import Logo from '@/assets/logo.png'

export default {
  name: 'AppHeader',
  data () {
    return {
      drawer: false,
      loggingOut: false,
      logo: Logo,
      user: null,
      defaultAvatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiIGZpbGw9IiNmM2Y0ZjYiLz4KPGNpcmNsZSBjeD0iMzAiIGN5PSIyMyIgcj0iOCIgZmlsbD0iIzZiNzI4MCIvPgo8cGF0aCBkPSJNMTUgNDVjMC02IDYtMTIgMTUtMTJzMTUgNiAxNSAxMiIgZmlsbD0iIzZiNzI4MCIvPgo8L3N2Zz4K',
      unreadCount: 2
    }
  },
  created() {
    this.hydrate()
    if (!this.user) this.fetchMe()

    window.addEventListener('bag2bag:user-updated', this.hydrate)
    this.$watch('$route', () => this.hydrate())
  },
  beforeDestroy() {
    window.removeEventListener('bag2bag:user-updated', this.hydrate)
  },
  methods: {
    hydrate() {
      try {
        const raw = localStorage.getItem('user')
        this.user = raw ? JSON.parse(raw) : null
      } catch {
        this.user = null
      }
    },
    async fetchMe() {
      try {
        const res = await this.$api.get('/user', { withCredentials: true })
        const d = res && res.data ? res.data : res
        if (d && d.status_code === 1 && d.data) {
          localStorage.setItem('user', JSON.stringify(d.data))
          this.user = d.data
        }
      } catch {}
    },
    async onLogout() {
      if (this.loggingOut) return;
      this.loggingOut = true;

      try {
        // 1) 调后端注销（Session/Cookie 场景需确保 axios 开了 withCredentials）
        if (this.$api && this.$api.logout) {
          await this.$api.logout({});
        }
      } catch (e) {
        // 后端没开 /logout 或跨域失败也不阻塞前端清理
        console.error('logout api error:', e);
      }

      try {
        // 2) 清本地登录态
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        // 若你用自定义标记：
        localStorage.setItem('loginStatus', '0');
      } catch (e) {}

      // 3) 清全局/本地用户状态（按你项目二选一）
      if (this.$store && this.$store.commit) {
      } else if (typeof this.user !== 'undefined') {
        this.user = null; // 你模板里 v-if="user" 会立刻隐藏
      }

      // 4) 若你用 Authorization 头，顺手清掉
      if (this.$axios && this.$axios.defaults && this.$axios.defaults.headers && this.$axios.defaults.headers.common) {
        delete this.$axios.defaults.headers.common['Authorization'];
      }

      // 5) 通知其他页面清状态（比如清喜欢列表）
      window.dispatchEvent(new Event('app-logged-out'));

      // 6) 关闭抽屉并跳到登录页（带回跳）
      this.drawer = false;
      var back = (this.$route && this.$route.fullPath) ? this.$route.fullPath : '/';
      if (this.$router) {
        this.$router.push({ path: '/index', query: { redirect: back } });
      }

      // 7) 反馈
      if (this.$message && this.$message.success) {
        this.$message.success('已退出登录');
      }

      this.loggingOut = false;
      window.location.reload();
    },
    goToLogin() {
      this.$router.push({ path: '/login', query: { redirect: this.$route.fullPath } })
    },
    goToProfile () {
      if (this.$route && this.$route.name === 'me') {
        this.$router.replace({ name: 'me', query: { r: Date.now() } }) // 已在 /me -> 觸發刷新
      } else {
        this.$router.push({ name: 'me' })
      }
      this.drawer = false
    }
  },
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
  gap: 12px;
}

/* Post Item 按钮样式 */
.post-btn {
  color: #fff;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 10px;
  border: rgba(59, 167, 255, 0.1);
  background: #0c1240;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.post-btn svg {
  width: 18px;
  height: 18px;
}

.post-btn:hover {
  background: var(--line);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 167, 255, 0.3);
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
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 10px;
}

.menu-btn:hover { background: var(--line); }

/* Drawer Styles */
.nav-drawer >>> .el-drawer__body {
  padding: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.nav-drawer >>> .el-drawer__header {
  display: none;
}

/* User Section - 调整布局，头像在左侧 */
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

/* 头像样式 - 固定在左侧 */
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

/* 用户信息样式 - 在右侧 */
.user-info {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  justify-content: center;
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

  .post-btn {
    padding: 6px 12px;
    font-size: 12px;
  }

  .post-btn svg {
    width: 16px;
    height: 16px;
  }

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