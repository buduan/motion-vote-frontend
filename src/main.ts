import { createApp } from 'vue';
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css';
import './style/index.css';
import App from './App.vue';
import router from './router';
import pinia from './stores';
import { useAuthStore } from './stores/auth';

const app = createApp(App);

app.use(pinia);
app.use(router);

// Register Toaster component globally
app.component('Toaster', Toaster);

// Initialize auth store, restore authentication state
const authStore = useAuthStore();
authStore.init();

app.mount('#app');
