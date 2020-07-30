class ModulesCollection {
  constructor(options) {
    this.root = this.register(options);
  }

  register(options) {
    let module = {
      state: options.state,
      _rawModule: options,
      _children: {},
    };

    if (options.modules) {
      Object.keys(options.modules).forEach((key) => {
        const childModule = this.register(options.modules[key]);
        module._children[key] = childModule;
      });
    }

    return module;
  }
}

export default ModulesCollection;
