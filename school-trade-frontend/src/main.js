import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import enLocale from 'element-ui/lib/locale/lang/en'; // 引入英文语言包
import locale from 'element-ui/lib/locale';           // 引入 locale
import $ from 'jquery';
import 'element-ui/lib/theme-chalk/index.css';

import 'babel-polyfill';

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


router.beforeEach((to, from, next) => {
    document.title = `${to.meta.title}`;
    // console.log(to.path,'userInfo:',Vue.prototype.$globalData.userInfo);
    const nickname = Vue.prototype.$globalData.userInfo.nickname;
    if (!nickname
        &&(to.path === '/me'
        || to.path === '/message'
        || to.path === '/release'
        || to.path === '/order')) {
        api.getUserInfo().then(res=>{
           console.log('getUserInfo:',res);
           if(res.status_code!==1){
               next('/login');
           }else {
               res.data.signInTime=res.data.signInTime.substring(0,10);
               Vue.prototype.$globalData.userInfo=res.data;
               next();
           }
        }).catch(e=>{
            next('/login');
        });

    }else{
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
