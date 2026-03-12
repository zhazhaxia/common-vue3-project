'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var vue_1 = require('vue');
var pinia_1 = require('pinia');
var App_vue_1 = require('./App.vue');
var router_1 = require('./router');
var app = (0, vue_1.createApp)(App_vue_1.default);
var pinia = (0, pinia_1.createPinia)();
// qaaa();
// let b
app.use(router_1.default);
app.use(pinia);
app.mount('#app');
