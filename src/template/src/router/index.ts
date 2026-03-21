// src/projects/test1/src/router/index.ts
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import { routerHashFixQuery } from '@common/utils/router-hash-fix-query';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue'),
  },
];
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default routerHashFixQuery(router);
