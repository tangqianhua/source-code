class Watcher {
  constructor(vm, expression, cb) {
    // 上下文
    this.vm = vm;
    // 表达式
    this.expression = expression;
    // 回调函数
    this.cb = cb;
    // 初始化的时候，要存储下当前的值，这样才可以跟修改后的值做对比
    this.value = this.get();
  }

  getValue(vm, expression) {
    const exprs = expression.split(".");
    return exprs.reduce((pre, next) => pre[next], vm.$data);
  }

  get() {
    Dep.target = this;
    const value = this.getValue(this.vm, this.expression);
    Dep.target = null;
    return value;
  }

  // 更新
  update() {
    // 获取新的值
    const newValue = this.getValue(this.vm, this.expression);
    // 获取旧的值，旧的值是在初始化的时候就存储的
    const oldValue = this.value;

    if (newValue !== oldValue) {
      this.cb(newValue);
    }
  }
}
