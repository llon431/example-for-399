<template>
  <div class="sign-in-container">
    <el-card class="box-card">
      <div class="sign-in-body">
        <div class="sign-in-title">
          <img src="../../assets/logo.png" style="width: 40px; position: relative; top: 13px; right: 6px" />
          <span style="color: #e75c09">账号注册</span>
        </div>

        <el-input
          v-model="userInfo.nickname"
          placeholder="请输入昵称..."
          maxlength="30"
          clearable
          class="sign-in-input"
        >
          <template #prepend>
            <el-icon><UserFilled /></el-icon>
          </template>
        </el-input>

        <el-input
          v-model="userInfo.accountNumber"
          placeholder="请输入UPI..."
          maxlength="11"
          clearable
          class="sign-in-input"
        >
          <template #prepend>
            <el-icon><Iphone /></el-icon>
          </template>
        </el-input>

        <el-input
          v-model="emailCode"
          placeholder="请输入验证码..."
          clearable
          class="sign-in-input"
        >
          <template #prepend>
            <el-icon><Message /></el-icon>
          </template>
          <template #append>
            <el-button @click="sendCode" :disabled="codeBtnDisabled">{{ codeBtnText }}</el-button>
          </template>
        </el-input>

        <el-input
          v-model="userInfo.userPassword"
          placeholder="请输入密码..."
          show-password
          maxlength="16"
          clearable
          class="sign-in-input"
        >
          <template #prepend>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>

        <el-input
          v-model="userPassword2"
          placeholder="请再次输入密码..."
          show-password
          maxlength="16"
          clearable
          class="sign-in-input"
          @keyup.enter="signIn"
        >
          <template #prepend>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>

        <div class="sign-in-submit">
          <el-button type="primary" @click="signIn">提交</el-button>
          <el-button type="primary" @click="toLogin" style="margin-left: 20px">返回登录</el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { UserFilled, Iphone, Message, Lock } from '@element-plus/icons-vue'

export default defineComponent({
  name: 'SignIn',
  components: { UserFilled, Iphone, Message, Lock },
  data() {
    return {
      codeBtnText: '点击获取',
      codeBtnDisabled: false,
      emailCode: '',
      userPassword2: '',
      countdown: 60,
      timer: null,
      userInfo: {
        accountNumber: '',
        userPassword: '',
        nickname: ''
      }
    }
  },
  methods: {
    toLogin() {
      this.$router.replace({ path: '/login' })
    },
    sendCode() {
      const upi = this.userInfo.accountNumber?.trim();
      if (!upi) {
        this.$message.error('请先输入UPI！');
        return;
      }

      this.$api.getEmailCode({ upi })
        .then((res) => {
          if (res.status_code===1) {
            this.$message.success(res.msg || '验证码已发送');

            this.codeBtnDisabled = true;
            this.countdown = 60;
            this.codeBtnText = this.countdown + 's';
            this.timer && clearInterval(this.timer);

            this.timer = setInterval(() => {
              this.countdown--;
              this.codeBtnText = this.countdown + 's';
              if (this.countdown <= 0) {
                clearInterval(this.timer);
                this.timer = null;
                this.countdown = 60;
                this.codeBtnDisabled = false;
                this.codeBtnText = '点击获取';
              }
            }, 1000);
          } else {
            this.$message.error(res.msg || '验证码发送失败');
          }
        })
        .catch((e) => {
          this.$message.error('验证码发送失败');
          console.error('发送验证码出错:', e);
        });
    },



    signIn() {
      if (
        this.userInfo.accountNumber &&
        this.userInfo.userPassword &&
        this.userInfo.nickname &&
        this.emailCode
      ) {
        if (this.userInfo.userPassword !== this.userPassword2) {
          this.$message.error('两次输入的密码不相同！')
        } else {
          this.$api
            .signIn({ ...this.userInfo, code: this.emailCode })
            .then((res) => {
              if (res.status_code === 1) {
                this.$message({ message: '注册成功！', type: 'success' })
                this.$router.replace({ path: '/login' })
              } else {
                this.$message.error(res.msg)
              }
            })
            .catch((e) => {
              console.log(e)
              this.$message.error('注册失败，网络异常！')
            })
        }
      } else {
        this.$message.error('请完整填写信息！')
      }
    }
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
})
</script>
<style scoped>
.sign-in-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #f1f1f1;
}

.sign-in-body {
  padding: 30px;
  width: 300px;
  height: 100%;
}

.sign-in-title {
  padding-bottom: 30px;
  text-align: center;
  font-weight: 600;
  font-size: 20px;
  color: #409EFF;
}

.sign-in-input {
  margin-bottom: 20px;
}
.sign-in-submit{
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
.login-container{
  padding: 0 10px;
}
.login-text{
  color: #409EFF;
  font-size: 16px;
  cursor:pointer;
}

</style>
