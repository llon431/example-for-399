<template>
  <div class="about-page">
    <!-- 1️⃣ 顶部大横幅 -->
    <section class="hero-section">
      <h1>关于我们</h1>
      <p>校园二手交易平台 —— 让闲置流动，让资源共享。</p>
    </section>

    <!-- 2️⃣ 项目介绍 -->
    <section class="project-section">
      <h2>项目介绍</h2>
      <p>
        我们的校园二手交易平台致力于为同学们提供一个安全、便捷、环保的二手交易社区。
        在这里，你可以轻松发布闲置物品，找到实惠的二手好物，并与校友面对面完成交易。
      </p>
      <ul>
        <li>📦 方便快捷：同校交易，线下当面交付</li>
        <li>💰 安全可靠：实名认证保障交易安全</li>
        <li>🌱 绿色环保：让闲置物品再次被利用</li>
        <li>🤝 校园互助：拉近同学之间的距离</li>
      </ul>
    </section>

    <!-- 3️⃣ 团队介绍 -->
    <section class="team-section">
      <div class="header-section">
        <h2>我们的团队</h2>
        <p>向下滑动了解我们</p>
      </div>

      <div class="content-container">
        <!-- 左侧卡片 -->
        <div class="cards-container">
          <div
              v-for="(member, index) in team"
              :key="member.username"
              class="card-wrapper"
              :style="{ zIndex: index + 1 }"
          >
            <ProfileCard
                :name="member.name"
                :username="member.username"
                :avatar="member.avatar"
                class="stack-card"
            />
          </div>
        </div>

        <!-- 右侧介绍 -->
        <div class="bio-container">
          <transition name="fade" mode="out-in">
            <div :key="currentIndex" class="bio-text">
              <h3>{{ team[currentIndex].name }}</h3>
              <p>{{ team[currentIndex].bio }}</p>
            </div>
          </transition>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import ProfileCard from "@/components/common/teamprofilecard.vue";

export default {
  name: "About",
  components: { ProfileCard },
  data() {
    return {
      currentIndex: 0,
      team: [
        {
          name: "Alice Johnson",
          username: "alice",
          avatar: "",
          bio: "前端开发专家，热爱 UI/UX 设计。"
        },
        {
          name: "Bob Smith",
          username: "bob",
          avatar: "",
          bio: "后端工程师，擅长数据库与系统架构。"
        },
        {
          name: "Cathy Lee",
          username: "cathy",
          avatar: "",
          bio: "产品经理，负责团队沟通与项目推进。"
        },
        {
          name: "David Brown",
          username: "david",
          avatar: "",
          bio: "AI 工程师，专注于机器学习与数据分析。"
        },
        {
          name: "Eva Green",
          username: "eva",
          avatar: "",
          bio: "市场与品牌专家，热衷于用户体验研究。"
        }
      ]
    };
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    this.handleScroll();
  },
  beforeUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      const container = document.querySelector(".team-section");
      const cards = document.querySelector(".cards-container");

      if (!container || !cards) return;

      const totalHeight = cards.offsetHeight;
      const sectionHeight = totalHeight / this.team.length;

      // 计算相对 team-section 的滚动量
      const scrollY = window.scrollY - container.offsetTop;
      let index = Math.floor(scrollY / sectionHeight);

      if (index < 0) index = 0;
      if (index >= this.team.length) index = this.team.length - 1;

      this.currentIndex = index;
    }
  }
};
</script>

<style scoped>
.about-page {
  background: #1a1a1a; /* 全局深灰背景 */
  font-family: sans-serif;
  color: #f5f5f5;
}

/* 1️⃣ Hero 顶部 */
.hero-section {
  height: 100vh;
  background: linear-gradient(135deg, #1e1e1e 0%, #2c2c2c 100%);
  color: #f5f5f5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.hero-section h1 {
  font-size: 56px;
  margin-bottom: 20px;
  color: #ffffff;
}
.hero-section p {
  font-size: 22px;
  max-width: 700px;
  line-height: 1.6;
  color: #cccccc;
}

/* 2️⃣ 项目介绍 */
.project-section {
  padding: 80px 20px;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
  border-radius: 12px;
}
.project-section h2 {
  font-size: 32px;
  margin-bottom: 20px;
  color: #ffffff;
}
.project-section p {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 30px;
  color: #dddddd;
}
.project-section ul {
  list-style: none;
  padding: 0;
}
.project-section li {
  font-size: 18px;
  margin: 12px 0;
  color: #bbbbbb;
}

/* 3️⃣ 团队介绍 */
.team-section {
  padding: 80px 20px;
  background: #1f1f1f;
}
.header-section {
  text-align: center;
  margin-bottom: 40px;
}
.header-section h2 {
  color: #ffffff;
}
.header-section p {
  color: #cccccc;
}
.content-container {
  display: flex;
  position: relative;
  justify-content: flex-start;
  gap: 20px;
}
.cards-container {
  position: relative;
  flex: 0 0 600px;
  height: 500vh;
}
.card-wrapper {
  position: sticky;
  top: 100px;
  display: flex;
  justify-content: flex-start;
  height: 100vh;
  padding-left: 250px;
}
.bio-container {
  flex: 0 0 350px;
  position: sticky;
  top: 50px;
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 300px;
}
.bio-text h3 {
  font-size: 28px;   /* 人名标题放大 */
  margin-bottom: 12px;
  color: #ffffff;    /* 保持亮白色 */
}

.bio-text p {
  font-size: 18px;   /* 简介文字放大 */
  line-height: 1.8;  /* 行间距更舒服 */
  color: #cccccc;    /* 用浅灰，避免太亮 */
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>






