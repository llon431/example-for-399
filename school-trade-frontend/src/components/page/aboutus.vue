<template>
  <div class="about-page">
    <!-- 1️⃣ 顶部大横幅 -->
    <section class="hero-section">
      <h1>关于我们</h1>
      <p>校园二手交易平台 —— 让闲置流动，让资源共享。</p>
    </section>

    <!-- 2️⃣ 项目介绍（带弧形动画 + 圆形文字） -->
    <section ref="project" class="project-section">
      <!-- 弧形 SVG -->
      <div class="curve">
        <svg viewBox="0 0 1440 150" xmlns="http://www.w3.org/2000/svg">
          <path
              :class="{ animate: projectVisible }"
              d="M0,150 L1440,150 L1440,0 L0,0 Z"
              fill="#2b2b2b"
          ></path>
        </svg>
      </div>

      <!-- 圆形旋转文字 -->
      <div class="circular-text-wrapper" v-if="projectVisible">
        <CircularText
            text="BAG2BAG2BAG2"
            :spinDuration="20"
            onHover="speedUp"
        />
      </div>

      <!-- 文字内容 -->
      <div class="project-content" :class="{ active: projectVisible }">
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
      </div>
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
import CircularText from "@/components/common/CircularText.vue"; // Vue 2 CircularText 组件

export default {
  name: "AboutUs",
  components: { ProfileCard, CircularText },
  data() {
    return {
      currentIndex: 0,
      projectVisible: false,
      team: [
        { name: "Alice Johnson", username: "alice", avatar: "", bio: "前端开发专家，热爱 UI/UX 设计。" },
        { name: "Bob Smith", username: "bob", avatar: "", bio: "后端工程师，擅长数据库与系统架构。" },
        { name: "Cathy Lee", username: "cathy", avatar: "", bio: "产品经理，负责团队沟通与项目推进。" },
        { name: "David Brown", username: "david", avatar: "", bio: "AI 工程师，专注于机器学习与数据分析。" },
        { name: "Eva Green", username: "eva", avatar: "", bio: "市场与品牌专家，热衷于用户体验研究。" }
      ]
    };
  },
  mounted() {
    // 监听滚动切换团队卡片
    window.addEventListener("scroll", this.handleScroll, { passive: true });
    this.handleScroll();

    // 监听项目介绍进入视口
    const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            this.projectVisible = true;
          }
        },
        { threshold: 0.3 }
    );
    observer.observe(this.$refs.project);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      const container = document.querySelector(".team-section");
      const cards = document.querySelector(".cards-container");
      if (!container || !cards) return;

      const totalHeight = cards.offsetHeight;
      const sectionHeight = totalHeight / this.team.length;
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
  background: #1a1a1a;
  font-family: sans-serif;
  color: #f5f5f5;
}

/* 1️⃣ Hero 顶部 */
.hero-section {
  height: 100vh;
  background: linear-gradient(135deg, #1e1e1e 0%, #2c2c2c 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.hero-section h1 {
  font-size: 56px;
  margin-bottom: 20px;
}
.hero-section p {
  font-size: 22px;
  max-width: 700px;
  line-height: 1.6;
  color: #cccccc;
}

/* 2️⃣ 项目介绍 */
.project-section {
  position: relative;
  background: #2b2b2b;
  overflow: hidden;
}

.curve {
  position: absolute;
  top: -1px;
  left: 0;
  width: 100%;
  height: 150px;
  line-height: 0;
}
.curve path {
  transition: d 1.5s ease-in-out;
}
.curve path.animate {
  d: path("M0,150 C480,0 960,0 1440,150 L1440,0 L0,0 Z");
}

/* 圆形旋转文字 */
.circular-text-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 60px;
  position: relative;
  z-index: 2;
}

.project-content {
  padding: 120px 20px 80px;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.project-content.active {
  opacity: 1;
  transform: translateY(0);
}

.project-content h2 {
  font-size: 32px;
  margin-bottom: 20px;
}
.project-content p {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 30px;
  color: #dddddd;
}
.project-content ul {
  list-style: none;
  padding: 0;
}
.project-content li {
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
.content-container {
  display: flex;
  position: relative;
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
  font-size: 28px;
  margin-bottom: 12px;
}
.bio-text p {
  font-size: 18px;
  line-height: 1.8;
  color: #cccccc;
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
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>






