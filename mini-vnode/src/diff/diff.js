/**
 * 1: 层级比较，当没有新节点的时候，就要移除老节点
 * 2: 层级比较，当节点相同的时候，就要看`属性`跟`子节点`是否相同。
 * 3: 层级比较，当节点内容都是String或者Number的时候，先比较是否相等，在决定要不要替换。
 * 4: 层级比较，当以前都不成立的时候，说明节点的「type」不一样，直接替换
 *
 * 属性不同的时候，就要就要往补丁包里面添加{type: 'ATTRS', attr: {新的属性1: value1, 新的属性2: value2}}
 * 文本不同的时候，就要就要往补丁包里面添加{type: 'TEXT', text: newText}
 * 没有新节点的时候，就要就要往补丁包里面添加{type: 'REMOVE', index: 节点的层级}
 * 节点的Type不一样的时候，就要用新节点替换老节点{type: 'REPLACE', {newNode: 新节点}}
 *
 * @param oldNode 老的节点
 * @param newNode 新的节点
 * @returns patch `patch是补丁包，里面存放的是变化的节点信息`
 */

let INDEX = 0; // 从第0个开始比较
function diff(oldNode, newNode) {
  // 补丁包
  let patch = {};

  walk(oldNode, newNode, INDEX, patch);

  return patch;
}

const ATTR = "ATTR";
const TEXT = "TEXT";
const REMOVE = "REMOVE";
const REPLACE = "REPLACE";
/**
 * 1: 如果没有新节点，说明被删除了
 * 2: 如果两个节点都是String，那么直接用新节点
 * 3: 如果两个节点的类型「type」是一样的，说明是同一个元素，就要比较属性
 *    3-1: 如果有子节点，就要递归操作
 * 4: 如果以上都不成立，那就直接替换，用新节点替换老的节点
 *
 * @param oldNode 老的节点
 * @param newNode 新的节点
 * @param index 当前层级, 存放在全局
 * @param patch 补丁包
 * @returns void
 */
function walk(oldNode, newNode, index, patch) {
  let currentPatch = [];

  // 如果没有新节点，说明被删除了
  if (!newNode) {
    currentPatch.push({ type: REMOVE, index: index });
  } else if (!oldNode.children && !newNode.children) {
    if (oldNode.text !== newNode.text) {
      currentPatch.push({ type: TEXT, text: newNode.text });
    }
  } else if (oldNode.type === newNode.type) {
    // 如果节点相同
    // 比较属性
    const newAttrs = diffAttr(oldNode.props, newNode.props);
    // 如果有不同的属性
    if (Object.keys(newAttrs).length > 0) {
      // 就放入到当前函数的补丁包中
      currentPatch.push({ type: ATTR, attr: newAttrs });
    }

    // 处理子节点
    if (oldNode.children && newNode.children) {
      diffChildren(oldNode.children, newNode.children, index, patch);
    } else if (!newNode.children) {
      currentPatch.push({ type: REMOVE, index: index });
    } else if (!oldNode.children && newNode.children) {
      currentPatch.push({ type: REPLACE, newNode });
    }
  } else {
    // 节点的type不一样
    currentPatch.push({ type: REPLACE, newNode });
  }

  // 如果当前的补丁包有数据
  if (currentPatch.length) {
    // 就要放入到总的补丁包中
    patch[index] = currentPatch;
  }
}

/**
 * 如果oldAttr中key对应的value跟newAttr中key对应的value不一样，说明当前key对应的value被修改了
 * 如果新的属性中的key不存在oldAttr中，说明这个key是新增的
 *
 * @param oldAttr 老的属性
 * @param newAttr 新的属性
 * @returns attrs 被修改的属性/新增的属性
 */
function diffAttr(oldAttr, newAttr) {
  let attrs = {};

  for (const key in oldAttr) {
    if (oldAttr[key] !== newAttr[key]) {
      attrs[key] = newAttr[key];
    }
  }

  for (const key in newAttr) {
    if (!oldAttr.hasOwnProperty(key)) {
      attrs[key] = newAttr[key];
    }
  }

  if (oldAttr && newAttr) {
    let newStyleObj = newAttr.style || {};
    let oldStyleObj = oldAttr.style || {};
    for (const key in oldStyleObj) {
      if (!newStyleObj[key]) {
        attrs.style[key] = "";
      }
    }
  }

  return attrs;
}

/**
 *
 * @param oldChildren 老的子节点
 * @param newChildren 新的子节点
 * @param index 当前节点的层级
 * @param patch 总补丁
 * @returns void
 */
function diffChildren(oldChildren, newChildren, index, patch) {
  oldChildren.forEach((children, idx) => {
    walk(children, newChildren[idx], ++INDEX, patch);
  });
}

export { diff };
