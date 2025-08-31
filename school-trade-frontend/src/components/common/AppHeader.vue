<template>
  <header class="app-head">
    <div class="bar">
      <!-- Left: brand -->
      <router-link class="brand" to="/">BAG2BAG</router-link>

      <!-- Center: simple bag mark (use your own logo if available) -->
      <img class="brand-mark" :src="logo" alt="BAG2BAG logo" />

      <!-- Right: actions -->
      <div class="actions">
        <router-link class="login" to="/sign-in">Login</router-link>
        <button class="menu-btn" aria-label="Open menu" @click="drawer = true">≡</button>
      </div>
    </div>

    <!-- Slide-out menu (Element UI Drawer) -->
    <el-drawer
        :visible.sync="drawer"
        direction="rtl"
        size="280px"
        custom-class="nav-drawer"
        :modal-append-to-body="false"
    >
      <nav class="drawer-nav">
        <router-link to="/" @click.native="drawer = false">Home</router-link>
        <router-link to="/categories" @click.native="drawer = false">Categories</router-link>
        <router-link to="/publish" @click.native="drawer = false">Post Item</router-link>
        <router-link to="/sign-in" @click.native="drawer = false">Login</router-link>
      </nav>
    </el-drawer>
  </header>
</template>

<script>
import Logo from '@/assets/logo.png'
export default {
  name: 'AppHeader',
  data () {
    return { drawer: false,logo: Logo }
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
