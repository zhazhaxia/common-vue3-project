import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();
[1, 2, 3].map((item) => {
  console.log(item);
});
app.use(router);
app.use(pinia);
app.mount('#app');
