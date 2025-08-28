import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus, { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/main.css'

// ⬇️ 你的 api 導入（確保 api 有 default export）
import api from './api/index.js'

const app = createApp(App)

app.use(router)
app.use(ElementPlus)

// 在 Vue 3 裡用 globalProperties 掛到 this 上（供 Options API 用）
app.config.globalProperties.$api = api
app.config.globalProperties.$message = ElMessage

app.mount('#app')
