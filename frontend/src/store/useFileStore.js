import { create } from "zustand";

export const useFileStore = create((set, get) => ({
  tree: null,

  // ✅ Set tree from Yjs
  setTree: (tree) => {
    set({ tree });
  },

  // ✅ Safe recursive search
  getFileById: (id) => {
    const tree = get().tree;

    if (!tree || !id) return null;

    const stack = [tree];

    while (stack.length > 0) {
      const node = stack.pop();

      if (!node) continue;

      if (node.id === id) return node;

      if (node.children && node.children.length > 0) {
        for (let child of node.children) {
          stack.push(child);
        }
      }
    }

    return null;
  },
}));