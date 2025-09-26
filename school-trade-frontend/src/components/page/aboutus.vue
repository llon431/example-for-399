<template>
  <div class="about-page">
    <!-- 1️⃣ 顶部大横幅 -->
    <section class="hero-section">
      <h1>ABOUT US</h1>
      <p>
        Campus Second-Hand Trading Platform — Keeping unused items in circulation and enabling resource sharing.
      </p>
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
        <h2>WHY WE HERE</h2>
        <p>
          Our campus second-hand marketplace is dedicated to providing students with a secure, convenient and eco-friendly community for trading pre-owned items.
          Here, you can effortlessly list unused possessions, discover great bargains on second-hand goods, and complete transactions face-to-face with fellow alumni.
        </p>
        <ul>
          <li>Convenient and swift: on-campus transactions with face-to-face delivery</li>
          <li>Secure and reliable: Real-name authentication safeguards transaction security.</li>
          <li>Green and eco-friendly: giving unused items a new lease of life</li>
          <li>Campus Mutual Support: Bridging the Gap Between Students</li>
        </ul>
      </div>
    </section>

    <section class="flow">
      <h2 class="flow-title">How It Works</h2>
      <div class="flow-steps">
        <div class="step">
          <div class="icon">👜</div>
          <h3>1. List Your Bag</h3>
          <p>Upload photos and set your price in minutes.</p>
        </div>
        <div class="step">
          <div class="icon">🔍</div>
          <h3>2. Get Discovered</h3>
          <p>Shoppers find your listing easily.</p>
        </div>
        <div class="step">
          <div class="icon">🤝</div>
          <h3>3. Make a Deal</h3>
          <p>Chat and confirm your buyer securely.</p>
        </div>
        <div class="step">
          <div class="icon">🚚</div>
          <h3>4. Ship & Get Paid</h3>
          <p>Send your item and receive payment fast.</p>
        </div>
      </div>
    </section>

    <!-- 3️⃣ 团队介绍 -->
    <section class="team-section">
      <div class="header-section">
        <h2>OUR TEAM</h2>
        <p>Scroll down to learn more about us</p>
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
        { name: "Jack Yang", username: "iceeee", avatar: "", bio: "Team Leader & Full stack" },
        { name: "Shengwei Ni", username: "Pony", avatar: "", bio: "Database & Back stack" },
        { name: "Haixiang Xin", username: "lmzxmg", avatar: "", bio: "Front-end designer" },
        { name: "Xinyi Qin", username: "X", avatar: "", bio: "Front-end designer" },
        { name: "Shenglong Li", username: "Lee", avatar: "", bio: "Database & Back-stack" }
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
  },
};

</script>

<style scoped>
.about-page {
  background: #1a1a1a;
  font-family: sans-serif;
  color: #f5f5f5;
}

/* 1️⃣ Hero 顶部 */
.about-page {
  min-height: 100vh; /* 保证覆盖整个视口 */
  background: #2b2b2b;
  background-repeat: no-repeat;
  background-attachment: fixed; /* 背景固定，不随滚动改变颜色 */
  color: white;
  font-family: sans-serif;
}

/* 大标题部分 */
.hero-section {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 20px;
}

.hero-section h1 {
  font-size: 96px;
  margin-bottom: 30px;
  font-weight: bold;
  text-shadow:
      0 0 15px rgba(255, 255, 255, 0.7),
      0 0 30px rgba(255, 255, 255, 0.5),
      0 0 60px rgba(0, 153, 255, 0.6);
}

.hero-section p {
  font-size: 28px;
  max-width: 900px;
  line-height: 1.8;
  color: #f5f5f5;
}

/* 2️⃣ 项目介绍 */
.project-section {
  min-height: 100vh;
  background: linear-gradient(
      to bottom,
      #1e3c72 0%,
      #2b2b2b 50%,
      #2b2b2b 100%
  );
  background-repeat: no-repeat;
  background-attachment: fixed; /* 背景固定 */
  background-size: cover; /* 保证铺满 */
  color: white;
  font-family: sans-serif;
  position: relative;
  overflow: hidden;
  padding-top: 80px;
}

/* 圆弧 SVG */
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

/* 项目介绍文字内容 */
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

.flow {
  padding: 80px 40px;
  background: #2b2b2b
;
  text-align: center;
}

.flow-title {
  font-size: 32px;
  margin-bottom: 50px;
  color: white;
}

.flow-steps {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  max-width: 1200px;
  margin: 0 auto;
}

.step {
  flex: 1 1 220px;
  margin: 20px;
  padding: 20px;
  border-radius: 12px;
  background: #1e3c72; /* 浅蓝背景块 */
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  transition: transform 0.3s ease;
}

.step:hover {
  transform: translateY(-6px);
}

.step .icon {
  font-size: 40px;
  margin-bottom: 15px;
}

.step h3 {
  font-size: 20px;
  margin-bottom: 10px;
  color: white;
}

.step p {
  font-size: 16px;
  color: white;
}

/* 3️⃣ 团队介绍 */
.team-section {
  padding: 80px 20px;
  background: #2b2b2b;
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






