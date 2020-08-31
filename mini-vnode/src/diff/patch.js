import { Element } from "./vnode";
import { render } from "./render";
/**
 *
 * @param node dom节点
 * @param patchs 要修改的补丁
 * @returns
 */
let index = 0; // 当前节点的层级
function patch(node, patchs) {
  walk(node, patchs);
}

function walk(node, patchs) {
  const currentIndex = index++;
  const currentPatch = patchs[currentIndex];
  const childNodes = node.childNodes;

  if (currentPatch) {
    doPatch(node, currentPatch);
  }

  childNodes.forEach((child) => {
    walk(child, patchs);
  });
}

function doPatch(node, patch) {
  patch.forEach((p) => {
    switch (p.type) {
      case "ATTR":
        Object.keys(p.attr).forEach((key) => {
          setAttr(node, key, p.attr[key]);
        });
        break;
      case "TEXT":
        node.textContent = p.text;
        break;
      case "REPLACE":
        let newNode =
          p.newNode instanceof Element
            ? render(p.newNode)
            : document.textContent(p.newNode);

        node.parentNode.replaceChild(newNode, node);
        break;
      case "REMOVE":
        node.parentNode.removeChild(node);
        break;

      default:
        break;
    }
  });
}

function setAttr(element, key, value) {
  switch (key) {
    // 如果属性是value, 就要判断标签是不是input/textarea
    case "value":
      const nodeName = element.nodeName.toUpperCase();
      if (nodeName === "INPUT" || nodeName === "TEXTAREA") {
        element.value = value;
      } else {
        element.setAttribute(key, value);
      }
      break;
    // 如果是是style，就要设置样式
    case "style":
      setStyle(element, value);
      break;
    // 其余的可以设置默认属性
    default:
      element.setAttribute(key, value);
      break;
  }
}

function setStyle(element, style) {
  for (const key in style) {
    element.style[key] = style[key];
  }
}

export { patch };
