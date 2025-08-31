<template>
  <div class="index-page">
    <app-head />

    <app-body>
      <div class="index-wrap">
        <!-- Search bar -->
        <section class="search-row">
          <div class="searchbar">
            <input
                v-model.trim="keyword"
                placeholder="Search  Computer Sci"
                @keyup.enter="onSearch"
            />
            <button class="searchbtn" @click="onSearch" aria-label="search">🔍</button>
          </div>
        </section>

        <!-- Category tiles -->
        <section class="cats">
          <button
              v-for="c in cats"
              :key="c.key"
              class="cat"
              @click="goCategory(c)"
          >
            <span class="cat-icon">
              <img :src="c.img" :alt="c.label" />
            </span>
            <span class="cat-text">{{ c.label }}</span>
          </button>
        </section>

        <!-- You May Like -->
        <h3 class="section-title">You May Like</h3>
        <section class="cards">
          <article
              v-for="(idle, index) in idleList"
              :key="idle.id || index"
              class="card"
              @click="toDetails(idle)"
          >
            <button class="heart" @click.stop="toggleWishlist(idle)" aria-label="wishlist">♡</button>

            <el-image class="cover" :src="idle.imgUrl" fit="cover">
              <div slot="error" class="image-slot"><i class="el-icon-picture-outline">无图</i></div>
            </el-image>

            <div class="price">NZ$ {{ formatPrice(idle.idlePrice) }}</div>
            <div class="name">{{ idle.idleName || 'Item name' }}</div>
          </article>
        </section>

        <!-- Pagination -->
        <div class="pager">
          <el-pagination
              background
              :page-size="8"
              layout="prev, pager, next, jumper"
              :current-page.sync="currentPage"
              :total="totalItem"
              @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <app-foot />
    </app-body>
  </div>
</template>

<script>
import AppHead from '../common/AppHeader.vue'
import AppBody from '../common/AppPageBody.vue'
import AppFoot from '../common/AppFoot.vue'
import IUniv    from '../../assets/book.png'
import ITech    from '../../assets/computer.png'
import IClothes from '../../assets/hood.png'
import ISports  from '../../assets/sports.png'
import ILiving  from '../../assets/sofa.png'
import IOther   from '../../assets/application.png'

export default {
  name: 'index',
  components: { AppHead, AppBody, AppFoot },
  data () {
    return {
      labelName: '0',         // 類別（0=全部）
      idleList: [],
      currentPage: 1,
      totalItem: 0,
      keyword: '',
      // 依你的實際路徑/代碼調整 value
      cats: [
        { key: 'univ',    label: 'University', value: '1', img: IUniv },
        { key: 'tech',    label: 'Tech',       value: '2', img: ITech },
        { key: 'clothes', label: 'Clothes',    value: '3', img: IClothes },
        { key: 'sports',  label: 'Sports',     value: '4', img: ISports },
        { key: 'living',  label: 'Living',     value: '5', img: ILiving },
        { key: 'other',   label: 'Other',      value: '6', img: IOther}
      ]
    }
  },
  created () {
    this.syncFromRoute()
    this.findIdleTiem(this.currentPage)
  },
  watch: {
    '$route.query' () {
      this.syncFromRoute()
      this.findIdleTiem(this.currentPage)
    }
  },
  methods: {
    onSearch () {
      if (!this.keyword) return
      this.$router.push({ path: '/search', query: { q: this.keyword } })
    },
    goCategory (c) {
      this.labelName = String(c.value)
      this.handleClick()
    },
    formatPrice (p) {
      const n = Number(p || 0)
      return n.toFixed(2)
    },

    // ===== 資料讀取，沿用你原本的 API 命名 =====
    syncFromRoute () {
      this.currentPage = Number(this.$route.query.page || 1)
      this.labelName = (this.$route.query.labelName !== undefined)
          ? String(this.$route.query.labelName)
          : '0'
    },
    findIdleTiem (page) {
      const loading = this.$loading({
        lock: true, text: '加载数据中', spinner: 'el-icon-loading', background: 'rgba(0,0,0,0)'
      })

      const labelNum = Number(this.labelName || 0)
      const isAll = !(isFinite(labelNum) && labelNum > 0)
      const api = isAll ? this.$api.findIdleTiem : this.$api.findIdleTiemByLable
      const params = isAll ? { page, nums: 8 } : { idleLabel: labelNum, page, nums: 8 }

      api(params).then(res => {
        const data = (res && res.data) ? res.data : res
        const list = (data && Array.isArray(data.list)) ? data.list : []
        this.idleList = list.map(it => {
          let pictures = []
          try { pictures = JSON.parse(it.pictureList || '[]') } catch (e) {}
          const timeStr = it.releaseTime
              ? (it.releaseTime.substring(0, 10) + ' ' + it.releaseTime.substring(11, 19))
              : ''
          return {
            ...it,
            timeStr,
            imgUrl: pictures[0] || '',
            user: it.user || {}
          }
        })
        this.totalItem = Number((data && data.count) || 0)
      }).catch(e => {
        console.log(e)
        this.idleList = []
        this.totalItem = 0
      }).finally(() => loading.close())
    },
    handleClick () {
      const q = { page: 1 }
      if (Number(this.labelName) > 0) q.labelName = this.labelName
      this.$router.replace({ query: q })
    },
    handleCurrentChange (val) {
      const q = { page: val }
      if (Number(this.labelName) > 0) q.labelName = this.labelName
      this.$router.replace({ query: q })
    },
    toDetails (idle) {
      this.$router.push({ path: '/details', query: { id: idle.id } })
    },
    toggleWishlist (idle) {
      // 這裡先做占位，避免點到卡片
      console.log('toggle wishlist', idle && idle.id)
    }
  }
}
</script>

<style scoped>
:root { --nav: #0c1240; --accent: #0c1240; --line: #27a5ff; --muted: #e5e7eb; }

.index-wrap { background: #fff; }

/* Search */
.search-row { display: flex; justify-content: center; margin-top: 14px; }
.searchbar {
  display: flex; width: min(640px, 92%);
  background: #fff; border: 1px solid #d9dee7; border-radius: 9999px;
  box-shadow: 0 2px 8px rgba(0,0,0,.06); overflow: hidden;
}
.searchbar input { flex: 1; padding: 12px 16px; border: 0; outline: none; font-size: 14px; }
.searchbtn { width: 56px; border: 0; background: #fff; cursor: pointer; font-size: 18px; }
.searchbtn:hover { background: #f3f4f6; }

/* Categories */
.cats { display: grid; grid-template-columns: repeat(6, minmax(100px, 1fr)); gap: 16px; padding: 24px 32px; }
.cat {
  background: var(--nav); color: #fff; border-radius: 16px; height: 92px;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,.06); border: 2px solid rgba(255,255,255,.06);
}
.cat:hover { transform: translateY(-2px); transition: transform .15s ease; }
.cat-icon { display: grid; place-items: center; margin-bottom: 6px; }
.cat-icon img { width: 34px; height: 34px; object-fit: contain; filter: invert(1); }
.cat-text { font-size: 14px; }

/* Section title */
.section-title { font-weight: 700; margin: 8px 32px 10px; }

/* Cards */
.cards { display: grid; grid-template-columns: repeat(3, minmax(200px, 1fr)); gap: 24px; padding: 8px 32px 24px; }
.card { position: relative; background: #fff; border-radius: 14px; border: 6px solid #d6dee5; padding: 10px; height: 220px; cursor: pointer; }
.cover { width: 100%; height: 120px; border-radius: 8px; background: #f9fafb; }
.heart { position: absolute; top: 10px; right: 12px; background: #fff; border: 0; font-size: 18px; cursor: pointer; }
.price { position: absolute; left: 18px; top: 134px; background: #eef0f3; border-radius: 9999px; padding: 4px 10px; font-size: 12px; color: #111827; }
.name { position: absolute; left: 12px; right: 12px; bottom: 12px; background: var(--nav); color: #fff; border-radius: 8px; padding: 8px 12px; font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Pagination */
.pager { display: flex; justify-content: center; padding: 8px 0 32px; }

/* Responsive */
@media (max-width: 1024px) {
  .cats { grid-template-columns: repeat(3, 1fr); }
  .cards { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .cats { grid-template-columns: repeat(2, 1fr); }
  .cards { grid-template-columns: 1fr; }
}
</style>
