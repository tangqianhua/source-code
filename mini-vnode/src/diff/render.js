/**
 *  将虚拟dom转换成真实DOM，并挂在到 `target` 中
 *
 * @param {vNode} vNode vNode
 * @param {string | Element} target 目标节点
 * @returns realDOM
 */
function render(vNode, target) {
  let el = createRealElement(vNode);
  let container =
    typeof target === "string" ? document.querySelector(target) : target;

  container && el && container.appendChild(el);

  return el;
}

/**
 * 创建真实的DOM树
 * @param {vNode} vNode vNode
 * @returns {Element} 真实DOM
 */
function createRealElement(vNode) {
  const { type, key, props, children, text } = vNode;

  // 如果有type，说明是元素标签，否则就是文本
  // 给vNode新增一个属性：realDom，用来存储真实的DOM
  if (type) {
    vNode.realDom = document.createElement(type);
    // 给元素添加属性
    setProperties(vNode);

    // 递归子节点，生成DOM
    if (Array.isArray(children)) {
      children.forEach((child) => render(child, vNode.realDom));
    }
  } else {
    vNode.realDom = document.createTextNode(text);
  }

  return vNode.realDom;
}

/**
 * 1: 如果「老的属性」不存在「新的属性中」，就要移除DOM中的「老属性」
 * 2: 将新属性全部放入到DOM中
 *
 * @param {vNode} newVNode 最新的虚拟dom
 * @param {object} oldProps 老的节点属性
 * @returns
 */
function setProperties(newVNode, oldProps = {}) {
  const realDom = newVNode.realDom;
  const newProps = newVNode.props;

  for (const oldPropsKey in oldProps) {
    if (!newProps[oldPropsKey]) {
      realDom.removeAttribute(oldPropsKey);
    }
  }

  let newStyleObj = newProps.style || {};
  let oldStyleObj = oldProps.style || {};
  for (const key in oldStyleObj) {
    if (!newStyleObj[key]) {
      realDom.style[key] = "";
    }
  }

  for (const newPropsKey in newProps) {
    // 要处理一些特殊的属性，比如style、on等等
    switch (newPropsKey) {
      case "style":
        const style = newProps[newPropsKey];
        for (const styleKey in style) {
          realDom.style["color"] = style[styleKey];
        }
        break;
      default:
        realDom.setAttribute(newPropsKey, newProps[newPropsKey]);
        break;
    }
  }
}

export { render };
