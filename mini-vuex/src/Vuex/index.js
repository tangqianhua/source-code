import ModulesCollection from './modules';

let _Vue;

class Store {
  constructor(options) {
    const { state = {} } = options;

    this._state = new _Vue({
      data: {
        state: state,
      },
    });

    this.getters = {};
    this.mutations = {};
    this.actions = {};

    this.modules = new ModulesCollection(options);
    installModules(this, this.state, this.modules.root, []);
  }

  get state() {
    return this._state.state;
  }

  commit(mutationName, payload) {
    this.mutations[mutationName].forEach(mutation => {
      mutation(payload);
    });
  }

  dispatch(actionName, payload) {
    this.actions[actionName].forEach(action => {
      action(payload);
    });
  }

  forEachGetters(getters, cb) {
    Object.keys(getters).forEach(key => {
      cb(key, getters[key]);
    });
  }
}

const install = v => {
  _Vue = v;
  v.mixin({
    beforeCreate() {
      const { store = '' } = this.$options;

      if (store) {
        this.$store = store;
      } else {
        this.$store = this.$parent && this.$parent.$store;
      }
    },
  });
};

const installModules = (store, state, rootModules, path) => {
  if (path.length > 0) {
    const currentPath = path.slice(0, -1);
    const parent = currentPath.reduce((root, current) => {
      return root[current];
    }, state);
    _Vue.set(parent, path[path.length - 1], rootModules.state);
  }

  const { getters } = rootModules._rawModule;

  if (getters) {
    Object.keys(getters).forEach(key => {
      Object.defineProperty(store.getters, key, {
        get() {
          return getters[key](rootModules.state);
        },
      });
    });
  }

  let mutations = rootModules._rawModule.mutations;
  if (mutations) {
    Object.keys(mutations).forEach(mutationName => {
      let storeMutations = store.mutations[mutationName] || [];

      storeMutations.push(payload => {
        mutations[mutationName].call(store, rootModules.state, payload);
      });
      store.mutations[mutationName] = storeMutations;
    });
  }

  let actions = rootModules._rawModule.actions;
  if (actions) {
    Object.keys(actions).forEach(actionName => {
      let storeActions = store.actions[actionName] || [];

      storeActions.push(payload => {
        actions[actionName].call(store, store, payload);
      });
      store.actions[actionName] = storeActions;
    });
  }

  if (rootModules._children) {
    Object.keys(rootModules._children).forEach(childrenModuleName => {
      installModules(
        store,
        state,
        rootModules._children[childrenModuleName],
        path.concat(childrenModuleName),
        childrenModuleName,
      );
    });
  }
};

export default { install, Store };
