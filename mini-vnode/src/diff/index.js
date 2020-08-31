import VueCompile from "../vueCompile";
import h from "./h";
import { render } from "./render";
import { diff } from "./diff";
import { patch } from "./patch";
const template = `
  <div id="div" class="text" style="color: red; fontSize: 12px;">
    文本
    <span class="text">
      span文本
    </span>
  </div>
`;

/**
 * ast  抽象语法树
 * @param {tag} string 标签
 * @param {attrsMap} object 属性
 * @param {parent} object 属性
 */
const { ast } = VueCompile.compile(template);
const { tag, attrsMap, children, type, text } = ast;
/**
 * 将 attributes 转化为 properties
 *
 * @param attrs 属性
 */
function convertAttrsToProps(attrs) {
  const attributes = Object.keys(attrs).reduce((p, k) => {
    return {
      ...p,
      [k]: attrs[k],
    };
  }, {});

  // "color: red; fontSize: 12px;"
  if (attributes.style) {
    attributes.style = attributes.style
      .split(";")
      .filter((attr) => attr)
      .reduce((pre, next) => {
        const [key = "", value = ""] = next
          .split(":")
          .map((value) => value.trim());
        return {
          ...pre,
          [key]: value,
        };
      }, {});
  }

  return attributes;
}

function createElementByType(tag, attrsMap, children = [], type, text = "") {
  attrsMap = convertAttrsToProps(attrsMap);
  let vNode;
  switch (type) {
    case 1:
      const vNodeChildren = children.map((child) => {
        const {
          tag = "",
          attrsMap = "",
          children = [],
          type,
          text = "",
        } = child;
        return createElementByType(tag, attrsMap, children, type, text);
      });
      vNode = h(tag, attrsMap, vNodeChildren);
      break;
    case 3:
      vNode = text;
      break;
    default:
      break;
  }

  return vNode;
}

const _vNode = createElementByType(tag, attrsMap, children, type, text);

const vNode = h(
  "div",
  { id: "div", class: "test", style: { color: "red", fontSize: "12px" } },
  ["文本", h("span", { class: "text" }, "span文本")]
);

const vNode2 = h("div", { id: "div", class: "test", style: { color: "red" } }, [
  "文本",
  h("span", { class: "text" }),
]);
console.log(vNode);

const patchs = diff(vNode, vNode2);
const realDom = render(vNode, "#app");

patch(realDom, patchs);
