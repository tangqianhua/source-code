import { vNode } from "./vnode";
/**
 * children可以是String、Array，不管是那个，都是转成VNode
 *
 * @param {string} type 节点
 * @param {object} props 节点属性
 * @param {array | string} children 子节点
 * @returns vnode
 */
function createElement(type, props = {}, children) {
  let key;

  if (props.key) {
    key = props.key;
    delete props.key;
  }

  // 如果是数组，就遍历它，将string类型的转成VNode
  if (Array.isArray(children)) {
    children = children.map((child) => {
      if (typeof child === "string") {
        return vNode(undefined, undefined, undefined, undefined, child);
      }
      return child;
    });
  } else if (typeof children === "string") {
    //  如果是string类型的，就要转成VNode
    // 这是要放入到数组中
    children = [vNode(undefined, undefined, undefined, undefined, children)];
  }

  return vNode(type, key, props, children);
}

export default createElement;
