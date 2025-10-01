import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import enLocale from 'element-ui/lib/locale/lang/en'; // 引入英文语言包
import locale from 'element-ui/lib/locale';           // 引入 locale
import $ from 'jquery';
import 'element-ui/lib/theme-chalk/index.css';

import 'babel-polyfill';
import { ensureGlobalChat } from '@/utils/chatBus'
import api from './api/index.js';
Vue.prototype.$api = api;

let globalData={
    userInfo:{
        nickname:''
    }
};
let sta={
    isLogin:false,
    adminName:''
};
Vue.prototype.$sta = sta;

Vue.prototype.$globalData=globalData;

Vue.config.productionTip = false;

Vue.use(ElementUI, {
    size: 'medium'
});

Vue.prototype.$globalData = Vue.observable({
    userInfo: null
});

function hydrateAuthFromStorage () {
    try {
        const raw = sessionStorage.getItem('authUser') || localStorage.getItem('authUser');
        if (!raw) return null;
        const user = JSON.parse(raw);
        if (user) {
            Vue.prototype.$globalData.userInfo = user;
            const uid = String(user.id || user.userId || user.uid || '');
            if (uid) ensureGlobalChat(uid);   // ★ 冪等，不會重複連
        }
        return user;
    } catch (e) {
        return null;
    }
}
hydrateAuthFromStorage();

router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title}`;

    const u = Vue.prototype.$globalData.userInfo;
    const loggedIn = !!(u && (u.id || u.userId || u.uid));

    if (!loggedIn && (to.path === '/me' || to.path === '/message' || to.path === '/release' || to.path === '/order')) {
        api.getUserInfo().then(res => {
            if (res.status_code !== 1) {
                next('/login');
            } else {
                // 你原本的處理
                res.data.signInTime = res.data.signInTime.substring(0, 10);

                // ★ 寫回全域 + 保存到 sessionStorage，刷新後可立即回灌
                Vue.prototype.$globalData.userInfo = res.data;
                try { sessionStorage.setItem('authUser', JSON.stringify(res.data)); } catch (e) {}

                // ★ 建立全域 WS（冪等）
                const uid = String(res.data.id || res.data.userId || res.data.uid || '');
                if (uid) ensureGlobalChat(uid);

                next();
            }
        }).catch(() => {
            next('/login');
        });
    } else {
        next();
    }
});

locale.use(enLocale);
Vue.use(ElementUI);

Vue.config.productionTip = false;

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');
