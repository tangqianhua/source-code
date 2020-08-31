class Element {
  constructor(type, key, props, children, text) {
    this.type = type;
    this.props = props;
    this.key = key;
    this.children = children;
    this.text = text;
  }
}

/**
 * @param {string} type 节点
 * @param {any} key key
 * @param {object} props 属性
 * @param {array | undefined} children 子节点
 * @param {any} text 文本
 * @returns vnode对象描述
 */
function vNode(type, key, props, children, text) {
  return new Element(type, key, props, children, text);
}

export { Element, vNode };
