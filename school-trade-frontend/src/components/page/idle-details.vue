<template>
  <div>
    <app-head></app-head>
    <app-body>
      <div class="idle-details-container">
        <!-- 卖家信息 -->
        <div class="seller-info">
          <el-image
              style="width: 60px; height: 60px; border-radius: 5px;"
              :src="idleItemInfo.user.avatar"
              @click="goSeller(idleItemInfo.userId)"
              @keyup.enter="goSeller(idleItemInfo.userId)"
              fit="contain"
          />
          <div class="seller-text">
            <p class="seller-nickname">{{ idleItemInfo.user.nickname }}</p>
            <p class="seller-time">{{ idleItemInfo.user.signInTime.substring(0, 10) }} 加入平台</p>
          </div>
        </div>
        <!-- 商品展示区域 -->
        <div class="details-top">
          <!-- 左侧：大图 + 缩略图 -->
          <div class="image-gallery">
            <!-- 大图 -->
            <div class="main-image">
              <el-image
                  v-if="idleItemInfo.pictureList.length"
                  :src="idleItemInfo.pictureList[activeImage]"
                  style="width: 400px; height: 400px; object-fit: contain;"
                  fit="contain"
              />
            </div>
            <!-- 缩略图 -->
            <div class="thumbnail-row">
              <el-image
                  v-for="(imgUrl, i) in idleItemInfo.pictureList"
                  :key="i"
                  :src="imgUrl"
                  style="width: 70px; height: 70px; margin: 5px; cursor: pointer;"
                  :class="{ active: activeImage === i }"
                  fit="cover"
                  @click="handleThumbnailClick(i)"
              />
            </div>
          </div>

          <!-- 右侧：商品信息 -->
          <div class="details-info">

            <h2 class="details-title">{{ idleItemInfo.idleName }}</h2>
            <p class="details-price">NZD ${{ idleItemInfo.idlePrice }}</p>
            <p class="details-place">Transaction Type：{{ tradeText }}</p>
            <p class="details-place">Condition：{{ newText }}</p>
            <p class="details-place">Post Time：{{formatDate(idleItemInfo.releaseTime) }}</p>
            <!-- 商品描述 -->
            <div class="details-description" v-html="idleItemInfo.idleDetails"></div>
            <div class="details-actions">
              <el-button
                  v-if="!isMaster && idleItemInfo.idleStatus === 1"
                  type="danger"
                  plain
                  @click="onBuyClick(idleItemInfo)"
              >
                BUY!
              </el-button>
              <el-button
                  v-if="!isMaster && idleItemInfo.idleStatus === 1"
                  type="primary"
                  plain
                  @click="favoriteButton(idleItemInfo)"
              >
                {{ isFavorite ? 'Remove From Favorite' : 'Add to Favorite' }}
              </el-button>
              <el-button
                  v-if="isMaster && idleItemInfo.idleStatus === 1"
                  type="danger"
                  plain
                  @click="changeStatus(idleItemInfo, 2)"
              >
                Unlisted items
              </el-button>
              <el-button
                  v-if="isMaster && idleItemInfo.idleStatus === 2"
                  type="primary"
                  plain
                  @click="changeStatus(idleItemInfo, 1)"
              >
                ReListed items
              </el-button>

              <trade-dialog
                  :visible="showTrade"
                  :item-id="itemId"
                  :seller-id="sellerId"
                  :default-price-dollar="defaultPriceDollar"
                  @close="showTrade=false"
                  @created="onTradeCreated"
                  @error="onTradeError"
              />

              <p v-if="tip" class="mt-2 text-sm text-gray-600">{{ tip }}</p>
            </div>
          </div>
        </div>
        <!-- 留言区 -->
        <div class="message-container">
          <h3 class="message-title">All Message</h3>
          <div class="message-send">
            <el-input
                type="textarea"
                autosize
                placeholder="Write your Message..."
                v-model="messageContent"
                maxlength="200"
                show-word-limit
            />
            <div class="message-send-button">
              <el-button plain @click="sendMessage">Send Message</el-button>
            </div>
          </div>

          <div v-for="(mes,index) in messageList" :key="index" class="message-item">
            <div class="message-left">
              <el-image
                  style="width: 50px; height: 50px; border-radius: 5px;"
                  :src="mes.fromU.avatar"
                  fit="contain"
              />
              <div class="message-text">
                <p class="message-nickname">{{ mes.fromU.nickname }}</p>
                <p class="message-content" v-html="mes.content"></p>
                <p class="message-time">{{ mes.createTime }}</p>
              </div>
            </div>
            <div class="message-right">
              <el-button plain @click="replyMessage(index)">Reply</el-button>
            </div>
          </div>
        </div>
      </div>
      <app-foot></app-foot>
    </app-body>
  </div>

</template>

<script>
import AppHead from "../common/AppHeader.vue";
import AppBody from "../common/AppPageBody.vue";
import AppFoot from "../common/AppFoot.vue";
import TradeDialog from '../common/TradeDialog.vue';
import {sendPayload} from "@/utils/websocket";
import { ensureGlobalChat } from '@/utils/chatBus'
import { createChatStore } from '@/stores/chatStoreLite'

export default {
  name: "idle-details-v2",
  components: { AppHead, AppBody, AppFoot, TradeDialog },
  data() {
    return {
      showTrade: false,
      tip: '',
      activeImage: 0,
      messageContent: "",
      messageList: [],
      idleItemInfo: {
        idleName: "",
        idleDetails: "",
        pictureList: [],
        idlePrice: 0,
        idlePlace: "",
        idleStatus: -1,
        idleTrade: -1,
        idleNew: -1,
        releaseTime: "",
        user: { avatar: "", nickname: "", signInTime: "" }
      },
      isMaster: false,
      isFavorite: false,
      favoriteId: 0,
      tradeMap: {
        1: "SELL",
        2: "EXCHANGE",
      },
      newMap: {
        1: "BRAND NEW",
        2: "LIKE NEW",
        3: "USED",
      }
    };
  },
  computed: {
    tradeText() { return this.tradeMap[this.idleItemInfo.idleTrade] || "未知方式"; },
    newText()   { return this.newMap[this.idleItemInfo.idleNew]   || "未知新舊"; },

    itemId() {
      const fromInfo = this.idleItemInfo && this.idleItemInfo.id ? Number(this.idleItemInfo.id) : 0
      const fromRoute = this.$route && this.$route.params && this.$route.params.id ? Number(this.$route.params.id) : 0
      return fromInfo || fromRoute || 0
    },

    sellerId() {
      if (!this.idleItemInfo) return 0
      if (this.idleItemInfo.userId != null) return Number(this.idleItemInfo.userId)
      if (this.idleItemInfo.user && this.idleItemInfo.user.id != null) return Number(this.idleItemInfo.user.id)
      return 0
    },

    defaultPriceDollar() {
      return this.idleItemInfo && this.idleItemInfo.idlePrice != null
          ? Number(this.idleItemInfo.idlePrice)
          : null
    },

    currentUserId() {
      return Number(this.getCookie('shUserId'))
    },

    canBuy() {
      const onShelf = String(this.idleItemInfo.idleStatus) === '1'
      const notSelf = this.sellerId && (this.sellerId !== this.currentUserId)
      return onShelf && notSelf
    }

  },
  created() {
    let id = this.$route.query.id;
    this.$api.getIdleItem({ id }).then(res => {
      if (res.data) {
        res.data.pictureList = JSON.parse(res.data.pictureList);
        this.idleItemInfo = res.data;

        let userId = this.getCookie("shUserId");
        if (userId == this.idleItemInfo.userId) {
          this.isMaster = true;
        }
        this.checkFavorite();
        this.getAllIdleMessage();
      }
    });
    const selfId = String((this.$globalData && this.$globalData.userInfo && this.$globalData.userInfo.id) || this.buyerId)
    ensureGlobalChat(selfId)   // ★ 冪等，不會重複連
  },
  methods: {
    onBuyClick() {
      // 開窗前先檢查關鍵資料
      console.log('[idle-details] 將要傳給 TradeDialog 的參數：', {
        itemId: this.itemId,
        sellerId: this.sellerId,
        buyerId: this.$globalData.userInfo.id,
        defaultPriceDollar: this.defaultPriceDollar, // 若有
      });
      if (!this.itemId) { this.$message.error('找不到商品 ID'); return }
      if (!this.sellerId) { this.$message.error('找不到賣家 ID'); return }
      if (!this.canBuy) { this.$message.warning('不可購買：可能是你自己的商品或未上架'); return }
      this.showTrade = true
    },


    // ✅ 單一來源：點「送出」時呼叫這個（保留你原來的 onTradeCreated 名稱）
    toIsoLocalDateTime (val) {
      // 後端需要 ISO_LOCAL_DATE_TIME：yyyy-MM-ddTHH:mm:ss
      if (!val) return null
      // Date 物件 → 格式化
      if (Object.prototype.toString.call(val) === '[object Date]') {
        const p = n => (n < 10 ? '0' + n : '' + n)
        return (
            val.getFullYear() + '-' +
            p(val.getMonth() + 1) + '-' +
            p(val.getDate()) + 'T' +
            p(val.getHours()) + ':' +
            p(val.getMinutes()) + ':' +
            p(val.getSeconds())
        )
      }
      // 既是字串：若中間是空格，替換成 T
      return String(val).replace(' ', 'T')
    },
    dollarsToCents (v) {
      const n = parseFloat(v)
      return isNaN(n) ? 0 : Math.round(n * 100)
    },

    // ---- 建單 + 發小卡（精簡版）----
    async onTradeCreated (form) {
      // 1) 準備 payload（與 tester 等價）
      const itemId     = this.itemId
      const sellerId   = this.sellerId
      const meetTime   = this.toIsoLocalDateTime(form && form.meetTime)
      const meetPlace  = (form && form.meetPlace) || ''
      const priceCents = (form && typeof form.priceCents === 'number')
          ? form.priceCents
          : this.dollarsToCents(form && form.priceDollar)

      const payload = { itemId, sellerId, meetTime, meetPlace, priceCents }
      console.log('[createTrade payload]', payload)

      // 2) 先建單（JSON，路徑與 tester 一致；fetch 要帶 credentials）
      let tradeId = null
      try {
        const res = await fetch('/api/trades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          body: JSON.stringify(payload),
          credentials: 'include'
        })
        if (!res.ok) throw new Error('HTTP ' + res.status)

        const raw = await res.json()
        // tester 風格：resp.data 可能還包一層 data
        const data    = (raw && raw.data != null) ? raw.data : raw
        const trade   = (data && data.data != null) ? data.data : data
        tradeId       = trade && (trade.id || trade.tradeId)

        if (!tradeId) throw new Error((raw && (raw.msg || raw.message)) || '後端未回 tradeId')
        console.log('[createTrade ok] tradeId=', tradeId)
      } catch (err) {
        console.error('[createTrade failed]', err)
        this.$message && this.$message.error && this.$message.error(err.message || '建立交易失敗')
        return
      }

      // 3) 建單成功 → 發 WS 小卡
      const buyerId = (this.$globalData && this.$globalData.userInfo && this.$globalData.userInfo.id) || this.buyerId
      const card = {
        type: 'TRADE_CARD',
        from: String(buyerId),
        to:   String(sellerId),
        itemId,
        tradeId,
        content: { meetTime, meetPlace, priceCents },
        ts: Date.now()
      }
      console.log('[send TRADE_CARD]', card)

      try {
        const ok = sendPayload(card)
        console.log('[send TRADE_CARD result]', ok)
        this.tip = `已發送交易小卡給賣家（交易 #${tradeId}）`
        try {
          const chat = createChatStore(buyerId, sellerId)   // toId = 你算出的對方 id（buyer/seller）
          chat.addMessage({
            from: 'me',
            kind: 'card',
            card: card,               // 直接塞整個 card，下游 template 已讀 m.card.*
            ts: card.ts
          })
          this.loadConversations && this.loadConversations()
          this.$nextTick(this.scrollToBottom)
          this.$router.push({
            name: 'PrivateChat',
            query: { selfId: buyerId, peerId: sellerId }
          })
        } catch (e) { console.warn('local echo failed', e) }

      } catch (e) {
        console.error('[WS send error]', e)
        this.$message && this.$message.error && this.$message.error('WebSocket 未連線')
      }
    },

    onTradeError(err) {
      console.error('create trade fail:', err)
      this.tip = '建立交易失敗'
    },


    formatDate(dateStr) {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // 月份从 0 开始
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
    handleThumbnailClick(i) {
      this.activeImage = i;
    },
    getAllIdleMessage() {
      this.$api.getAllIdleMessage({ idleId: this.idleItemInfo.id }).then(res => {
        if (res.status_code === 1) this.messageList = res.data;
      });
    },

    checkFavorite() {
      this.$api.checkFavorite({ idleId: this.idleItemInfo.id }).then(res => {
        if (!res.data) {
          this.isFavorite = false;
        } else {
          this.favoriteId = res.data;
          this.isFavorite = true;
        }
      });
    },

    getCookie(cname) {
      let name = cname + "=";
      let ca = document.cookie.split(";");
      for (let c of ca) {
        c = c.trim();
        if (c.indexOf(name) === 0) return c.substring(name.length);
      }
      return "";
    },

    replyMessage(index) {
      this.messageContent = "@" + this.messageList[index].fromU.nickname + " ";
    },
    sendMessage() {
      let content = this.messageContent.trim();
      if (content) {
        this.$api.sendMessage({
          idleId: this.idleItemInfo.id,
          content
        }).then(res => {
          if (res.status_code === 1) {
            this.$message.success("留言成功！");
            this.messageContent = "";
            this.getAllIdleMessage();
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    changeStatus(idle, status) {
      this.$api.updateIdleItem({ id: idle.id, idleStatus: status }).then(res => {
        if (res.status_code === 1) this.idleItemInfo.idleStatus = status;
        else this.$message.error(res.msg);
      });
    },
    buyButton(idle) {
      this.$api.addOrder({ idleId: idle.id, orderPrice: idle.idlePrice }).then(res => {
        if (res.status_code === 1) {
          this.$router.push({ path: "/order", query: { id: res.data.id } });
        } else this.$message.error(res.msg);
      });
    },
    favoriteButton(idle) {
      if (this.isFavorite) {
        this.$api.deleteFavorite({ id: this.favoriteId }).then(res => {
          if (res.status_code === 1) {
            this.isFavorite = false;
            this.$message.success("已取消收藏！");
          }
        });
      } else {
        this.$api.addFavorite({ idleId: idle.id }).then(res => {
          if (res.status_code === 1) {
            this.isFavorite = true;
            this.favoriteId = res.data;
            this.$message.success("已收藏！");
          }
        });
      }
    },
    goSeller: function (sellerId) {
      var myId = null;
      if (this.$store && this.$store.state && this.$store.state.user) {
        myId = this.$store.state.user.userId || this.$store.state.user.id;
      }
      if (!myId && this.$globalData && this.$globalData.userInfo) {
        myId = this.$globalData.userInfo.userId || this.$globalData.userInfo.id;
      }

      if (String(sellerId) === String(myId)) {
        if (this.$route && this.$route.name === 'me') {
          this.$router.replace({ name: 'me', query: { r: Date.now() } });
        } else {
          this.$router.push({ name: 'me' });
        }
      } else {
        this.$router.push({ name: 'user-profile', params: { id: sellerId } });
      }
    }
  }
};
</script>

<style scoped>
.idle-details-container {
  padding: 20px;
  min-height: 85vh;
}
.details-top {
  display: flex;
  gap: 40px;
  margin-bottom: 30px;
}
.image-gallery {
  width: 500px;
}
.main-image {
  border: 1px solid #eee;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.thumbnail-row {
  display: flex;
  overflow-x: auto;
}
.thumbnail-row .el-image {
  border: 2px solid transparent;
}
.thumbnail-row .el-image.active {
  border-color: #409eff;
}
.details-info {
  flex: 1;
}
.details-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 10px;
}
.details-price {
  font-size: 20px;
  color: red;
  font-weight: bold;
  margin-bottom: 10px;
}
.details-place {
  margin-bottom: 20px;
}
.details-actions {
  margin-bottom: 20px;
}
.seller-info {
  display: flex;
  align-items: center;
  margin-top: 20px;
}
.seller-text {
  margin-left: 10px;
}
.seller-nickname {
  font-weight: 600;
}
.seller-time {
  font-size: 12px;
  color: #666;
}
.details-description {
  border-top: 10px solid #f6f6f6;
  padding: 20px 0;
  font-size: 16px;
  line-height: 1.6;
}
.message-container {
  border-top: 10px solid #f6f6f6;
  padding: 20px 0;
}
.message-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
}
.message-send-button {
  text-align: right;
  margin-top: 10px;
}
.message-item {
  border-top: 1px solid #eee;
  padding: 15px 0;
  display: flex;
  justify-content: space-between;
}
.message-left {
  display: flex;
}
.message-text {
  margin-left: 10px;
}
.message-nickname {
  font-weight: 600;
}
.message-content {
  margin: 5px 0;
}
.message-time {
  font-size: 12px;
  color: #666;
}
</style>

