<template>
  <div>
    <app-head></app-head>
    <app-body>
      <div class="idle-details-container">
        <!-- 用户信息头部 -->
        <div class="user-header" @click="goUserHome(idleItemInfo.userId)" style="cursor: pointer;">
          <el-image
              style="width: 60px; height: 60px; border-radius: 50%;"
              :src="idleItemInfo.user.avatar"
              fit="cover"
          ></el-image>
          <div class="user-details">
            <div class="user-name">{{ idleItemInfo.user.nickname }}</div>
            <div class="join-date">{{ idleItemInfo.user.signInTime.substring(0,10) }} 加入平台</div>
          </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="images-section">
          <!-- 缩略图 -->
          <div class="thumbnail-wrapper">
            <div class="thumbnail-list" ref="thumbnailList">
              <el-image
                  v-for="(imgUrl, index) in idleItemInfo.pictureList"
                  :key="index"
                  class="thumbnail"
                  :class="{ active: index === activeImageIndex }"
                  :style="{ height: thumbnailHeight + 'px' }"
                  :src="imgUrl"
                  fit="cover"
                  @click="handleThumbnailClick(index)"
                  :ref="'thumbnail-' + index"
              />
            </div>
          </div>

          <!-- 主图展示 -->
          <div class="main-image" ref="mainImage">
            <el-image
                v-if="idleItemInfo.pictureList.length > 0"
                :src="idleItemInfo.pictureList[activeImageIndex]"
                fit="contain"
                :preview-src-list="idleItemInfo.pictureList"
                :initial-index="activeImageIndex"
            />
          </div>

          <!-- 右侧详细信息 -->
          <div class="details-section">
            <div class="product-title">{{ idleItemInfo.idleName }}</div>

            <!-- 价格和状态 -->
            <div class="price-section">
              <div class="current-price">NZD ${{ idleItemInfo.idlePrice }}</div>
              <!-- <div v-if="idleItemInfo.idle_original_price" class="original-price">
                原价: NZD ${{ idleItemInfo.idle_original_price }}
              </div> -->
            </div>

            <!-- 商品属性 -->
            <div class="product-attributes">
              <div class="attribute-item">
                <span class="attr-label">交易方式:</span>
                <span class="attr-value">{{ idleItemInfo.idle_trade === 1 ? '出售' : '交换' }}</span>
              </div>
              <div class="attribute-item">
                <span class="attr-label">新旧程度:</span>
                <span class="attr-value">
                  {{ idleItemInfo.idle_new === 1 ? '全新' : idleItemInfo.idle_new === 2 ? '九成新' : '二手' }}
                </span>
              </div>
              <div class="attribute-item">
                <span class="attr-label">发布时间:</span>
                <span class="attr-value">{{ idleItemInfo.release_time }}</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <div v-if="!isMaster && idleItemInfo.idle_status !== 1" class="status-message">
                商品已下架或删除
              </div>
              <template v-else>
                <el-button v-if="!isMaster && idleItemInfo.idle_status === 1"
                           type="primary"
                           class="btn-buy"
                           @click="buyButton(idleItemInfo)">
                  立即购买
                </el-button>
                <el-button v-if="!isMaster && idleItemInfo.idle_status === 1"
                           type="success"
                           class="btn-favorite"
                           @click="favoriteButton(idleItemInfo)">
                  {{ isFavorite ? '取消收藏' : '收藏' }}
                </el-button>
                <el-button v-if="isMaster && idleItemInfo.idle_status === 1"
                           type="danger"
                           @click="changeStatus(idleItemInfo, 2)">
                  下架商品
                </el-button>
                <el-button v-if="isMaster && idleItemInfo.idle_status === 2"
                           type="primary"
                           @click="changeStatus(idleItemInfo, 1)">
                  重新上架
                </el-button>
              </template>
            </div>

            <!-- 商品详情描述 -->
            <div class="product-description">
              <h3>商品详情</h3>
              <div class="description-content" v-html="idleItemInfo.idleDetails"></div>
            </div>
          </div>
        </div>

        <!-- 留言区域 -->
        <div class="comments-section" id="replyMessageLocation">
          <h3 class="comments-title">用户留言</h3>

          <!-- 发表留言 -->
          <div class="comment-form">
            <div v-if="isReply" class="reply-notification">
              <span>回复 @{{ replyData.toUserNickname }}: {{ replyData.toMessage }}</span>
              <el-button type="text" @click="cancelReply" class="cancel-reply">取消</el-button>
            </div>
            <el-input
                type="textarea"
                :rows="3"
                placeholder="写下你的留言..."
                v-model="messageContent"
                maxlength="200"
                show-word-limit>
            </el-input>
            <div class="form-actions">
              <el-button type="primary" class="btn-send" @click="sendMessage">发表留言</el-button>
            </div>
          </div>

          <!-- 留言列表 -->
          <div class="comments-list">
            <div v-for="(message, index) in messageList"
                 :key="index"
                 class="comment-item">
              <el-card class="message-card" shadow="hover">
                <div slot="header" class="comment-header">
                  <span class="commenter-name">{{ message.fromU.nickname }}</span>
                  <span v-if="message.toU.nickname" class="reply-target">回复 @{{ message.toU.nickname }}</span>
                  <span class="comment-time">{{ message.createTime }}</span>
                </div>
                <div class="comment-text" v-html="message.content"></div>
                <div class="comment-actions">
                  <el-button type="text" size="small" class="btn-reply" @click="replyMessage(index)">回复</el-button>
                </div>
              </el-card>
            </div>
          </div>
        </div>
      </div>
      <app-foot></app-foot>
    </app-body>
  </div>
</template>

<script>
import AppHead from '../common/AppHeader.vue';
import AppBody from '../common/AppPageBody.vue';
import AppFoot from '../common/AppFoot.vue';

export default {
  name: "idle-details",
  components: { AppHead, AppBody, AppFoot },
  data() {
    return {
      messageContent: '',
      toUser: null,
      toMessage: null,
      isReply: false,
      replyData: { toUserNickname: '', toMessage: '' },
      messageList: [],
      idleItemInfo: {
        id:'', idleName:'', idleDetails:'', pictureList:[],
        idlePrice:0, idle_original_price:0, idle_place:'', idle_label:'',
        idle_status:-1, idle_trade:1, idle_new:1, release_time:'', userId:'',
        user:{ avatar:'', nickname:'', signInTime:'' },
      },
      isMaster: false,
      isFavorite: false,
      favoriteId: 0,
      activeImageIndex: 0   // 新增：当前大图索引
    };
  },
  created() {
    const id = this.$route.query.id; // 获取 URL 中的 id
    this.$api.getIdleItem({ id }).then(res => {
      if(res.data){
        let list = res.data.idleDetails.split(/\r?\n/);
        res.data.idleDetails = list.map(line=>`<p>${line}</p>`).join('');
        res.data.pictureList = JSON.parse(res.data.pictureList);
        this.idleItemInfo = res.data;
        if(this.getCookie('shUserId') == this.idleItemInfo.userId) this.isMaster = true;
        this.checkFavorite();
        this.getAllIdleMessage();
      }
    });
  },
  methods: {
    goUserHome(userId) {
      this.$router.push({ path: '/user', query: { id: userId } });
    },
    getAllIdleMessage() {
      this.$api.getAllIdleMessage({ idleId:this.idleItemInfo.id })
          .then(res => { if(res.status_code===1) this.messageList=res.data; });
    },
    loadUserInfo(userId) {
      // 调用 API 获取该用户信息
      this.$api.getUserInfo({ id: userId }).then(res => {
        if(res.status_code === 1) this.userInfo = res.data;
      });
    },
    checkFavorite() {
      this.$api.checkFavorite({ idleId:this.idleItemInfo.id })
          .then(res => { this.isFavorite = !!res.data; if(res.data) this.favoriteId=res.data; });
    },
    getCookie(cname){
      let name = cname + "=";
      let ca = document.cookie.split(';');
      for(let c of ca){ c=c.trim(); if(c.indexOf(name)===0) return c.substring(name.length); }
      return "";
    },
    replyMessage(index){
      this.isReply = true;
      this.replyData.toUserNickname = this.messageList[index].fromU.nickname;
      this.replyData.toMessage = this.messageList[index].content.substring(0,10) + (this.messageList[index].content.length>10?'...':'');
      this.toUser = this.messageList[index].userId;
      this.toMessage = this.messageList[index].id;
      $('html,body').animate({ scrollTop: $("#replyMessageLocation").offset().top-100 }, 500);
    },
    changeStatus(idle,status){
      this.$api.updateIdleItem({ id:idle.id, idleStatus:status }).then(res=>{
        if(res.status_code===1) this.idleItemInfo.idle_status=status;
        else this.$message.error(res.msg);
      });
    },
    buyButton(idleItemInfo){
      this.$api.addOrder({ idleId:idleItemInfo.id, orderPrice:idleItemInfo.idlePrice })
          .then(res => { if(res.status_code===1) this.$router.push({path:'/order', query:{id:res.data.id}}); else this.$message.error(res.msg); });
    },
    favoriteButton(idleItemInfo){
      if(this.isFavorite){
        this.$api.deleteFavorite({ id: this.favoriteId })
            .then(res=>{ if(res.status_code===1){ this.$message.success('已取消收藏'); this.isFavorite=false; } else this.$message.error(res.msg); });
      } else {
        this.$api.addFavorite({ idleId: idleItemInfo.id })
            .then(res=>{ if(res.status_code===1){ this.$message.success('已收藏'); this.isFavorite=true; this.favoriteId=res.data; } else this.$message.error(res.msg); });
      }
    },
    cancelReply(){ this.isReply=false; this.toUser=this.idleItemInfo.userId; this.toMessage=null; this.replyData={toUserNickname:'',toMessage:''}; },
    sendMessage(){
      let content=this.messageContent.trim();
      if(!this.toUser) this.toUser=this.idleItemInfo.userId;
      if(content){
        let contenHtml = content.split(/\r?\n/).join('<br>');
        this.$api.sendMessage({ idleId:this.idleItemInfo.id, content:contenHtml, toUser:this.toUser, toMessage:this.toMessage })
            .then(res=>{ if(res.status_code===1){ this.$message.success('留言成功'); this.messageContent=''; this.cancelReply(); this.getAllIdleMessage(); } else this.$message.error(res.msg); });
      }else this.$message.error("留言为空");
    },
    updateThumbnailHeight() {
      this.$nextTick(() => {
        const mainImgEl = this.$refs.mainImage;
        if (mainImgEl) {
          const h = mainImgEl.clientHeight || 400;
          this.thumbnailHeight = h / 3.5;
        }
      });
    },
    handleThumbnailClick(index) {
      this.activeImageIndex = index;
      this.$nextTick(() => {
        const el = this.$refs['thumbnail-' + index];
        if (el && el[0]) {
          el[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    },
    scrollThumbnails(direction) {
      const list = this.$refs.thumbnailList;
      if (list) {
        const scrollAmount = this.thumbnailHeight * 3; // 一次滚动3张
        list.scrollBy({
          top: direction * scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  }
}
</script>

<style scoped>
.idle-details-container { max-width:1200px; margin:0 auto; padding:20px; background:#fff; min-height:85vh; }

/* 用户信息 */
.user-header { display:flex; align-items:center; gap:15px; padding:20px 0; border-bottom:1px solid #eee; margin-bottom:30px; }
.user-details { display:flex; flex-direction:column; gap:5px; }
.user-name { font-size:18px; font-weight:600; color:#333; }
.join-date { font-size:14px; color:#666; }

/* 主内容 */
.main-content { display:flex; gap:40px; margin-bottom:40px; flex-wrap: wrap; max-width: 100%; box-sizing: border-box;}
.images-section { display:flex; gap:15px; align-items:flex-start;flex: 0 0 420px;}
.thumbnail-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
  max-height: 400px;
}
.thumbnail {width: 80px; aspect-ratio: 1 / 1; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; object-fit: cover; flex-shrink: 0;  }
.thumbnail:hover { border-color:#667eea; }
.thumbnail.active {border-color: #667eea; box-shadow: 0 0 5px rgba(102,126,234,0.5);}
.thumbnail-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 400px; /* 和主图等高 */
  overflow: hidden;
}
.main-image {
  width: 420px;       /* 固定宽度 */
  height: 420px;      /* 固定高度 */
  background-color: #f5f5f5; /* 灰色填充 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  border: 1px solid #eee;  /* 可选：加一条边框，淘宝风 */
}
.main-image .el-image { width:100%; height:100%; border-radius:12px; object-fit:contain; }


/* 右侧详细信息 */
.details-section {flex: 1; min-width: 0;}
.product-title { font-size:28px; font-weight:700; color:#333; margin-bottom:5px; }
.price-section { margin-bottom:30px; padding:20px 0; border-bottom:1px solid #eee; }
.current-price { font-size:32px; font-weight:700; color:#e74c3c; margin-bottom:5px; }
/*.original-price { font-size:16px; color:#999; text-decoration:line-through; }*/

/* 商品属性 */
.product-attributes { margin-bottom:0px; }
.attribute-item { display:flex; justify-content:flex-start; padding:10px 0;}
.attr-label { width: 80px; font-weight: 600; color: #333; margin-right: 10px;}
.attr-value { color:#666; }

/* 操作按钮 */
.action-buttons { display:flex; gap:15px; margin-bottom:30px; flex-wrap:wrap; }
.btn-buy { background: linear-gradient(135deg,#667eea,#214a96); color:#fff; border:none; height:48px; flex:1; }
.btn-favorite { border:2px solid #667eea; color:#667eea; height:48px; flex:1; }
.status-message { color:#e74c3c; font-weight:600; }

/* 商品描述 */
.product-description { border-top:1px solid #eee; padding-top:0px; }
.product-description h3 { font-size:20px; font-weight:600; color:#333; margin-bottom:0px; }
.description-content { font-size:16px; line-height:1.4; color:#555; }
.description-content p { margin-bottom:12px; }

/* 留言区 */
.comments-section {
  border-top: 1px solid #eee;
  padding-top: 40px;
}

/* 留言区 */
.comments-section {
  border-top: 1px solid #eee;
  padding-top: 40px;
}

/* 留言输入框 */
.comment-form {
  margin-bottom: 30px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 12px;

  display: flex;
  flex-direction: column; /* 输入框在上，按钮在下 */
  gap: 10px;
}

.comment-form textarea {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  resize: none;
  box-sizing: border-box;
}

/* 按钮容器，保证按钮靠右 */
.btn-wrapper {
  width: 100%;
  display: flex;
  justify-content: flex-end; /* 按钮靠右 */
}

/* 按钮样式 */
.btn-send {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg,#667eea,#214a96);
  color: #fff;
  cursor: pointer;
}

.btn-send:hover {
  opacity: 0.9;
}

/* 回复提示 */
.reply-notification {
  background: #e3f2fd;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 15px;

  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #1976d2;
}

.cancel-reply {
  padding: 0 !important;
  font-size: 14px !important;
}

/* 留言列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-card {
  border-radius: 12px;
  padding: 12px;
  background: #f5f5f5;
}

</style>
