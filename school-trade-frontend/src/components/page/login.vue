<template>
  <div class="auth-page">

    <router-link class="back-btn" to="/" aria-label="Home">
      <i class="el-icon-arrow-left"></i><span>Home</span>
    </router-link>

    <div class="auth-card">
      <!-- 左側導流（去註冊） -->
      <aside class="side">
        <div class="side-inner">
          <img class="bag" :src="logo" alt="BAG2BAG logo" />
          <div class="ask">New here?<br> <strong>Sign up!</strong></div>
          <router-link class="cta" to="/sign-in">Sign up →</router-link>
        </div>
      </aside>

      <div class="ring"></div>

      <!-- 右側表單 -->
      <section class="form-wrap">
        <h1 class="title">Log in</h1>

        <div class="field">
          <label>UPI</label>
          <el-input v-model.trim="form.UPI" placeholder="e.g. abcd123" />
        </div>

        <div class="field">
          <label>Password</label>
          <el-input v-model.trim="form.password" show-password />
        </div>

        <div class="actions">
          <el-button type="primary" class="submit" @click="login">Login</el-button>
          <router-link class="ghost" to="/sign-in">Create account</router-link>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Logo from '@/assets/logo.png'
export default {
  name: 'login',
  data () {
    return {
      logo: Logo,
      form: { UPI: '', password: '' }
    }
  },
  methods: {
    async login () {
      if (!this.form.UPI || !this.form.password) {
        this.$message.error('please enter password and UPI');
        return;
      }

      const payload = {
        UPI: (this.form.UPI || '').trim(),
        userPassword: this.form.password   // 密碼不要 trim 比較安全
      };

      try {
        const res = await this.$api.userLogin(payload);

        // 注意：你的 request.js 攔截器已把 axios response 簡化成 response.data
        const body = res;   // 千萬不要再寫 res.data

        // 兼容兩種格式：
        // A) { status_code:1, data:{...} }
        // B) { data:{...} } 或直接 {...user}
        const success =
            (body && body.status_code === 1) ||
            (body && body.data) ||
            (body && (body.id || body.accountNumber || body.upi));

        const user = (body && body.data) ? body.data : body;

        if (success) {
          if (user && user.signInTime && typeof user.signInTime === 'string') {
            user.signInTime = user.signInTime.substring(0, 10);
          }
          this.$globalData.userInfo = user;
          this.$router.replace({ path: '/index' }); // 登入成功導向首頁
        } else {
          const msg =
              (body && body.msg) ? body.msg :
                  (body && body.message) ? body.message :
                      (body && typeof body.data === 'string') ? body.data :
                          'Fail';
          this.$message.error(msg);
        }
      } catch (e) {
        console.error(e);
        this.$message.error('Network Fail');
      }
    }
  }
  ,


  goBack () {
    if (window.history.length > 1) {
      this.$router.back()
    } else {
      this.$router.push('/')   // 沒有歷史時回首頁
    }
  }
}
</script>

<style scoped>
:root { --nav:#0c1240; --line:#1597a8; }
.auth-page { display:grid; place-items:center; min-height:calc(100vh - 120px); padding:24px; background:#f5f6f8; }
.auth-card { position:relative; width:min(980px, 96%); min-height:380px; background:#fff; border-radius:20px; box-shadow:0 12px 28px rgba(0,0,0,.08); overflow:hidden; display:grid; grid-template-columns: 360px 1fr; }
.side { background:var(--nav); color:#fff; }
.side-inner { height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:22px; padding:24px; }
.bag { height:80px; width:auto; opacity:.95; display:block; }
.ask { font-size:24px; line-height:1.25; text-align:center; }
.cta { display:inline-block; padding:10px 18px; background:#129fb0; color:#fff; border-radius:9999px; text-decoration:none; font-weight:700; }
.form-wrap { position:relative; padding:34px 32px 28px; }
.title { font-weight:800; color:var(--nav); margin:2px 0 18px; }
.field { margin-bottom:12px; }
.field label { display:block; font-size:13px; color:#374151; margin:0 0 6px 4px; }
::v-deep .el-input__inner { border-radius:9999px; }
.ring { position:absolute; left:300px; top:50%; transform:translateY(-50%); width:220px; height:220px; border-radius:50%; border:14px solid #1597a8; border-left-color:transparent; opacity:.25; }
.actions { display:flex; align-items:center; gap:14px; margin-top:10px; }
.submit { background:#129fb0; border-color:#129fb0; border-radius:9999px; padding:10px 20px; }
.ghost { color:#9da3ae; text-decoration:none; }
.form-wrap { position: relative; z-index: 1; }  /* 表单层在上面 */

@media (max-width: 860px) {
  .auth-card { grid-template-columns: 1fr; }
  .side { order:2; }
  .ring { display:none; }
}

.back-btn {
  position: absolute;
  top: 12px; left: 12px;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 12px;
  background: #fff;
  color: var(--nav);
  border: 1px solid #e5e7eb;
  border-radius: 9999px;
  box-shadow: 0 6px 16px rgba(0,0,0,.08);
  cursor: pointer;
  font-weight: 600;
}
.back-btn:hover { background: #f7f7f9; }
.back-btn:active { transform: translateY(1px); }
.back-btn .el-icon-arrow-left { font-size: 16px; }
</style>
