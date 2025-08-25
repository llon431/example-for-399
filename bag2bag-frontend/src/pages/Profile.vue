<template>
  <!-- 根元素 main -->
  <main class="page-container profile-page">
    <!-- 顶部导航区域 -->
    <div class="top-nav">
      <!-- 返回按钮 - 和搜索框对齐 -->
      <button class="back-btn" @click="$router.push('/home')">← Back to Home Page</button>
      <!-- 搜索框占位 - 保持布局对齐 -->
      <div class="search-placeholder"></div>
    </div>

    <!-- 主内容区域 - 带上升动画 -->
    <div class="main-content">
      <!-- 左侧用户信息区域 -->
      <section class="profile-info">
        <!-- 用户头像 - 无小人图标 -->
        <div class="avatar"></div>
        <!-- 编辑资料按钮 -->
        <button class="edit-btn">Edit Your Profile</button>
        <!-- 用户信息列表 - 左右对齐布局 -->
        <ul class="info-list">
          <li>
            <span class="label">Name</span>
            <span class="value">Jacky</span>
          </li>
          <li>
            <span class="label">Rating</span>
            <span class="value rating">⭐⭐⭐⭐⭐</span>
          </li>
          <li>
            <span class="label">Nation</span>
            <span class="value">Taiwan</span>
          </li>
          <li>
            <span class="label">Contact</span>
            <span class="value">027********</span>
          </li>
          <li>
            <span class="label">Address</span>
            <span class="value pending">Wait To Upload</span>
          </li>
          <li>
            <span class="label">Year</span>
            <span class="value pending">Wait To Upload</span>
          </li>
          <li>
            <span class="label">Major</span>
            <span class="value pending">Wait To Upload</span>
          </li>
        </ul>
      </section>

      <!-- 右侧商品展示区域 -->
      <section class="profile-items">
        <!-- 出售商品区域 -->
        <div class="header">
          <h2 class="section-title">Sell</h2>
          <!-- 新上传按钮 - 带悬浮特效 -->
          <button class="upload-btn">New Upload</button>
        </div>
        <!-- 出售商品卡片列表 -->
        <div class="card-list">
          <div class="item-card">
            <div class="edit-icon">✏️</div>
            <div class="price">NZ$ 00.00</div>
            <!-- 商品名称 - 黑白模式下保持黑色 -->
            <div class="name">Item name</div>
          </div>
        </div>

        <!-- 交换商品区域 -->
        <h2 class="section-title" style="margin-top:24px;">Exchange</h2>
        <!-- 交换商品卡片列表 -->
        <div class="card-list">
          <div class="item-card">
            <div class="edit-icon">✏️</div>
            <div class="price">Exchange</div>
            <!-- 商品名称 - 黑白模式下保持黑色 -->
            <div class="name">Item name</div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
// 组件逻辑
// TODO: 以后可以从 Vuex/Pinia 或 API 拉取用户数据
// TODO: 可以添加编辑资料功能
// TODO: 可以添加商品管理功能
</script>

<style scoped>
/* 页面整体布局 */
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 16px;
}

/* 顶部导航区域 - 和搜索框对齐 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 返回按钮 - 和搜索框对齐的样式 */
.back-btn {
  border: none;
  background: transparent;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  color: #333;
  transition: color 0.2s ease;
  padding: 8px 0;
}
.back-btn:hover {
  color: #007b9d;
}

/* 搜索框占位 - 保持布局平衡 */
.search-placeholder {
  width: 100px;
}

/* 主内容区域 - 带上升动画 */
.main-content {
  display: flex;
  gap: 24px;
  animation: slideUp 0.6s ease-out;
  flex-wrap: wrap; /* 允许换行 */
}

/* 上升动画效果 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 左侧用户信息区域 - 蓝色主题 */
.profile-info {
  background: #007b9d;
  color: #fff;
  padding: 20px;
  border-radius: 16px;
  width: 280px;
  flex-shrink: 0;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 123, 157, 0.3);
}

/* 用户头像 - 纯白色圆形 */
.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #fff;
  margin: 0 auto 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 编辑资料按钮 - 白底蓝字带悬浮效果 */
.edit-btn {
  background: rgba(255, 255, 255, 0.95);
  color: #007b9d;
  border: none;
  padding: 10px 16px;
  border-radius: 20px;
  cursor: pointer;
  margin-bottom: 20px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}
.edit-btn:hover {
  background: #fff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

/* 用户信息列表 - 左右对齐布局 */
.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: 14px;
}
.info-list li {
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}
.info-list li:hover {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
}
.info-list li:last-child {
  border-bottom: none;
}

/* 信息标签 - 左对齐加粗 */
.label {
  font-weight: 500;
  text-align: left;
  flex-shrink: 0;
}

/* 信息值 - 右对齐 */
.value {
  text-align: right;
  flex-grow: 1;
  padding-left: 12px;
  font-weight: 400;
}
.value.rating {
  font-size: 16px;
}
.value.pending {
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  font-size: 12px;
}

/* 右侧商品展示区域 */
.profile-items {
  flex: 1;
  min-width: 260px; /* 响应式限制最小宽度 */
}

/* 区域标题和按钮的布局 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 区域标题加粗样式 */
.section-title {
  font-weight: bold;
  margin: 0;
}

/* 新上传按钮 - 带悬浮特效 */
.upload-btn {
  background: #007b9d;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}
.upload-btn:hover {
  background: #005a73;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 123, 157, 0.3);
}

/* 商品卡片网格布局 */
.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 12px;
}

/* 单个商品卡片样式 */
.item-card {
  position: relative;
  width: 160px;
  height: 120px;
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  background: #f9f9f9;
}

/* 编辑图标 - 右上角定位 */
.edit-icon {
  position: absolute;
  top: 6px;
  right: 8px;
  cursor: pointer;
}

/* 商品价格 - 加粗显示，黑白模式下强制黑色 */
.price {
  font-weight: bold;
  margin-top: 24px;
  color: #000 !important;
}

/* 商品名称 - 黑白模式下强制黑色 */
.name {
  font-size: 14px;
  margin-top: 4px;
  color: #000 !important;
}

/* ===== 响应式布局 ===== */
@media (max-width: 900px) {
  .main-content {
    flex-direction: column; /* 左右改上下 */
  }
  .profile-info, .profile-items {
    width: 100%; /* 占满宽度 */
  }
  .card-list {
    justify-content: flex-start; /* 卡片左对齐 */
  }
}
</style>
