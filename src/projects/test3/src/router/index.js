'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// src/projects/test1/src/router/index.ts
var vue_router_1 = require('vue-router');
var routes = [
  {
    path: '/',
    name: 'Home',
    component: function () {
      return Promise.resolve().then(function () {
        return require('../views/Home.vue');
      });
    },
  },
  {
    path: '/about',
    name: 'About',
    component: function () {
      return Promise.resolve().then(function () {
        return require('../views/About.vue');
      });
    },
  },
];
var router = (0, vue_router_1.createRouter)({
  history: (0, vue_router_1.createWebHashHistory)(),
  routes: routes,
});
exports.default = router;
