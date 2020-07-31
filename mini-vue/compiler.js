class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;

    if (this.el) {
      const fragment = this.nodeToFragment(this.el);
      // 编译
      this.compile(fragment);
      // 放回去
      this.el.appendChild(fragment);
    }
  }

  /**************** 辅助方法 ****************/
  isElementNode(node) {
    return node.nodeType === 1;
  }

  isDirective(name) {
    return name.startsWith("v-");
  }

  /**************** core fn ****************/

  // 节点转成代码片段
  nodeToFragment(el) {
    const fragment = document.createDocumentFragment();
    let first;

    while ((first = el.firstChild)) {
      fragment.appendChild(first);
    }
    return fragment;
  }

  compile(fragment) {
    const childrenNodes = fragment.childNodes;

    Array.from(childrenNodes).forEach((node) => {
      // 如果是node节点
      if (this.isElementNode(node)) {
        // 编译阶段元素
        this.compileElement(node);
        // 如果有子节点，就递归操作
        if (node.hasChildNodes) {
          this.compile(node);
        }
      } else {
        //如果是文本
        this.compileText(node);
      }
    });
  }
  compileElement(node) {
    // 获取元素的属性
    const attributes = node.attributes;

    Array.from(attributes).forEach((attr) => {
      //比如 name = v-model  ， value = message
      const { name, value } = attr;
      // 如果是指令
      if (this.isDirective(name)) {
        //expression = message
        const expression = value;
        // type = model
        const [, type] = name.split("-");
        // 调用CompileFn.model()
        CompileFn[type](node, this.vm, expression);
      }
    });
  }
  compileText(node) {
    const textContent = node.textContent;
    const reg = /\{\{([^}]+)\}\}/g;

    if (reg.test(textContent)) {
      CompileFn["text"](node, this.vm, textContent);
    }
  }
}

const CompileFn = {
  // 处理文本 {{}}
  text(node, vm, expression) {
    // 获取文本更新方法
    const update = this.update.textUpdate;
    const _expression = this.replaceStatement(vm, expression);

    // 新增一个Watcher
    expression.replace(/\{\{([^}]+)\}\}/g, (...arg) => {
      new Watcher(vm, arg[1], (newValue) => {
        update(node, this.replaceStatement(vm, expression));
      });
    });

    update(node, _expression);
  },

  // 处理v-model
  model(node, vm, expression) {
    // 获取model方法
    const update = this.update.modelUpdate;

    // 新增一个Watcher
    new Watcher(vm, expression, (newValue) => {
      update(node, this.getValue(vm, expression));
    });

    node.addEventListener("input", (e) => {
      const value = e.target.value;
      this.setValue(vm, expression, value);
    });

    // 调用mode方法
    update(node, this.getValue(vm, expression));
  },

  getValue(vm, expression) {
    const exprs = expression.split(".");
    return exprs.reduce((pre, next) => pre[next], vm.$data);
  },

  // 替换 {{语法}}
  replaceStatement(vm, expression) {
    return expression.replace(/\{\{([^}]+)\}\}/g, (...arg) => {
      return this.getValue(vm, arg[1]);
    });
  },

  setValue(vm, expression, value) {
    const exprs = expression.split(".");
    return exprs.reduce((pre, next, index) => {
      if (index === exprs.length - 1) {
        return (pre[next] = value);
      }
      return pre[next];
    }, vm.$data);
  },

  // 统一的修改数据
  update: {
    // 文本更新
    textUpdate(node, value) {
      node.textContent = value;
    },
    // v-model更新
    modelUpdate(node, value) {
      node.value = value;
    },
  },
};
