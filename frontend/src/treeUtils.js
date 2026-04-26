export const DEFAULT_TREE = {
  name: "root",
  children: [
    {
      name: "child1",
      children: [
        { name: "child1-child1", data: "c1-c1 Hello" },
        { name: "child1-child2", data: "c1-c2 JS" },
      ],
    },
    { name: "child2", data: "c2 World" },
  ],
};

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function sanitizeTree(node) {
  const result = { name: node.name };

  if (Array.isArray(node.children)) {
    result.children = node.children.map(sanitizeTree);
  } else {
    result.data = node.data ?? "";
  }

  return result;
}

export function updateNodeByPath(node, path, updater) {
  if (path.length === 0) {
    return updater(node);
  }

  const [head, ...rest] = path;
  if (!Array.isArray(node.children)) {
    return node;
  }

  return {
    ...node,
    children: node.children.map((child, index) =>
      index === head ? updateNodeByPath(child, rest, updater) : child
    ),
  };
}

export function addChildToNode(node) {
  const newChild = { name: "New Child", data: "Data", isCollapsed: false };

  if (Array.isArray(node.children)) {
    return {
      ...node,
      children: [...node.children, newChild],
    };
  }

  return {
    name: node.name,
    isCollapsed: node.isCollapsed ?? false,
    children: [newChild],
  };
}
