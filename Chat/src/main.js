// import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
const socket = new WebSocket('ws://localhost:3001');

socket.onopen = () => {
    console.log('WS connected');
    socket.send('hello');
};

socket.onmessage = (e) => {
    console.log('WS message:', e.data);
};

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router )
pinia.use(piniaPluginPersistedstate)

app.mount('#app')
