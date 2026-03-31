import { create } from "zustand";

export const useEditorStore = create((set, get) => ({
  openTabs: [],
  activeFileId: null,

  // ✅ Open file (no duplicates + always activate)
  openFile: (fileId) => {
    if (!fileId) return;

    set((state) => {
      const exists = state.openTabs.includes(fileId);

      return {
        openTabs: exists
          ? state.openTabs
          : [...state.openTabs, fileId],
        activeFileId: fileId,
      };
    });
  },

  // ✅ Close file safely
  closeFile: (fileId) => {
    set((state) => {
      const newTabs = state.openTabs.filter((id) => id !== fileId);

      let newActive = state.activeFileId;

      // If closing active tab → switch to last tab
      if (state.activeFileId === fileId) {
        newActive = newTabs.length > 0 ? newTabs[newTabs.length - 1] : null;
      }

      return {
        openTabs: newTabs,
        activeFileId: newActive,
      };
    });
  },

  // ✅ Set active file (only if exists)
  setActiveFile: (fileId) => {
    const { openTabs } = get();

    if (!fileId) return;

    if (!openTabs.includes(fileId)) return;

    set({ activeFileId: fileId });
  },

  // ✅ Reset editor (useful later)
  resetEditor: () => {
    set({
      openTabs: [],
      activeFileId: null,
    });
  },
}));