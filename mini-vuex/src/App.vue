<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <p>{{ $store.state }}</p>
    <p>getters:{{ $store.getters.getName }}</p>
    <button @click="handleClick">点击</button>
    <button @click="syncHandleClick">异步点击</button>-->
  </div>
</template>

<script>
export default {
  name: 'App',
  components: {},
  methods: {
    handleClick() {
      this.$store.commit('changeAge', 22);
    },

    syncHandleClick() {
      this.$store.dispatch('syncChangeAge', 18);
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
