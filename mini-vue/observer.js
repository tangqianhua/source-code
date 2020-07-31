class Observer {
  constructor(data) {
    this.data = data;
    // 对data做数据劫持
    this.observer(data);
  }

  observer(data) {
    // 如果data是纯对象
    if (typeof data !== "object" || data === null) {
      return data;
    }

    //如果是数组, 就要修改它的原型指向
    if (Array.isArray(data)) {
      data.__proto__ = this.reseatArray();
    }

    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key]);
      // 对value也要做数据劫持，因为value可能也是个对象, 深度递归
      this.observer(data[key]);
    });
  }

  defineReactive(data, key, value) {
    let dep = new Dep();
    Object.defineProperty(data, key, {
      configurable: true,
      enumerable: true,
      get: () => {
        Dep.target && dep.addSub(Dep.target);
        return value;
      },
      set: (newValue) => {
        if (newValue !== value) {
          value = newValue;
          this.observer(value);
          dep.notify();
        }
      },
    });
  }

  // 重写数组API
  reseatArray() {
    const oldArrayPrototype = Array.prototype;
    const arrProto = Object.create(oldArrayPrototype);
    ["push", "pop", "shift", "unshift"].forEach((methodName) => {
      arrProto[methodName] = function () {
        // 这里写更新视图的操作

        // 调用原生 数组的api
        oldArrayPrototype[methodName].apply(this, arguments);
      };
    });

    return arrProto;
  }
}
