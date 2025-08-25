<template>
  <aside class="drawer" :class="{ open: isOpen }">
    <!-- 用户栏 -->
    <div class="user-row" @click="$router.push({ name: 'profile' })">
      <img src="/avatar.png" alt="avatar" class="avatar-sm" />
      <span class="user-name">Jacky</span>
    </div>

    <!-- 菜单项 -->
    <nav class="menu">
      <button v-for="item in menuItems" :key="item.label" @click="go(item)">
        {{ item.label }}
      </button>
    </nav>
  </aside>
</template>

<script setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  isOpen: { type: Boolean, default: false },   // 控制 Drawer 开关
})

const router = useRouter()

const menuItems = [
  { label: 'Home', path: '/' },
  { label: 'Upload Item', path: '/upload' },
  { label: 'Favorites', path: '/favorites' },
]

function go(item) {
  router.push(item.path)
}
</script>

<style scoped>
.drawer {
  position: fixed;
  top: 0;
  right: -260px; /* 默认隐藏 */
  width: 240px;
  height: 100vh;
  background: #0f1540;
  color: #fff;
  transition: right 0.3s ease;
  display: flex;
  flex-direction: column;
}
.drawer.open {
  right: 0;
}

/* 用户行 */
.user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  cursor: pointer;
  background: #1a1f4d;
}
.user-row:hover {
  background: #2a316d;
}
.avatar-sm {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #eee;
}
.user-name {
  font-weight: 600;
}

/* 菜单 */
.menu {
  display: flex;
  flex-direction: column;
  padding: 12px;
}
.menu button {
  text-align: left;
  border: none;
  background: transparent;
  color: #fff;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.menu button:hover {
  background: #394080;
}
</style>

