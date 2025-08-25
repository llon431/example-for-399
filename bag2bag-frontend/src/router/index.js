import { createRouter, createWebHistory } from 'vue-router'

const Home = () => import('../pages/Home.vue')
const Profile = () => import('../pages/Profile.vue')  //  新增的 Profile 页面

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/profile', name: 'profile', component: Profile },  //  添加 profile 路由
  ],
  scrollBehavior: () => ({ top: 0 }),
})

