import Vue from 'vue';
import App from './App.vue';
import Vuex from './Vuex/index';
Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    name: 'tqh',
    age: 26,
  },
  getters: {
    getName(state) {
      return state.name;
    },
  },
  mutations: {
    changeAge(state, payload) {
      state.age = payload;
    },
  },
  actions: {
    syncChangeAge({ commit }, payload) {
      setTimeout(() => {
        commit('changeAge', payload);
      }, 1000);
    },
  },
});

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(App),
}).$mount('#app');
