<template>
  <header>
    <!-- 深蓝满版顶栏 -->
    <div class="topbar">
      <div class="bar-inner">
        <!-- 左侧Logo：BAG2BAG -->
        <router-link class="logo" to="/">
          <span class="brand-1">BAG</span><span class="brand-2">2BAG</span>
        </router-link>

        <!-- 中间 Logo 图标：购物袋图标 -->
        <div class="center-icon"><BagIcon /></div>

        <!-- 右侧按钮组：主题切换 + 菜单 -->
        <div class="topbar-actions">
          <!-- 主题切换按钮：圆形按钮，显示太阳/月亮图标 -->
          <button class="theme-toggle" @click="toggleTheme" :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <span class="theme-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
          </button>

          <!-- 汉堡菜单按钮：三条横线，点击打开侧边栏 -->
          <button class="hamburger" @click="drawer = true" aria-label="menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </div>

    <!-- 白底内容区：搜索栏部分 -->
    <div class="content">
      <div class="content-inner">
        <div class="search-row">
          <!-- Element Plus 搜索输入框 -->
          <el-input
            v-model="keyword"
            :placeholder="currentPlaceholder"
            class="search-input"
            size="large"
            @keyup.enter="onSearch"
            clearable
          />
          <!-- Element Plus 搜索按钮 -->
          <el-button class="search-btn" size="large" round @click="onSearch">
            <el-icon><Search /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 侧边栏抽屉：Element Plus Drawer组件 -->
    <el-drawer v-model="drawer" :with-header="false" size="280px">
      <div class="drawer-inner">
        <!-- 用户信息区域：头像 + 用户名 + 在线状态 -->
        <div class="user-info">
          <el-avatar :src="user.avatar" size="large" />
          <div class="user-details">
            <span class="username">{{ user.name }}</span>
            <span class="user-status">Online</span>
          </div>
        </div>

        <!-- 菜单列表：Element Plus Menu组件 -->
        <el-menu class="sidebar-menu" @select="onMenuSelect">
          <!-- 个人功能区域 -->
          <el-menu-item index="/profile">
            <span>User Profile</span>
          </el-menu-item>

          <!-- 带徽章的菜单项：显示收藏数量 -->
          <el-menu-item index="/my-favorites">
            <span>My Favorites</span>
            <el-badge :value="favoritesCount" class="badge" />
          </el-menu-item>

          <!-- 带徽章的菜单项：显示消息数量（红色） -->
          <el-menu-item index="/messages">
            <span>My Messages</span>
            <el-badge :value="messageCount" class="badge" type="danger" />
          </el-menu-item>

          <el-menu-item index="/history">
            <span>History</span>
          </el-menu-item>

          <!-- 条件渲染：根据登录状态显示登出或登录 -->
          <el-menu-item v-if="user.isLoggedIn" @click="onLogout">
            <span>Logout</span>
          </el-menu-item>

          <el-menu-item v-else index="/login">
            <span>Login</span>
          </el-menu-item>

          <!-- 分割线 -->
          <el-divider />

          <!-- 系统功能区域 -->
          <el-menu-item index="/settings">
            <span>Settings</span>
          </el-menu-item>

          <!-- 主题切换菜单项：动态显示文本 -->
          <el-menu-item @click="toggleTheme">
            <span>{{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}</span>
          </el-menu-item>

          <el-menu-item index="/help">
            <span>Help & Support</span>
          </el-menu-item>

          <el-menu-item index="/about">
            <span>About Us</span>
          </el-menu-item>
        </el-menu>
      </div>
    </el-drawer>
  </header>
</template>

<script setup>
// Vue 3 Composition API导入
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search } from '@element-plus/icons-vue'


const router = useRouter()

// === 响应式数据定义 ===
const drawer = ref(false)        // 控制侧边栏显示/隐藏
const keyword = ref('')          // 搜索关键词

// 用户信息对象
const user = ref({
  name: 'Username',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
  isLoggedIn: true              // 登录状态
})

// 徽章数量数据
const favoritesCount = ref(12)   // 收藏数量
const messageCount = ref(5)      // 消息数量
const isDarkMode = ref(false)    // 主题模式状态

// ===== 搜索提示词滚动 =====
const placeholders = [
  'Search   Computer Sci',
  'Search   Lab Clothes',
  'Search   Air Fryer'
]
const currentPlaceholder = ref(placeholders[0])
let index = 0
let intervalId = null

onMounted(() => {
  intervalId = setInterval(() => {
    index = (index + 1) % placeholders.length
    currentPlaceholder.value = placeholders[index]
  }, 3000) // 每 3 秒切换一次
})

onUnmounted(() => {
  clearInterval(intervalId)
})

// === 事件处理函数 ===

/**
 * 搜索功能：跳转到首页并传递搜索参数
 */
function onSearch() {
  router.push({ name: 'home', query: { q: keyword.value } })
}

/**
 * 菜单选择处理：路由跳转并关闭抽屉
 * @param {string} index - 菜单项的索引值（路由路径）
 */
function onMenuSelect(index) {
  if (index !== 'logout') {
    router.push(index)
  }
  drawer.value = false  // 选择后关闭抽屉
}

/**
 * 主题切换功能：切换深色/浅色主题
 */
function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  // 在HTML根元素上添加/移除 dark-theme 类
  document.documentElement.classList.toggle('dark-theme', isDarkMode.value)
  drawer.value = false  // 切换后关闭抽屉
}

/**
 * 登出功能：更新登录状态并跳转到登录页
 */
function onLogout() {
  user.value.isLoggedIn = false
  router.push('/login')
  drawer.value = false
}

/**
 * 购物袋图标组件：内联SVG组件定义
 * 使用对象形式定义的Vue组件
 */
const BagIcon = {
  name: 'BagIcon',
  template: `
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 8h12l1 12H5L6 8Z"/>
      <path d="M9 8V6a3 3 0 0 1 6 0v2"/>
    </svg>`
}
</script>

<style scoped>
/* === 顶栏区域样式 === */
.topbar {
  /* 深蓝色渐变背景 */
  background: #0f1540 100%;
}

/* 容器：设置相对定位，方便绝对定位子元素 */
.bar-inner {
  position: relative;           /* 相对定位，供绝对定位的子元素参考 */
  height: 60px;                 /* 顶栏高度 */
  max-width: 1200px;            /* 最大宽度，居中显示大屏 */
  margin: 0 auto;               /* 水平居中 */
  padding: 0 20px;              /* 左右内边距 */
  display: flex;
  align-items: center;          /* 垂直居中 */
}

/* 左侧 Logo */
.logo {
  font-weight: 800;             /* 加粗字体 */
  font-size: 24px;              /* 字体大小 */
  text-decoration: none;        /* 去掉下划线 */
  color: white;                 /* 白色文字 */
  z-index: 2;                   /* 保证在中间图标之上 */
}

/* 中间图标居中 */
.center-icon {
  position: absolute;           /* 绝对定位脱离文档流 */
  left: 50%;                    /* 水平偏移到父容器中点 */
  transform: translateX(-50%);  /* 精确水平居中 */
  display: flex;
  justify-content: center;
  z-index: 1;                   /* 保证在 Logo 和按钮下面 */
}

/* 右侧按钮组靠右 */
.topbar-actions {
  position: absolute;           /* 绝对定位脱离文档流 */
  right: 20px;                  /* 距离右边 20px */
  top: 50%;                     /* 垂直居中父容器 */
  transform: translateY(-50%);  /* 精确垂直居中 */
  display: flex;
  align-items: center;          /* 垂直居中 */
  gap: 24px;                    /* 按钮间距 */
  z-index: 2;                   /* 保证在中间图标上方 */
}

/* 主题切换按钮：圆形半透明按钮 */
.theme-toggle {
  width: 36px;
  height: 36px;
  border-radius: 50%;            /* 圆形 */
  background: rgba(255, 255, 255, 0.1);   /* 半透明白色背景 */
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 10s ease;     /* 平滑过渡效果 */
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);   /* 悬停时更不透明 */
  transform: scale(1.05);                  /* 轻微放大效果 */
}

.theme-icon {
  font-size: 16px;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));  /* 文字阴影 */
}

/* 汉堡菜单按钮：三条横线布局 */
.hamburger {
  width: 35px;
  height: 20px;
  display: flex;
  flex-direction: column;        /* 垂直排列 */
  justify-content: space-between; /* 均匀分布 */
  background: transparent;
  border: none;
  cursor: pointer;
}

.hamburger span {
  display: block;
  height: 3px;                   /* 线条高度 */
  background: #fff;
  border-radius: 2px;            /* 圆角 */
  transition: all 0.3s ease;     /* 过渡效果 */
}

.hamburger:hover span {
  background: #f0f0f0;           /* 悬停时变浅 */
}

/* === 内容区域样式 === */
.content {
  background: white;
  padding: 16px 20px;
}

.content-inner {
  max-width: 1200px;
  margin: 0 auto;                /* 与顶栏对齐 */
}

/* === 搜索栏样式 === */
.search-row {
  display: flex;
  align-items: center;     /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  gap: 10px;
  padding: 8px 0 10px;
}

.search-input {
  max-width: 720px;              /* 限制搜索框最大宽度 */
  width: 100%;
}

.search-btn {
  border-radius: 999px;          /* 圆角按钮 */
}

/* === 侧边栏样式 === */
.drawer-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fafafa;           /* 浅灰背景 */
}

/* 用户信息区域：纯色背景 */
.user-info {
  display: flex;
  align-items: center;
  padding: 16px 16px;            /* 缩小内边距 */
  background: #0f1540;           /* 纯深蓝色，与顶栏一致 */
  color: white;
  gap: 12px;                     /* 缩小间距 */
  margin-bottom: 6px;            /* 缩小下边距 */
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
}

/* 在线状态标签：小圆角标签 */
.user-status {
  font-size: 12px;
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 10px;
  align-self: flex-start;        /* 左对齐 */
}

.sidebar-menu {
  border: none;
  flex: 1;                       /* 占据剩余空间 */
  background: transparent;
  padding: 0 8px;                /* 缩小左右内边距 */
}

/* 徽章定位：与文字齐平 */
.badge {
  position: absolute;
  right: 18px;       /* 距离右边留点间距 */
  top: 25%;          /* 让徽章的顶部在父元素高度的 25% 位置 */
  transform: translateY(-50%); /* 精准居中 */
}

/* === 响应式设计 === */
@media (max-width: 768px) {
  .bar-inner {
    padding: 0 16px;            /* 移动端减少内边距 */
  }

  .content {
    padding: 12px 16px;
  }

  .topbar-actions {
    gap: 8px;                   /* 移动端减少按钮间距 */
  }

  .theme-toggle {
    width: 32px;                /* 移动端缩小按钮 */
    height: 32px;
  }
}
</style>

<!--
  【非scoped样式】
  专门用于处理Element Plus第三方组件的样式
  这些样式会应用到全局，但通过具体的类名选择器避免污染
-->
<style>
/* === Element Plus 组件样式 === */
/* 搜索输入框：圆角药丸形状 */
.search-input .el-input__wrapper {
  border-radius: 999px;                    /* 完全圆角 */
  background: var(--pill, #f5f5f5);        /* CSS变量 */
  border: 1px solid var(--pill-bd, #ddd);
  box-shadow: none;                         /* 移除默认阴影 */
  transition: all 0.3s ease;                /* 添加过渡效果 */
}

/* 菜单项样式：圆角卡片风格 */
.sidebar-menu .el-menu-item {
  position: relative;              /* 相对定位，为内部绝对定位元素提供参考 */
  height: 40px;                    /* 设置菜单项高度为40px */
  line-height: 40px;               /* 文字垂直居中，行高等于高度 */
  margin-bottom: 3px;              /* 菜单项之间的垂直间距 */
  border-radius: 6px;              /* 圆角矩形效果 */
  transition: all 0.3s ease;       /* 状态变化时添加平滑过渡效果（hover/active等） */
  color: #606266;                  /* 默认文字颜色 */
  padding: 0 12px;                 /* 左右内边距，缩小菜单文字距离边框的间距 */
}
.sidebar-menu .el-menu-item:hover {
  background: #e8f4fd;             /* 鼠标悬停时背景变成浅蓝色 */
  color: #409eff;                  /* 悬停时文字颜色变成 Element Plus 主色 */
}
.sidebar-menu .el-menu-item.is-active {
  background: #409eff;             /* 当前激活的菜单项背景为主蓝色 */
  color: white;                    /* 激活状态文字为白色 */
}

/* === 深色主题样式 === */
/* 使用 html.dark-theme 选择器确保优先级 */
html.dark-theme {
  background-color: #0f172a !important;
  color: #ffffff;
}
html.dark-theme body {
  background-color: #0f172a !important;
  color: #ffffff;
}
html.dark-theme .content {
  background-color: #0f172a !important;
  color: #ffffff;
}

/* 深色主题下的用户信息区域 */
html.dark-theme .user-info {
  background: #0f172a;                      /* 深色主题下的纯色背景 */
}
html.dark-theme .topbar {
  background: #0f172a;
}
html.dark-theme .topbar:hover {
  background: #1e293b;
}
html.dark-theme .content {
  background-color: #0f172a !important;
  color: #ffffff;
}

/* 深色主题下的搜索框 */
html.dark-theme .search-input .el-input__wrapper {
  background-color: #2d2d2d !important;
  border-color: #404040 !important;
  color: #ffffff;
}
html.dark-theme .search-input .el-input__inner {
  color: #ffffff;                           /* 输入文字颜色 */
}

/* 深色主题下的抽屉 */
html.dark-theme .el-drawer {
  background-color: #2d2d2d;
  color: #ffffff;
}
html.dark-theme .drawer-inner {
  background-color: #2d2d2d;
}

/* 深色主题下的菜单项 */
html.dark-theme .sidebar-menu .el-menu-item {
  background-color: transparent;
  color: #ffffff;
}
html.dark-theme .sidebar-menu .el-menu-item:hover {
  background-color: #404040;
}
html.dark-theme .sidebar-menu .el-menu-item.is-active {
  background-color: #409eff;
}
/* 深色主题下的分割线 */
html.dark-theme .el-divider {
  border-color: #404040;
}
</style>
