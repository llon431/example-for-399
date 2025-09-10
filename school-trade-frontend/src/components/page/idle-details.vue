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
            <p class="details-place">发布时间：{{formatDate(idleItemInfo.releaseTime) }}</p>
            <!-- 商品描述 -->
            <div class="details-description" v-html="idleItemInfo.idleDetails"></div>
            <div class="details-actions">
              <el-button
                  v-if="!isMaster && idleItemInfo.idleStatus === 1"
                  type="danger"
                  plain
                  @click="buyButton(idleItemInfo)"
              >
                立即购买
              </el-button>
              <el-button
                  v-if="!isMaster && idleItemInfo.idleStatus === 1"
                  type="primary"
                  plain
                  @click="favoriteButton(idleItemInfo)"
              >
                {{ isFavorite ? '取消收藏' : '收藏' }}
              </el-button>
              <el-button
                  v-if="isMaster && idleItemInfo.idleStatus === 1"
                  type="danger"
                  plain
                  @click="changeStatus(idleItemInfo, 2)"
              >
                下架
              </el-button>
              <el-button
                  v-if="isMaster && idleItemInfo.idleStatus === 2"
                  type="primary"
                  plain
                  @click="changeStatus(idleItemInfo, 1)"
              >
                重新上架
              </el-button>
            </div>
          </div>
        </div>
        <!-- 留言区 -->
        <div class="message-container">
          <h3 class="message-title">全部留言</h3>
          <div class="message-send">
            <el-input
                type="textarea"
                autosize
                placeholder="留言提问..."
                v-model="messageContent"
                maxlength="200"
                show-word-limit
            />
            <div class="message-send-button">
              <el-button plain @click="sendMessage">发送留言</el-button>
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
              <el-button plain @click="replyMessage(index)">回复</el-button>
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

export default {
  name: "idle-details-v2",
  components: { AppHead, AppBody, AppFoot },
  data() {
    return {
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
    tradeText() {
      return this.tradeMap[this.idleItemInfo.idleTrade] || "未知方式";
    },
    newText() {
      return this.newMap[this.idleItemInfo.idleNew] || "未知新旧";
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
  },
  methods: {
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

