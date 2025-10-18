import { createApp } from 'vue';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import './style/index.css';
import './style/toast.css';
import App from './App.vue';
import router from './router';
import pinia from './stores';
import { useAuthStore } from './stores/auth';
import { getToastOptions } from './utils/toast';

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(Toast, getToastOptions());

// 初始化auth store，恢复认证状态
const authStore = useAuthStore();
authStore.init();

app.mount('#app');
