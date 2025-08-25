<template>
  <main class="page-container">
    <!-- 搜尋下方：推薦連結/快捷導覽（示例） -->
    <section class="recommend-row">
      <a v-for="l in rec" :key="l.text" class="rec-link" :href="l.href">
        {{ l.text }}
      </a>
    </section>
  
    <!-- 分類按鈕（從 Navbar 移過來） -->
    <section class="quick-cats">
      <button
        v-for="c in cats"
        :key="c.key"
        class="cat-btn"
        @click="selectCat(c.key)"
        :class="{ active: c.key === selectedCatKey }"
      >
    <span class="cat-icon">
      <img :src="c.img" :alt="c.label" />
    </span>
        <span class="cat-text">{{ c.label }}</span>
      </button>
    </section>

    <!-- 子分類面板（點了上面的分類才會出現） -->
    <transition name="fade-slide">
      <div v-if="selectedCatKey" class="cat-panel">
        <h3 class="panel-title">{{ currentCatLabel }}</h3>

        <ul class="subcat-grid">
          <li v-for="s in subcats[selectedCatKey]" :key="s.text" class="subcat-item">
            <!-- 你可以用 router，也可以用 a 連到你的頁面 -->
            <a @click.prevent="goSubcat(s)" href="#">
              {{ s.text }}
            </a>
          </li>
        </ul>
      </div>
    </transition>

    <!-- 下方保留你的首頁其他內容 -->
    <h2 style="margin: 20px 0 8px;">University</h2>
    <p style="color:#666">（這裡先放占位內容，你之後替換為實際版面）</p>

    <!-- you may like -->
    <section class = "recommend-cards">
      <h3 class="sec-title">You may Like</h3>
      <div class = "card-row">
        <article v-for =  "p in cards" :key = "p.id" class = "card">
          <div class = "card-inner">
            <button class = "fav" :aria-label="p.liked ? 'unlike' : 'like'" @click="toggleFav(p)">
              {{ p.liked ? '❤️' : '🤍' }}
            </button>
            <div class = "thumb">
              <img :src="p.img" :alt="p.name"/>
            </div>
            <div class = "price">{{ p.price }}</div>
            <div class = "name">{{ p.name }}</div>
          </div>
        </article>
      </div>
    </section>
  </main>

  <!-- 底部半圆形装饰图案 -->
  <div class = "bottom-decor">
    <div class = "semi-circle"></div>
  </div>
</template>



<script setup>
import { ref, onMounted, computed } from 'vue'

const cards = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(8)
const loading = ref(false)
const errorMsg = ref('')

function mapItemToCard(item) {
  return {
    id: item.id,
    name: item.title,
    img: item.coverUrl || 'https://via.placeholder.com/400x300?text=No+Image',
    price: item.price != null ? `$${Number(item.price).toFixed(2)}` : 'N/A',
    liked: false,
  }
}

async function fetchCards(append = false) {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch(`/api/items/homepage?page=${page.value}&pageSize=${pageSize.value}`)
    const json = await res.json()
    if (json.code === 200 && json.data) {
      const list = (json.data.items || []).map(mapItemToCard)
      total.value = json.data.total ?? 0
      cards.value = append ? cards.value.concat(list) : list
    } else {
      errorMsg.value = json.msg || 'Load failed'
      if (!append) cards.value = []
    }
  } catch (e) {
    errorMsg.value = String(e)
    if (!append) cards.value = []
  } finally {
    loading.value = false
  }
}

function toggleFav(p) {
  p.liked = !p.liked
}

function loadMore() {
  if (cards.value.length >= total.value || loading.value) return
  page.value += 1
  fetchCards(true)
}

/** 類別（沿用你原本的 cats） */
const cats = [
  { key: 'univ',   label: 'university', img: '/university.png' },
  { key: 'tech',   label: 'tech',       img: '/tech.png' },
  { key: 'clothes',label: 'clothes',    img: '/clothes.png' },
  { key: 'sports', label: 'sports',     img: '/sports.png' },
  { key: 'living', label: 'living',     img: '/living.png' },
  { key: 'other',  label: 'others',     img: '/others.png' },
]

/** 點擊分類 → 展開子分類 */
const selectedCatKey = ref(null)

const subcats = {
  univ: [
    { text: 'Law School', href: '/univ/law' },
    { text: 'Business School', href: '/univ/business' },
    { text: 'Engineering and Design', href: '/univ/eng' },
    { text: 'Medical & Health Sciences', href: '/univ/med' },
    { text: 'Science', href: '/univ/science' },
    { text: 'Bioengineering Institute', href: '/univ/bio' },
    { text: 'Research Institutes & Centres', href: '/univ/research' },
    { text: 'Arts and Education', href: '/univ/arts' },
  ],
  tech: [
    { text: 'Laptops', href: '/tech/laptops' },
    { text: 'Phones', href: '/tech/phones' },
    { text: 'Accessories', href: '/tech/accessories' },
  ],
  clothes: [
    { text: 'Jackets', href: '/clothes/jackets' },
    { text: 'Shoes', href: '/clothes/shoes' },
    { text: 'Accessories', href: '/clothes/accessories' },
  ],
  sports: [
    { text: 'Basketball', href: '/sports/basketball' },
    { text: 'Badminton', href: '/sports/badminton' },
    { text: 'Fitness', href: '/sports/fitness' },
  ],
  living: [
    { text: 'Furniture', href: '/living/furniture' },
    { text: 'Kitchen', href: '/living/kitchen' },
    { text: 'Decor', href: '/living/decor' },
  ],
  other: [
    { text: 'Coupons', href: '/other/coupons' },
    { text: 'Services', href: '/other/services' },
    { text: 'Freebies', href: '/other/freebies' },
  ],
}

const currentCat = computed(() => cats.find(c => c.key === selectedCatKey.value) || null)
const currentSubcats = computed(() => subcats[selectedCatKey.value] ?? [])
const currentCatLabel = computed(() => currentCat.value ? (currentCat.value.label.charAt(0).toUpperCase() + currentCat.value.label.slice(1)) : '')

function selectCat(key) {
  selectedCatKey.value = (selectedCatKey.value === key) ? null : key
}

function goSubcat(s) {
  // 若有 vue-router：import { useRouter } from 'vue-router'；router.push(s.href)
  if (s?.href) window.location.href = s.href
}

function goCategory(c) {
  console.log('go category:', c)
}

onMounted(fetchCards)
</script>



<style scoped>
/* 推薦連結列（搜尋下面） */
.recommend-row {
  display:flex; flex-wrap:wrap; gap:14px;
  margin: 10px 0 16px;
}
.rec-link {
  color:#0f1540; text-decoration:none; font-weight:600;
  padding: 6px 8px; border-radius:8px;
}
.rec-link:hover { background:#eef1f6; }

/* Quick categories（沿用你原本樣式） */
.quick-cats {
  display:grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap:12px;
  padding: 8px 0 16px;  /* 這裡不需要左右 padding，由 page-container 控制 */
}

.cat-btn {
  cursor:pointer; border:none; background:var(--nav-bg); color:#fff;
  border-radius:12px; width:110px; height:110px;   /* 正方形 */
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  transition: transform .08s ease;
}

.cat-btn:active { transform: scale(.98); }
.cat-icon {
  width:48px; height:48px; border-radius:10px; margin-bottom:6px; overflow:hidden;
  display:flex; align-items:center; justify-content:center;
}
.cat-icon img { width:100%; height:100%; object-fit:cover; }
.cat-text { font-size:13px; }

/* RWD：小螢幕改 3 欄 */
@media (max-width: 768px) {
  .quick-cats { grid-template-columns: repeat(3, 1fr); }
  .cat-btn { width:100%; height:100px; }
}

/* You may like cards */
.recommend-cards h3{margin:8px 0 14px;font-size: 18px}
.card-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:22px}
.card {
  background: #d6dfe3;           /* 浅灰框色 */
  border-radius: 22px;           /* 大圆角 */
  padding: 14px;                 /* 留出内距形成“内框” */
  box-shadow: 0 6px 12px rgba(16,24,40,.12);
}

.card-inner {
  position: relative;
  background: #fff;
  border-radius: 12px;
  height: 200px;                 /* 可按需要调整高度 */
  overflow: hidden;
  --namebar-h: 56px;         /* ✅ 明确名称条高度（关键） */
}
/* 背景图 */
.thumb{height:150px;background:#ffffff}
.thumb img{ width:100%; height:100%; object-fit:cover; }
.fav{position:absolute;top:10px;right:10px;border:none;background:#fff;border-radius:999px;width:32px;height:32px;box-shadow:0 2px 6px rgba(0,0,0,.15);cursor:pointer}
.price{
  position:absolute;
  left:12px;
  bottom:calc(var(--namebar-h) + 12px); /* ✅ 用变量计算，永不跑偏 */
  background:#080808; color:#fff;
  border-radius:999px; padding:6px 10px; font-size:12px; font-weight:700;
  z-index:2;
}

.name{
  position: absolute;
  left: 0; right: 0; bottom: 0;
  height: var(--namebar-h);
  background: #0f1540;
  color: #fff;
  padding: 12px 16px;
  font-weight: 700;
  display: flex; align-items: center;
  box-shadow: 0 3px 8px rgba(0,0,0,.25);
}

.cat-btn.active { outline: 2px solid #fff; box-shadow: 0 0 0 3px rgba(255,255,255,.25); }
.cat-panel { margin-top:16px; background:#0d1240; color:#fff; border-radius:12px; padding:16px 20px; }
.panel-title { font-weight:700; margin-bottom:12px; }
.subcat-grid { display:grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap:12px 32px; list-style:none; padding:0; margin:0; }
.subcat-item a { color:#fff; text-decoration:none; }
.subcat-item a:hover { text-decoration:underline; }
.fade-slide-enter-active,.fade-slide-leave-active { transition: all .18s ease; }
.fade-slide-enter-from,.fade-slide-leave-to { opacity:0; transform: translateY(-6px); }

</style>
