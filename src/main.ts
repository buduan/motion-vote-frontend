import { createApp } from 'vue';
import './style/index.css';
import App from './App.vue';
import router from './router';
import pinia from './stores';
import { useAuthStore } from './stores/auth';

const app = createApp(App);

app.use(pinia);
app.use(router);

// 初始化auth store，恢复认证状态
const authStore = useAuthStore();
authStore.init();

app.mount('#app');
