import Vue from 'vue';
import Router from 'vue-router';

const originalReplace = Router.prototype.replace;
Router.prototype.replace = function replace(location) {
    return originalReplace.call(this, location).catch(err => err);
};
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err);
};

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/index'
        },
        {
            path: '/index',
            component: () => import('../components/page/index.vue'),
            meta: { title: 'Bag2Bag' }
        },
        {
            path: '/search',
            component: () => import('../components/page/search.vue'),
            meta: { title: '闲置二手物品 | Bag2Bag' }
        },
        {
            path: '/me', name: 'me',
            component: () => import('../components/page/me.vue'),
            meta: { title: 'Bag2Bag | You' }
        },
        { path: '/user/:id', name: 'user-profile',
            component: () => import('../components/page/me.vue'),
            props: true,
            meta: { title: 'Bag2Bag | User profile' }
        },
        {
            path: '/message',
            component: () => import('../components/page/message.vue'),
            meta: { title: 'Bag2Bag | Message' }
        },
        {
            path: '/release',
            component: () => import('../components/page/release.vue'),
            meta: { title: 'Bag2Bag | Post Item' }
        },
        {
            path: '/details',
            component: () => import('../components/page/idle-details.vue'),
            meta: { title: 'Bag2Bag | Item Details' }
        },
        {
            path: '/order',
            component: () => import('../components/page/order.vue'),
            meta: { title: '订单详情 | Bag2Bag' }
        },
        {
            path: '/login',
            component: () => import('../components/page/login.vue'),
            meta: { title: 'Bag2Bag | Login' }
        },
        {
            path: '/sign-in',
            component: () => import('../components/page/sign-in.vue'),
            meta: { title: 'Bag2Bag | Sign In' }
        },
        {
            path: '/login-admin',
            component: () => import('../components/page/login-admin.vue'),
            meta: { title: '后台登陆' }
        },
        {
            path: '/platform-admin',
            component: () => import('../components/page/platform-admin.vue'),
            meta: { title: '后台管理' }
        },
        // 新增 About Us 页面
        {
            path: '/about',
            component: () => import('../components/page/aboutus.vue'),
            meta: { title: 'Bag2Bag | About Us' }
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
});

