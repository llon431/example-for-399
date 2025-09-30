<template>
  <header class="site-nav">
    <div class="nav-inner">
      <router-link to="/" class="brand">
        <span class="logo-mark">👜</span>
        <span class="brand-text">BAG2BAG</span>
      </router-link>

      <nav class="right">
        <router-link to="/privateChat" class="nav-link">Chat</router-link>
        <router-link to="/post" class="nav-link">
          <span class="plus">＋</span> Post Item
        </router-link>
        <router-link to="/categories" class="nav-link grid">▦</router-link>
      </nav>
    </div>
    <div class="accent-line"></div>
  </header>
</template>

<script setup>
// 纯展示组件，无逻辑
</script>

<style scoped>
.site-nav{position:sticky;top:0;z-index:100;background:#0b1240;color:#fff}
.nav-inner{
  max-width: 1800px;    /* 继续放宽，从 1440 → 1800，几乎占满屏 */
  margin: 0 auto;
  height: 80px;         /* 再加高一点，显得更大气 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;      /* 两边留白也加大，显得更舒展 */
}


.brand{display:flex;align-items:center;gap:10px;text-decoration:none;color:#fff}
.logo-mark{font-size:22px;line-height:1}
.brand-text{font-family:Georgia,serif;font-weight:700;letter-spacing:1px}
.right{display:flex;align-items:center;gap:22px}
.nav-link{color:#fff;text-decoration:none;opacity:.9;transition:opacity .2s;font-weight:600}
.nav-link:hover{opacity:1}
.plus{margin-right:6px}
.grid{font-size:18px;line-height:1}
.accent-line{height:4px;background:#3ab1ff}
</style>
