import { defineStore } from 'pinia';

export const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
    name: '计数器',
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
    getCountWithName: (state) => (prefix: string) => `${prefix}: ${state.count}`,
  },
  actions: {
    increment() {
      this.count++;
    },
    decrement() {
      this.count--;
    },
    reset() {
      this.count = 0;
    },
    setCount(value: number) {
      this.count = value;
    },
  },
});
