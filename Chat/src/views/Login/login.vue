<script setup>
import { Form, Toast } from 'vant'
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore.js'
import 'vant/es/toast/style'
import router from '@/router'
import { loginAPI } from '@/apis/user'

const userStore = useUserStore()

const qqid = ref('3210884103')
const password = ref('123456')
const checked = ref(true)

const onSubmit = async () => {
  if (!checked.value) {
    alert('请同意以下协议')
    return
  }

  try {
    const payload = { qqid: qqid.value, password: password.value }
    const res = await loginAPI(payload)
    // 假設後端回 { code: 0, data: {...}, msg: 'ok' }
    if (res?.code === 0) {
      // 存一份到 pinia（依你的 store 結構調整）
      userStore.userInfo = { qqid: qqid.value }  // 簡單示例
      router.replace('/home')
    } else {
      alert(res?.msg || '账号或密码错误！')
    }
  } catch (err) {
    console.error('登录错误', err)
    alert('登录过程中发生错误，请重试！')
  }
}

const isprove = () => {
  console.log(checked.value)
}
</script>

<template>
  <h1>登录</h1>
  <Form>
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field v-model="qqid" name="qqid" label="登录账号" placeholder="登录账号"
                   :rules="[{ required: true, message: '请填写登录QQ账号' }]" />
        <van-field v-model="password" type="password" name="password" label="密码" placeholder="密码"
                   :rules="[{ required: true, message: '请填写密码' }]" />
      </van-cell-group>

      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit">登录</van-button>
      </div>

      <div>
        <van-checkbox v-model="checked" class="ischecked" @click="isprove">
          已经阅读并同意服务协议和隐私保护指引
        </van-checkbox>
      </div>

      <div class="other">
        <!-- 更推薦用 RouterLink 包住 Button 或使用 :to + router 屬性 -->
        <RouterLink to="/register">
          <van-button round type="success">注册账号</van-button>
        </RouterLink>
        <RouterLink to="/rePassword">
          <van-button round type="success" class="rePassword">忘记密码</van-button>
        </RouterLink>
      </div>
    </van-form>
  </Form>
</template>

<style scoped>
h1 { text-align: center; }
.ischecked { padding-left: 35px; }
.other { margin-top: 20px; display: flex; align-items: center; gap: 12px; }
.rePassword { margin-left: 30px; }
</style>
